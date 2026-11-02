---
minutes: 3
---

# Broken at `set_len`

- Bullet 2: elements must already be initialized.
- Broken at `set_len`, before `read` runs.
- What happens next doesn't matter.

```rust
use std::io::Read;

fn read_n_bad(f: &mut impl Read, n: usize) -> std::io::Result<Vec<u8>> {
    let mut v = Vec::with_capacity(n);
    // UNSOUND: `set_len` requires the first `n` elements to be initialized.
    unsafe { v.set_len(n) };
    // `f` is caller-provided code, and it's allowed to read `v` first.
    f.read_exact(&mut v)?;
    Ok(v)
}
```

<details>

- **Answer:** bullet 2 is broken at the `set_len` call, before `read` runs, then
  the takeaway: a precondition must hold at the call, and "it gets overwritten
  soon" doesn't count.

- The contract is checked at the line that calls `set_len`. It was false there,
  so the program is already wrong.
- `f` is any `Read` impl. Safe code is allowed to read the `&mut [u8]` it's
  given before writing it, so it would see uninitialized bytes as `u8`s.
- Even if `f` only writes, `v` claimed to hold `n` real `u8`s that didn't exist.
  Don't reason about "it gets overwritten soon".

</details>
