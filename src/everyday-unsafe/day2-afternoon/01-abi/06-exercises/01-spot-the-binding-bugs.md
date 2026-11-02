---
minutes: 15
---

# Exercise: Spot the Binding Bugs

- A teammate hand-wrote bindings for `imgdec.h`.
- Find the four mistakes, and fix them.
- Which would your tests catch on x86-64?

```c
// imgdec.h
typedef void (*img_progress_fn)(void *user, int percent);

struct img_opts {
  uint32_t max_width;
  img_progress_fn progress; // May be NULL: no progress reports.
  void *user;
};

void img_default_opts(struct img_opts *out); // Sets `progress` to NULL.
int img_is_valid(const uint8_t *buf, size_t len); // 1, 0, or -1 on error.
size_t img_decoded_size(const uint8_t *buf, size_t len);
int img_decode(const uint8_t *buf, size_t len, const struct img_opts *opts,
               uint8_t *out, size_t out_len);
```

```rust,editable
#![allow(non_camel_case_types, dead_code)]
use std::ffi::{c_int, c_void};

pub type img_progress_fn = unsafe extern "C" fn(user: *mut c_void, percent: c_int);

pub struct img_opts {
    pub max_width: u32,
    pub progress: img_progress_fn,
    pub user: *mut c_void,
}

unsafe extern "C" {
    pub fn img_default_opts(out: *mut img_opts);
    pub fn img_is_valid(buf: *const u8, len: usize) -> bool;
    pub fn img_decoded_size(buf: *const u8, len: usize) -> u32;
    pub fn img_decode(
        buf: *const u8,
        len: usize,
        opts: *const img_opts,
        out: *mut u8,
        out_len: usize,
    ) -> c_int;
}

fn main() {}
```

<details>

- **Goal:** compare each Rust declaration with its C type, and see that most
  binding mistakes compile silently and pass tests on x86-64.

- Hints:
  - Hint: read the compiler's warnings first. How many of the four mistakes does
    it report?
  - Hint: compare each Rust type with its C type, one at a time, including the C
    comments.
  - If they bind `size_t` as `u64`: what about 32-bit targets?
  - If they keep `bool` and check it after the call: when does the invalid value
    come into existence?
  - If they say a null callback is fine "only if we call it": is null a valid
    value for a Rust `fn` pointer?
  - For "which would your tests catch": which mistakes need a rare input, or
    another target, to show up?

</details>
