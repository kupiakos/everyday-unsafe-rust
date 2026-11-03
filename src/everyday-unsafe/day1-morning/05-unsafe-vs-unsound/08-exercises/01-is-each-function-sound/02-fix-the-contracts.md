---
minutes: 5
---

# Part 3: Fix the Contracts

- [Part 2](01-cause-ub.md)'s answer: `midpoint(&[])`, and `pair_at(&[7], 0)`.
- Fix both, so no caller who follows the contract gets UB.
- Change the code, the `# Safety` section, or both.

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

- **Goal:** fixing an unsound function by changing its code, its `# Safety`
  section, or both, so no caller who follows the contract gets UB.

- Answer to [Part 2: Cause UB from `main`](01-cause-ub.md): `midpoint(&[])`
  needs no `unsafe` at all. `pair_at(&[7], 0)` follows the `# Safety` section
  and reads index 1 anyway.
- Hints:
  - If they add a "must be non-empty" doc comment to a safe `fn`: who has to
    read it?
  - If they reach for `debug_assert!`: what's left of it in a release build?
  - If they reword a `SAFETY:` comment: is the bug in that comment, or in what
    callers were told?

</details>
