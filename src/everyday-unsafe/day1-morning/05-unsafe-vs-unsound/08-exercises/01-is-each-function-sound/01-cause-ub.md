---
minutes: 5
---

# Part 2: Cause UB from `main`

- [Part 1](../01-is-each-function-sound.md)'s answer: `midpoint` and `pair_at`
  are unsound.
- For each one, write a call in `main` that causes UB.
- Follow every `# Safety` section you call.

```rust,editable
#![allow(dead_code)]

/// Returns the middle element.
pub fn midpoint(v: &[u32]) -> u32 {
    // SAFETY: `v.len() / 2` is less than `v.len()`.
    unsafe { *v.get_unchecked(v.len() / 2) }
}

/// Returns element `i`, wrapping around at the end.
pub fn wrapping_get(v: &[u32], i: usize) -> u32 {
    // SAFETY: `i % v.len()` is less than `v.len()`.
    unsafe { *v.get_unchecked(i % v.len()) }
}

/// Returns elements `i` and `i + 1`.
///
/// # Safety
///
/// The caller must ensure that `i < v.len()`.
pub unsafe fn pair_at(v: &[u32], i: usize) -> (u32, u32) {
    // SAFETY: The caller guarantees that `i` is in bounds.
    unsafe { (*v.get_unchecked(i), *v.get_unchecked(i + 1)) }
}

/// Returns the last element.
///
/// # Safety
///
/// The caller must ensure that `v` is non-empty.
pub unsafe fn last_unchecked(v: &[u32]) -> u32 {
    // SAFETY: The caller guarantees `v.len() >= 1`, so `v.len() - 1` is in
    // bounds.
    unsafe { *v.get_unchecked(v.len() - 1) }
}

fn main() {
    // TODO: For each unsound function, a call that causes UB.
}
```

<details>

- **Goal:** proving a function unsound by writing a caller that follows every
  `# Safety` section and still causes UB.

- Answer to
  [Exercise: Is Each Function Sound?](../01-is-each-function-sound.md):
  `midpoint` is safe and unsound, `wrapping_get` safe and sound, `pair_at`
  `unsafe` and unsound, `last_unchecked` `unsafe` and sound.
- Hints:
  - Bigger hint: `midpoint`'s `SAFETY:` comment is false for an empty slice.
  - Hint for `pair_at`: how many indices does the body read? How many does the
    `# Safety` section cover?

</details>
