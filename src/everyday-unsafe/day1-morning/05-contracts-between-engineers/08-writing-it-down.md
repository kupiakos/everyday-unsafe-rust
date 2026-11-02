---
minutes: 3
---

# Writing the Contract Down

- No size, or an untrusted one: heap overflow.
- `unsafe fn`: "there's a contract here".
- `# Safety`: the contract, written down.
- UB: your contract with the compiler.
- Soundness: between safe and unsafe code.

```rust
/// Decompresses `src` into `dst` without checking the size of `dst`.
///
/// # Safety
///
/// The caller must ensure that `dst` is valid for writes of at least as many
/// bytes as `src` decompresses to.
///
/// (A caller can't check this from the arguments alone. Teams that used the C
/// version stored the decompressed size next to the compressed data.)
pub unsafe fn decompress_unchecked(src: &[u8], dst: *mut u8) -> usize {
    todo!()
}
```

<details>

- **Answer:** a missing or untrusted size gives a heap overflow with no compiler warning, then `unsafe fn` plus a `# Safety` section writes the contract down where a reviewer can check it.

- Answer to the last slide's question: a new file format without the size, or
  a `decompressed_len` from an untrusted file, and `dst` is too small. Heap
  overflow, with no warning from the compiler.
- The same function, ported to Rust. Every caller must now write `unsafe`, and
  the `# Safety` section tells them what to prove.
- The safe version would take `dst: &mut [u8]`, and the slice carries its own
  length. That's `lzo1x_decompress_safe`.
- The two contracts this course is about: UB is the contract between you and
  the compiler. Soundness is the contract between safe and unsafe code. Next:
  what breaking the second one looks like.

</details>
