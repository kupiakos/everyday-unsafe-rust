---
minutes: 3
---

# Answer Every Bullet

- One line per bullet of the callee's `# Safety`.
- Each line says where the evidence is.

```rust,editable
/// # Safety
///
/// `ptr` must be non-null, aligned, and point to `len` initialized `u16`s in
/// one live allocation that nothing mutates for `'a`.
pub unsafe fn as_slice<'a>(ptr: *const u16, len: usize) -> &'a [u16] {
    // SAFETY: The requirements of `slice::from_raw_parts`:
    // - Non-null and aligned: required by this function's `# Safety`.
    // - Valid for reads of `len * 2` bytes in one allocation: required by `#
    //   Safety`.
    // - Points to `len` initialized `u16`s: required by `# Safety`.
    // - Not mutated for `'a`: required by `# Safety`.
    // - `len * 2 <= isize::MAX`: follows from fitting in one allocation.
    unsafe { std::slice::from_raw_parts(ptr, len) }
}
```

<details>

- **Point:** a `SAFETY:` comment has one line per bullet of the callee's
  `# Safety`, so a reviewer can check each one. Inside an `unsafe fn`, "my
  caller promised it" is valid evidence.

- The five lines match the five rows from
  [A Long List](../02-reading-a-safety-section/06-a-long-list.md).
- Here every answer is "my caller promised it". That's fine: this function is
  `unsafe` too, so it passes the requirements up in its own `# Safety`.
- A reviewer can check each line against
  [the docs](https://doc.rust-lang.org/std/slice/fn.from_raw_parts.html#safety),
  one at a time. Nothing is hidden in "the pointer is valid".
- Ask: "Which line would you have forgotten?" Often the last one.

</details>
