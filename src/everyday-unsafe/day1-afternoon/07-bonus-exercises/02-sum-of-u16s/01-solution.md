
# Solution

- `&[1, 0, 2]` reads one byte past the end.
- Fix: loop while `i + 1 < b.len()`. Better: `chunks_exact(2)`, no `unsafe`.

```rust,editable
/// Sums the little-endian `u16`s in `b`. A trailing odd byte is ignored.
pub fn sum_u16_le(b: &[u8]) -> u32 {
    // `chunks_exact` skips the odd byte. No `unsafe` needed.
    b.chunks_exact(2).map(|c| u16::from_le_bytes([c[0], c[1]]) as u32).sum()
}

/// The minimal fix, if you must keep `unsafe`.
pub fn sum_u16_le_unchecked(b: &[u8]) -> u32 {
    let mut sum = 0;
    let mut i = 0;
    while i + 1 < b.len() {
        // SAFETY: `i < i + 1 < b.len()` by the loop condition. `i + 1` can't
        // overflow: `i < b.len() <= isize::MAX`.
        let (lo, hi) = unsafe { (*b.get_unchecked(i), *b.get_unchecked(i + 1)) };
        sum += u16::from_le_bytes([lo, hi]) as u32;
        i += 2;
    }
    sum
}

fn main() {
    for b in [&[][..], &[7], &[1, 0, 2], &[1, 0, 2, 0]] {
        assert_eq!(sum_u16_le(b), sum_u16_le_unchecked(b));
    }
}
```

<details>

- **Answer:** `&[1, 0, 2]` reads one byte past the end. Loop while
  `i + 1 < b.len()`, or better, use `chunks_exact(2)` with no `unsafe`.

- the optimizer usually removes the bounds checks on `c[0]` and
  `c[1]`, because `chunks_exact(2)` always yields 2 bytes. Measure before
  reaching for `unsafe`.
- Not a fix: `debug_assert!(b.len() % 2 == 0)`. It's gone in release
  builds. A plain `assert!` is sound, but breaks the documented "odd byte is
  ignored".

</details>
