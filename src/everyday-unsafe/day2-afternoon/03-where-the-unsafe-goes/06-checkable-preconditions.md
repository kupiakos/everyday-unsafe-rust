---
minutes: 3
---

# Make Preconditions Checkable

- Recall LZO: no caller could check `dst`'s size.
- Take `dst: &mut [u8]`: the slice knows its length.
- Call the C function that checks it.
- The precondition is gone, so the function is safe.

```rust
use std::ffi::{c_int, c_void};
use std::ptr;

#[allow(non_camel_case_types)]
type lzo_uint = usize; // Pointer-sized, like `size_t`.

unsafe extern "C" {
    // Reads `*dst_len` as the capacity of `dst`, and never writes past it.
    fn lzo1x_decompress_safe(
        src: *const u8,
        src_len: lzo_uint,
        dst: *mut u8,
        dst_len: *mut lzo_uint,
        wrkmem: *mut c_void,
    ) -> c_int;
}

/// Decompresses `src` into `dst`, and returns the decompressed size. Returns
/// `None` if `src` is corrupt or `dst` is too small.
pub fn decompress(src: &[u8], dst: &mut [u8]) -> Option<usize> {
    let mut dst_len = dst.len();
    // SAFETY: `src` is valid for reads of `src.len()` bytes and `dst` for
    // writes of `dst_len` bytes. Decompression doesn't use `wrkmem`.
    let ret = unsafe {
        lzo1x_decompress_safe(
            src.as_ptr(),
            src.len(),
            dst.as_mut_ptr(),
            &mut dst_len,
            ptr::null_mut(),
        )
    };
    (ret == 0).then_some(dst_len)
}
```

<details>

- **Point:** if no caller can check a precondition, change the API so the types
  carry it (a slice knows its length), and the precondition goes away.

- Back to Day 1's contract page: `decompress_unchecked` required `dst` to be big
  enough, and no caller could check that from the arguments. Teams stored the
  decompressed size next to the data and hoped.
- Here the slice carries its length, and `lzo1x_decompress_safe` checks it, so
  there's nothing left for the caller to prove.
- Ask: "Is there still a reason to keep `decompress_unchecked`?" Only if
  profiling shows the check matters. Then it becomes the unchecked half of a
  checked/unchecked pair with `decompress`, with a `# Safety` section.
- Making a precondition checkable is often better than documenting it.

</details>
