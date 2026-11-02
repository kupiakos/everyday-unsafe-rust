---
minutes: 3
---

# Weird Values

- Try empty slices, `0`, and `usize::MAX`.
- Release builds wrap on overflow.

```rust,no_run
pub fn pair<T>(v: &[T], i: usize) -> (&T, &T) {
    assert!(i + 1 < v.len());
    // SAFETY: `i < i + 1 < v.len()`, checked by the `assert!`.
    unsafe { (v.get_unchecked(i), v.get_unchecked(i + 1)) }
}

fn main() {
    let v = [10, 20];
    // Debug build: panics on overflow. Release build: `i + 1` wraps to 0,
    // the `assert!` passes, and `get_unchecked(usize::MAX)` is UB.
    let _ = pair(&v, usize::MAX);
}
```

<details>

- **Answer:** `i = usize::MAX` wraps `i + 1` to 0 in release builds, so the
  `assert!` passes and `get_unchecked` is UB, then the takeaway: always try
  empty, `0`, and `usize::MAX`.

- The `SAFETY:` comment claims `i < i + 1`. That's false when `i + 1` wraps.
- Overflow checks are on in debug builds and off in release by default. Tests in
  debug pass; production has UB.
- The empty slice is safe here (the `assert!` fails), but it's always worth
  trying: `v.len() - 1` is the classic.
- Fixes: `i.checked_add(1)`, or plain `(&v[i], &v[i + 1])`. Ask: "Is the
  `unsafe` worth it at all?"
- Day 2's In-Bounds Access comes back to arithmetic like this.

</details>
