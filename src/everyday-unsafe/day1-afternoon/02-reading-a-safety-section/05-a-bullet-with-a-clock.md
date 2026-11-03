---
minutes: 3
---

# A Bullet with a Clock

- [`str::as_bytes_mut`](https://doc.rust-lang.org/std/primitive.str.html#method.as_bytes_mut):
  valid UTF-8 when the borrow ends.
- Bytes may change in between.
- Every requirement has a "when".

```rust,editable
fn upcase_ascii(s: &mut str) {
    // SAFETY: `as_bytes_mut` requires valid UTF-8 when the borrow ends. Only
    // ASCII lowercase bytes change, each into another ASCII byte, so every
    // UTF-8 sequence stays valid. (`str::make_ascii_uppercase` does this safely.)
    let bytes = unsafe { s.as_bytes_mut() };
    for b in bytes {
        if b.is_ascii_lowercase() {
            *b -= b'a' - b'A';
        }
    }
}
```

<details>

- **Point:** every requirement has a "when". `as_bytes_mut`'s bytes may be
  invalid UTF-8 in between, but must be valid when the borrow ends.

- [The docs](https://doc.rust-lang.org/std/primitive.str.html#method.as_bytes_mut):
  the caller must ensure the bytes are valid UTF-8 before the borrow ends and
  the `str` is used again. Using a `str` that isn't valid UTF-8 is UB.
- So this contract has a clock: it can be false for a while, then must be true.
- The C port that breaks it: a Latin-1 trick that subtracts `0x20` from bytes
  `0xE0..=0xFE`. In UTF-8, those bytes start multi-byte sequences, so the result
  isn't UTF-8 when the borrow ends.
- Ask: "When must [`set_len`'s bullets](01-two-bullets.md) hold?" At the call.
  Every requirement has a "when".

</details>
