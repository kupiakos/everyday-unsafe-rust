
# Solution

- `set_len(n)` requires bytes `0..n` to be initialized already. They weren't.
- `read` needs a `&mut [u8]`, so zero the buffer first.
- `c_fill` takes a raw pointer, so call it first, then `set_len`.

```rust,editable
use std::io::{self, Read};

pub fn read_up_to(src: &mut impl Read, n: usize) -> io::Result<Vec<u8>> {
    let mut buf = vec![0; n]; // Cheap next to the `read` itself.
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
    let mut buf: Vec<u8> = Vec::with_capacity(n);
    let spare = buf.spare_capacity_mut(); // `&mut [MaybeUninit<u8>]`: no promise.
    // SAFETY: `spare` has room for at least `n` bytes, so its pointer is valid
    // for writes of `n` bytes.
    let k = unsafe { c_fill(spare.as_mut_ptr().cast::<u8>(), n) };
    // SAFETY: `c_fill` initialized bytes `0..k`, and `k <= n <= capacity`.
    unsafe { buf.set_len(k) };
    buf
}

fn main() {
    let mut src: &[u8] = b"hello";
    println!("{:?}", read_up_to(&mut src, 16));
    println!("{:?}", fill_up_to(16));
}
```

<details>

- **Answer:** zero the buffer for `read`; for `c_fill`, pass the spare capacity's pointer, then `set_len`.

- the two halves of the answer are the same rule: no reference to
  uninitialized bytes. `read` needs one, and `c_fill` doesn't.
- `Read::read_buf` (unstable) is the zero-copy version of `read`.
  Mention it only if asked.
- `set_len` requires that the elements at `old_len..new_len` are
  *already* initialized. The contract was broken before `read` ran.
  - `read` takes `&mut [u8]`, so it gets a reference to uninitialized bytes.
    `Read` is a safe trait: an implementation may read the buffer first.
  - Usual wrong fix: move `set_len` after `read`. You still need a `&mut [u8]`
    for `read` to write into, and that's the same uninitialized memory.
  - Zeroing is the right fix here: it's cheap next to a syscall. For the
    zero-copy version, `src.take(n as u64).read_to_end(&mut buf)` handles the spare
    capacity inside `std`.
  - `c_fill` is different: it takes a raw pointer, so no reference to
    uninitialized memory exists. Here, `set_len` *after* the call is correct.

</details>
