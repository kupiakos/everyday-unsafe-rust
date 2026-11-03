---
minutes: 10
---

# Exercise: `memcpy` vs `memmove`

- `consume` checks every bound. Is it sound?
- Which promise do `dst` and `src` break together?
- Rewrite `consume` with no `unsafe`.

```rust,editable
/// Copies `src` to the start of `dst`.
fn copy(dst: &mut [u8], src: &[u8]) {
    dst[..src.len()].copy_from_slice(src);
}

/// Drops the first `n` bytes of `buf`, moving the rest to the front.
/// Returns the new length.
pub fn consume(buf: &mut [u8], n: usize) -> usize {
    assert!(n <= buf.len());
    let len = buf.len();
    let p = buf.as_mut_ptr();
    // Ported from C: `memcpy(buf, buf + n, len - n);`
    let (dst, src) = unsafe {
        let dst = std::slice::from_raw_parts_mut(p, len - n);
        let src = std::slice::from_raw_parts(p.add(n), len - n);
        (dst, src)
    };
    copy(dst, src);
    len - n
}

fn main() {
    let mut buf = *b"GET /index.html";
    let len = consume(&mut buf, 4);
    println!("{}", String::from_utf8_lossy(&buf[..len]));
}
```

<details>

- **Goal:** two overlapping slices break `&mut`'s aliasing promise, even when
  every bound is checked.

- Do this exercise first. Short on time: skip
  [The Event Loop Calls Back](02-the-event-loop-calls-back.md).

- Hints:
  - Hint: what does a `&mut [u8]` promise about the bytes it covers? Which of
    those bytes does `src` cover?
  - Ask: for which `n` do `dst` and `src` overlap?
  - If they say "`copy_from_slice` copies front to back, so it works": what is
    it underneath? Is the UB in the copy, or in making the references?
  - If they write a byte-by-byte loop in `copy`: do the two slices still
    overlap?

</details>
