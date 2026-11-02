---
minutes: 5
---

# Exercise: Is Each Function Sound?

- Part 1 of 3: label each function.
- Does a caller need an `unsafe` block to call it?
- Is it sound or unsound?

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

fn main() {}
```

<details>

- **Goal:** reading each `SAFETY:` comment as a claim to check, and seeing that
  safe vs `unsafe` and sound vs unsound are separate questions.

- One function per cell of the safe/unsafe × sound/unsound grid. Don't tell the
  class that.
- Hints:
  - Hint: read each `SAFETY:` comment as a claim to check. Is there an input
    that makes it false?
  - If they say "`wrapping_get` is unsound, try an empty slice": what does
    `i % 0` do, and does that happen before or after the read?
  - If they say "`pair_at` is sound, it's `unsafe`": can a caller follow its
    `# Safety` section and still get UB?
  - If they say "`last_unchecked` underflows on `&[]`": what did the caller
    promise?

</details>
