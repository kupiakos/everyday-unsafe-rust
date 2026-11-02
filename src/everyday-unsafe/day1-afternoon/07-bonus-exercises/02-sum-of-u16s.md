---
minutes: 0
---

# Exercise: Sum of `u16`s

- The tests pass. Find an input that causes UB.
- Fix it, keeping the `unsafe`.
- Then fix it without any `unsafe`.

```rust,editable
/// Sums the little-endian `u16`s in `b`. A trailing odd byte is ignored.
pub fn sum_u16_le(b: &[u8]) -> u32 {
    let mut sum = 0;
    let mut i = 0;
    while i < b.len() {
        // SAFETY: `i < b.len()` by the loop condition, and `i + 1` is the
        // other half of the same `u16`.
        let (lo, hi) = unsafe { (*b.get_unchecked(i), *b.get_unchecked(i + 1)) };
        sum += u16::from_le_bytes([lo, hi]) as u32;
        i += 2;
    }
    sum
}

#[test]
fn sums() {
    assert_eq!(sum_u16_le(&[1, 0, 2, 0]), 3);
    assert_eq!(sum_u16_le(&[0, 1]), 256);
}

fn main() {
    // Your hostile calls here.
    println!("{}", sum_u16_le(&[]));
}
```

<details>

- **Goal:** finding the input that breaks a function whose tests pass (an odd
  length), then fixing it with and without `unsafe`.

- Hints:
  - Hint: the tests only use even lengths.
  - Bigger hint: `&[1, 0, 2]`: at `i = 2`, `i < 3` passes, and
    `get_unchecked(3)` reads past the end. A debug build stops with "unsafe
    precondition(s) violated". A release build returns a garbage sum.
  - The empty slice is fine: the loop doesn't run. Try it anyway.
  - Usual wrong answer: "`sum` can overflow." It panics in debug and wraps in
    release. That's a bug, not UB.
  - "`i + 1` is the other half" is reassurance, not evidence.
  - If they add `debug_assert!(b.len() % 2 == 0)`: what's left of it in a
    release build? And what would a plain `assert!` do to "A trailing odd byte
    is ignored"?

</details>
