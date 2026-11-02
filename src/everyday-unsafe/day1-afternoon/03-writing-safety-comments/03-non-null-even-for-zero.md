---
minutes: 2
---

# Non-Null, Even for Zero

- Bullet 1: non-null, even for `len == 0`.
- `(NULL, 0)` breaks it.
- Answering each bullet finds the bug.

```rust
use std::slice;

/// # Safety
///
/// If `ptr` is non-null, it must be aligned and point to `len` initialized
/// `u16`s in one live allocation that nothing mutates for `'a`.
pub unsafe fn items<'a>(ptr: *const u16, len: usize) -> &'a [u16] {
    if ptr.is_null() {
        return &[]; // The C library's "no items".
    }
    // SAFETY: The requirements of `slice::from_raw_parts`:
    // - Non-null: checked above. Aligned: required by `# Safety`.
    // - Valid for reads of `len * 2` bytes in one allocation: required by `#
    //   Safety`.
    // - Points to `len` initialized `u16`s: required by `# Safety`.
    // - Not mutated for `'a`: required by `# Safety`.
    // - `len * 2 <= isize::MAX`: follows from fitting in one allocation.
    unsafe { slice::from_raw_parts(ptr, len) }
}
```

<details>

- **Answer:** `(NULL, 0)` breaks non-null, which applies even for `len == 0`,
  then the takeaway: answering each bullet on its own line is what finds the
  bug.

- Answer to the last slide's question: `(NULL, 0)` breaks bullet 1.
- The docs say non-null and aligned even for length 0.
- Why: a `&[T]` is never null, and `Option<&[T]>` uses null to mean `None`.
- The fix: `as_slice` with one change. The C library may return null when there
  are no items, so check for it.
- Writing "Non-null: ..." on its own line is what makes you ask the question. A
  one-line "the pointer is valid" would have hidden it.
- `NonNull::dangling()` with length 0 is the other fix the docs suggest.

</details>
