---
minutes: 3
---

# The Proof That Spans Two Statements

- [`as_bytes_mut`](https://doc.rust-lang.org/std/primitive.str.html#method.as_bytes_mut)
  hands out the bytes of a `str`.
- The `str` must be UTF-8 again when the borrow ends.
- Which line does the proof depend on?

```rust,editable
/// Uppercases the ASCII letters in `s`, in place.
pub fn make_ascii_upper(s: &mut str) {
    // SAFETY: The loop below only turns ASCII bytes into ASCII bytes, so `s`
    // is still valid UTF-8 when `bytes` goes away.
    let bytes = unsafe { s.as_bytes_mut() };
    for b in bytes {
        if b.is_ascii_lowercase() {
            *b -= 32;
        }
    }
}
```

<details>

- **Question:** students find the line the `SAFETY:` comment depends on: the
  safe `*b -= 32`, not the `as_bytes_mut` call. The answer is on
  [How Big Should an `unsafe` Block Be?](05-unsafe-block-size.md).

- Ask: "Which line does the `SAFETY:` comment depend on?" The `*b -= 32`, a line
  of safe code with no `unsafe` near it.
  [How Big Should an `unsafe` Block Be?](05-unsafe-block-size.md) opens with it.
- Usual wrong answer: the `as_bytes_mut` line, because that's where the `unsafe`
  is. That line only hands out the bytes. What makes them UTF-8 again is the
  safe line that writes them.
- Change that line to `*b = 0xFF` and it still compiles. The UB shows up later,
  in safe code that trusts `str` to be UTF-8.
- The same thing happens with
  [`Vec::set_len`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.set_len)
  ([`set_len`'s Two Bullets](../../day1-afternoon/02-reading-a-safety-section/01-two-bullets.md)),
  in the other direction: its proof depends on the code that filled the elements
  before it. The usual wrong answer is to call `set_len` first and fill
  afterward. Its docs require the elements to be initialized already.
- In real code, call `str::make_ascii_uppercase`. The point is the shape of the
  proof.

</details>
