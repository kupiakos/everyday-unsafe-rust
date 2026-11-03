
# Solution

- `dst: &mut [u8]` and `src: &[u8]` overlap, which breaks `&mut`'s "nothing else
  accesses it".
- `copy_within` is `memmove` for slices.

```rust,editable
/// Drops the first `n` bytes of `buf`, moving the rest to the front.
/// Returns the new length.
pub fn consume(buf: &mut [u8], n: usize) -> usize {
    assert!(n <= buf.len());
    buf.copy_within(n.., 0);
    buf.len() - n
}

fn main() {
    let mut buf = *b"GET /index.html";
    let len = consume(&mut buf, 4);
    assert_eq!(&buf[..len], b"/index.html");
}
```

<details>

- **Answer:** `dst` and `src` overlap, which `&mut` forbids; use `copy_within`.

- `dst` is a `&mut [u8]`, so nothing else may access those bytes while it's
  live. `src` reads some of them. That's C's `restrict`, built in.
  - Usual wrong answer: "`copy_from_slice` copies front to back, so it works."
    It's `memcpy` underneath, and the overlapping references are UB anyway.
  - What isn't a fix: a byte-by-byte loop in `copy`. The two slices still
    overlap.
  - No overlap only when `n >= len - n`. `n == 0` makes them the same bytes.
- with raw pointers, `ptr::copy(p.add(n), p, len - n)` is the literal `memmove`
  port. `ptr::copy_nonoverlapping` is `memcpy`, and would be UB here too.

</details>
