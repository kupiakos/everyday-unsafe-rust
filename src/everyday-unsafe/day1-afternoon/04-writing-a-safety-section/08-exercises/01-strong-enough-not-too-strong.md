---
minutes: 15
---

# Exercise: Strong Enough, Not Too Strong

- Write the `# Safety` section from what the body needs.
- Then judge X and Y: too weak, too strong, or right?
- Too weak means a call that meets it can still cause UB. Find one.

```rust,editable
/// Splits `s` into `s[..mid]` and `s[mid..]`, without checks.
///
/// # Safety
///
/// TODO
pub unsafe fn split_unchecked(s: &str, mid: usize) -> (&str, &str) {
    let b = s.as_bytes();
    // SAFETY: TODO
    let (head, tail) = unsafe { (b.get_unchecked(..mid), b.get_unchecked(mid..)) };
    // SAFETY: TODO
    unsafe {
        (std::str::from_utf8_unchecked(head), std::str::from_utf8_unchecked(tail))
    }
}

// Two `# Safety` sections from code review. Too weak, too strong, or right?
//
// X: "The caller must ensure that `mid` is in bounds."
// Y: "The caller must ensure that `s` is ASCII and `mid < s.len()`."
```

<details>

- **Goal:** deriving a `# Safety` section from exactly what the body needs, and
  judging a contract as too weak (allows UB) or too strong (rejects fine calls).

- Hints:
  - Hint: what does each `unsafe` block in the body need? Write exactly that.
  - Bigger hint: which `str` method tells you whether `mid` is a safe place to
    cut?
  - Hint for X and Y: find a call each one allows that's UB, and a call each one
    rejects that would work fine.
  - Hint for "find one": try a string with a non-ASCII character.
  - If they write `mid < s.len()`: what does `mid == s.len()` give?
  - Ask after: which is easier to change later, a contract that's too strong, or
    one that's too weak? Recall "From Vague to Precise".

</details>
