---
minutes: 3
---

# Two Fixes

- Fix 1: zero the buffer. No `unsafe` left.
- Fix 2: `spare_capacity_mut`, typed "not initialized yet".

```rust
use std::io::Read;

fn read_n(f: &mut impl Read, n: usize) -> std::io::Result<Vec<u8>> {
    let mut v = vec![0; n]; // Or `spare_capacity_mut`, typed as `MaybeUninit<u8>`.
    f.read_exact(&mut v)?;
    Ok(v)
}
```

<details>

- **Point:** zero the buffer and the `unsafe` disappears. If the `memset`
  matters, `spare_capacity_mut` types the bytes as not initialized yet.

- Fix 1 costs one `memset`. Ask: "Is that cost worth measuring before you
  reach for `unsafe`?" Usually it isn't.
- Fix 2: `v.spare_capacity_mut()` returns `&mut [MaybeUninit<u8>]`. Nothing can
  read those bytes as `u8` until you initialize them and call `set_len`.
- `MaybeUninit` is Day 2 morning's Initialization section. Today, just notice
  that a type can say "not initialized yet".
- Prefer the fix that removes the `unsafe` block entirely.

</details>
