---
minutes: 3
---

# Move It into a Type

- A slice carries its own length.
- A `Result` can't be ignored silently.
- Nothing left for `# Safety`: a safe `fn`.

```rust
use std::ffi::{c_char, c_int};

unsafe extern "C" {
    /// `buf` must be at least `len` bytes. Returns -1 on error and leaves
    /// `*out` unwritten.
    fn lib_fill(buf: *mut c_char, len: usize, out: *mut usize) -> c_int;
}

pub struct FillError;

/// Fills `buf` and returns how many bytes were written.
///
/// # Errors
///
/// Returns `FillError` if the library reports an error.
pub fn fill(buf: &mut [u8]) -> Result<usize, FillError> {
    let mut out = 0;
    // SAFETY: `buf` is valid for writes of `buf.len()` bytes, and `out` is a
    // live `usize`, valid for writes.
    let rc = unsafe { lib_fill(buf.as_mut_ptr().cast(), buf.len(), &mut out) };
    if rc == -1 { Err(FillError) } else { Ok(out) }
}
```

<details>

- **Point:** move each requirement into a type (a slice, a `Result`, an
  initialized `out`) and nothing is left for `# Safety`, so `fill` is safe.

- Row 1: `&mut [u8]` makes "at least `len` bytes" true by construction.
- Row 2: the `Result` puts the error in the caller's face.
- Row 3: `out` is initialized before the call, and only returned on success.
- Everything moved into types, so `fill` is a safe function. What can't move
  into a type stays in `# Safety`.
- Starting `out` at `0` is the conservative choice. An `*out` that might not be
  written is a natural fit for `MaybeUninit`, which is Day 2.
- `size_t` is `usize` here. Day 2 afternoon's ABI section is precise about C
  types.

</details>
