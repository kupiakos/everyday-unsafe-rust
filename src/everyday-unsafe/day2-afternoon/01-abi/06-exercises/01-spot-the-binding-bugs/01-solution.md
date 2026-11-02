
# Solution

- `#[repr(C)]` on `img_opts`, and `Option` for the nullable callback.
- `c_int` for `int`, and `usize` for `size_t`.
- Most of these pass tests on x86-64. Only the layout bug is likely to fail one.

```rust,editable
#![allow(non_camel_case_types, dead_code)]
use std::ffi::{c_int, c_void};
use std::mem::MaybeUninit;

pub type img_progress_fn =
    unsafe extern "C" fn(user: *mut c_void, percent: c_int);

#[repr(C)] // Fix 1: C's field order and padding.
pub struct img_opts {
    pub max_width: u32,
    pub progress: Option<img_progress_fn>, // Fix 2: C may store NULL here.
    pub user: *mut c_void,
}

unsafe extern "C" {
    pub fn img_default_opts(out: *mut img_opts);
    pub fn img_is_valid(buf: *const u8, len: usize) -> c_int; // Fix 3
    pub fn img_decoded_size(buf: *const u8, len: usize) -> usize; // Fix 4
    pub fn img_decode(
        buf: *const u8,
        len: usize,
        opts: *const img_opts,
        out: *mut u8,
        out_len: usize,
    ) -> c_int;
}

pub fn default_opts() -> img_opts {
    let mut opts = MaybeUninit::<img_opts>::uninit();
    // SAFETY: `opts` is valid for writes of one `img_opts`, and
    // `img_default_opts` initializes every field.
    unsafe {
        img_default_opts(opts.as_mut_ptr());
        opts.assume_init()
    }
}

pub fn is_valid(buf: &[u8]) -> Result<bool, c_int> {
    // SAFETY: `buf` is valid for reads of `buf.len()` bytes.
    match unsafe { img_is_valid(buf.as_ptr(), buf.len()) } {
        0 => Ok(false),
        1 => Ok(true),
        err => Err(err),
    }
}

fn main() {}
```

<details>

- **Answer:** `#[repr(C)]` on `img_opts`, `Option` for the nullable callback, `c_int` not `bool`, `usize` not `u32`. Only the layout bug is likely to fail a test.

- read the compiler's warnings first. `improper_ctypes` reports the
  missing `#[repr(C)]` on `img_opts`, and nothing else. The other three
  mistakes compile silently.
  - `-> u32` for `size_t`: passes every test with images under 4 GiB on
    x86-64. Usual wrong fix: `u64`, which is wrong on 32-bit targets. Use
    `usize`.
  - `-> bool` for `int`: UB the first time C returns -1. Not a fix: checking
    the `bool` after the call. The invalid `bool` already exists. Bind
    `c_int`.
  - `progress: img_progress_fn`: `img_default_opts` writes NULL into it, and a
    null `fn` pointer is an invalid value. Usual wrong answer: "only if we call
    it". Use `Option<img_progress_fn>`.
  - Missing `#[repr(C)]`: Rust may put `max_width` last. A test that reads a
    field probably catches this one, but only on the targets it runs on.
- `default_opts` shows why the `Option` matters. `assume_init` on a
  struct holding a null `fn` pointer would be UB right there.
- `is_valid` is the `has_data` pattern from the wrong return type
  slide. Ask: "Is `img_decoded_size` safe to call with any `buf`?" No: C reads
  `len` bytes, so a wrapper takes `&[u8]`.

</details>
