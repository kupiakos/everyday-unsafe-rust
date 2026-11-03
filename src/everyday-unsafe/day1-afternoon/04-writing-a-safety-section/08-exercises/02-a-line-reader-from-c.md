---
minutes: 15
---

# Exercise: A Line Reader from C

- Turn the header comment into a `# Safety` section for `next_line`.
- The caller picks `'a`. Your `# Safety` section must say how long the slice may
  be used.
- Write both `SAFETY:` comments. Your `# Safety` is done when they're true.
- Sort each item in the header:

| Header item                 | UB, just a bug, or handled by a type? |
| --------------------------- | ------------------------------------- |
| writes the length to `*len` |                                       |
| valid until the next call   |                                       |
| NULL at end of input        |                                       |
| leaves `*len` unwritten     |                                       |
| lines over 4096 bytes split |                                       |
| `r` must be open            |                                       |

```rust,editable
use std::ffi::c_char;

#[repr(C)]
pub struct RawReader {
    _private: [u8; 0],
}

unsafe extern "C" {
    /* Returns the next line from r, without the newline, and writes its
    length to *len. The returned pointer points into r's internal buffer
    and is valid until the next call on r. Returns NULL at end of input
    and leaves *len unwritten. Lines longer than 4096 bytes are split.
    r must be open (see reader_open). */
    fn reader_next(r: *mut RawReader, len: *mut usize) -> *const c_char;
}

/// Returns the next line from `r`, or `None` at end of input.
///
/// # Safety
///
/// TODO
pub unsafe fn next_line<'a>(r: *mut RawReader) -> Option<&'a [u8]> {
    let mut len = 0;
    // SAFETY: TODO
    let p = unsafe { reader_next(r, &mut len) };
    if p.is_null() {
        return None;
    }
    // SAFETY: TODO
    Some(unsafe { std::slice::from_raw_parts(p.cast::<u8>(), len) })
}
```

<details>

- **Goal:** sorting a C header comment into UB, just a bug, or handled by a
  type, and saying in `# Safety` how long the returned slice may be used.

- For students without C: `RawReader` is an opaque C handle you only ever hold
  by pointer, and `c_char` is C's byte type.
- `'a` isn't tied to any input, so nothing but the `# Safety` section limits it.
  That's the point here. Day 2's
  [Picking the Lifetime of a Raw Borrow](../../../day2-morning/10-picking-the-lifetime-of-a-raw-borrow.md)
  shows the safe fix: a `Reader` wrapper whose `next_line(&mut self)` ties the
  slice to the borrow.
- Hints:
  - Hint: expect six items in the header.
  - Hint: for each item, what goes wrong if it's false? Is that UB, or just
    wrong output?
  - Hint: for each item, does the caller have to do anything, or does
    `next_line`'s body already handle it?
  - If they write "for the duration of the call" for the slice: does the slice
    outlive the call? Until when is it valid?
  - If they write "`r` must be a valid reader": valid how, and until when?

</details>
