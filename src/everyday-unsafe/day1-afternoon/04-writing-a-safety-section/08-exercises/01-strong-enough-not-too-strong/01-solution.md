
# Solution

- One bullet: `s.is_char_boundary(mid)`.
- X is too weak (`"é"`, `1`). Y is too strong.

```rust,editable
/// Splits `s` into `s[..mid]` and `s[mid..]`, without checks.
///
/// # Safety
///
/// The caller must ensure that `s.is_char_boundary(mid)`. (This is false
/// for `mid > s.len()`, so it also means `mid` is in bounds.)
pub unsafe fn split_unchecked(s: &str, mid: usize) -> (&str, &str) {
    let b = s.as_bytes();
    // SAFETY: `get_unchecked` requires `mid <= b.len()` for both ranges.
    // `is_char_boundary(mid)` implies it.
    let (head, tail) = unsafe { (b.get_unchecked(..mid), b.get_unchecked(mid..)) };
    // SAFETY: `from_utf8_unchecked` requires valid UTF-8. `s` is valid UTF-8,
    // and cutting it at a character boundary leaves two valid halves.
    unsafe {
        (std::str::from_utf8_unchecked(head), std::str::from_utf8_unchecked(tail))
    }
}

fn main() {
    let s = "héllo";
    assert!(s.is_char_boundary(3));
    // SAFETY: `3` is a character boundary of `s`, checked just above.
    let (a, b) = unsafe { split_unchecked(s, 3) };
    assert_eq!((a, b), ("hé", "llo"));
}
```

<details>

- **Answer:** one bullet, `s.is_char_boundary(mid)`. X is too weak (`"é"`, `1`),
  and Y is too strong.

- compare `str::get_unchecked` in `std`. Its `# Safety` section says the same
  thing in three bullets: start before end, in bounds, and on character
  boundaries.
- X is too weak: `split_unchecked("é", 1)` meets it, and cuts `é` in half.
  Neither half is UTF-8.
- Y is too strong: sound, but it rejects `"é"` and `mid == s.len()`, which work
  fine. Callers have to prove things the body doesn't need.
- Right: `s.is_char_boundary(mid)`. It's false for `mid > s.len()`, so it covers
  "in bounds" too.
- Usual wrong answer: `mid < s.len()`. Off by one: `mid == s.len()` gives an
  empty tail, which is fine.
- Recall "From Vague to Precise": loosening Y to the right contract later is
  fine. Tightening X later silently breaks callers.

</details>
