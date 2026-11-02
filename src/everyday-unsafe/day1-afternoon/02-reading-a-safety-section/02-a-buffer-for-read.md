---
minutes: 3
---

# A Buffer for `read()`

- The C habit: allocate, then `read()`.
- Check it against the two bullets.

```rust
use std::io::Read;

// C: `char *buf = malloc(n); read(fd, buf, n);`
fn read_n(f: &mut impl Read, n: usize) -> std::io::Result<Vec<u8>> {
    let mut v = Vec::with_capacity(n);
    unsafe { v.set_len(n) }; // Does this meet both bullets?
    f.read_exact(&mut v)?;
    Ok(v)
}
```

<details>

- **Question:** students check the C `malloc`-then-`read()` habit against both
  bullets and find bullet 2 (initialized) false at the `set_len` call. The
  answer is on the next slide.

- Give the class a minute. Go bullet by bullet.
- Bullet 1: `with_capacity(n)` gives a capacity of at least `n`. It holds.
- Bullet 2: what are elements `0..n` right now? Nothing has written them.
- The usual wrong answer: "`read_exact` fills them before anyone looks." The
  next slide says why that doesn't help.

</details>
