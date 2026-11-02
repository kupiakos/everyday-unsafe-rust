---
minutes: 3
---

# From Vague to Precise

- "Valid" names no property.
- List each property, and how long.

```rust
/// Version 1, vague:
///
/// # Safety
///
/// `ptr` must be valid.
pub unsafe fn sum_v1(ptr: *const u32, len: usize) -> u32 {
    todo!()
}

/// Version 2, precise:
///
/// # Safety
///
/// The caller must ensure that, for the duration of the call:
///
/// - `ptr` is non-null and aligned for `u32`;
/// - `ptr` points to `len` consecutive initialized `u32`s in one allocation;
/// - nothing writes to those `u32`s.
pub unsafe fn sum_v2(ptr: *const u32, len: usize) -> u32 {
    // SAFETY: Each requirement of `slice::from_raw_parts` is a bullet in this
    // function's `# Safety` section. `len * 4 <= isize::MAX` follows from the
    // `u32`s being in one allocation.
    unsafe { std::slice::from_raw_parts(ptr, len) }.iter().sum()
}
```

<details>

- **Point:** "valid" names no property. A precise `# Safety` section lists each
  property and how long it must hold.

- Ask: "Is a dangling pointer 'valid' if `len` is 0? Is a pointer to
  uninitialized memory 'valid'?" Version 1 can't answer either.
- Version 2 answers who ("the caller"), what (three properties), and until
  when ("for the duration of the call").
- A good test: the callee's `SAFETY:` comment becomes "each requirement is a
  bullet in my `# Safety`".
- Day 2 gives the full list that "valid" stands for. Today's list is enough
  for `from_raw_parts`.

</details>
