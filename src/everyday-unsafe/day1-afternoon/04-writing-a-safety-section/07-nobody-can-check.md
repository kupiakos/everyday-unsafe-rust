---
minutes: 2
---

# A Precondition Nobody Can Check

- The caller can't check it from `src`.
- That's a design problem, not a docs problem.
- Move the precondition into the types.

```rust
/// The same job, with the precondition moved into the types.
pub fn decompress(src: &[u8], dst: &mut [u8]) -> Result<usize, DecompressError> {
    todo!()
}

pub struct DecompressError;
```

<details>

- **Answer:** no checkable `SAFETY:` comment exists, because the caller can't
  know the decompressed size, then the takeaway: a precondition the caller can't
  check is a design problem; move it into the types.

- Answer to the last slide's question: no `SAFETY:` comment in `load` can be
  checked. It can only cite something outside the function, like a stored size.
  Teams stored it next to the compressed data.
- The `# Safety` section is precise: who, what, and until when (the call). It's
  still a bad contract.
- The fix is `decompress`, like the `fill` wrapper: a slice and a `Result`. Day
  2 returns to designing interfaces like this.

</details>
