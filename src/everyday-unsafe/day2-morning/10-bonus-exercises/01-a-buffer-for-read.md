---
minutes: 0
---

# Exercise: A Buffer for `read()`

- Which `# Safety` bullet of `Vec::set_len` does `read_up_to` break?
- Fix `read_up_to` with no `unsafe`.
- Implement `fill_up_to` with `spare_capacity_mut`, and no zeroing.

```rust,editable
#![allow(dead_code, unused_variables)]
use std::io::{self, Read};

// Ported from C: `malloc(n)`, then `read(fd, buf, n)`.
pub fn read_up_to(src: &mut impl Read, n: usize) -> io::Result<Vec<u8>> {
    let mut buf: Vec<u8> = Vec::with_capacity(n);
    // SAFETY: `read` writes the bytes before anyone looks at them.
    unsafe { buf.set_len(n) };
    let got = src.read(&mut buf)?;
    buf.truncate(got);
    Ok(buf)
}

/// Simulates a C function: writes the first `k <= len` bytes of `dst`, and
/// returns `k`.
///
/// # Safety
///
/// `dst` must be valid for writes of `len` bytes.
unsafe fn c_fill(dst: *mut u8, len: usize) -> usize {
    let k = len.min(4);
    for i in 0..k {
        // SAFETY: `i < k <= len`, and the caller guarantees `len` bytes.
        unsafe { dst.add(i).write(b'x') };
    }
    k
}

pub fn fill_up_to(n: usize) -> Vec<u8> {
    todo!("call `c_fill` on the `Vec`'s spare capacity")
}

fn main() {
    let mut src: &[u8] = b"hello";
    println!("{:?}", read_up_to(&mut src, 16)); // UB before your fix.
    println!("{:?}", fill_up_to(16));
}
```

<details>

- **Goal:** `set_len` needs initialized bytes first and `read` needs a reference, so only a raw-pointer API can fill spare capacity without zeroing.

- Hints:
  - Hint: read each bullet of `Vec::set_len`'s `# Safety` section. Which ones
    must already be true at the call?
  - If they say "`read` writes the bytes before anyone looks at them": `Read`
    is a safe trait. What may a safe impl do with the buffer it's given?
  - If they move `set_len` after `read`: what does `read` write into, then?
  - Hint for the fix: how expensive is zeroing `n` bytes next to a syscall?
  - Hint for `fill_up_to`: what does `c_fill` take? Does calling it create a
    reference to uninitialized memory?

</details>
