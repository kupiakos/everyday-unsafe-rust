---
minutes: 3
---

# One Block, One Proof

- One `unsafe` operation per block.
- One `SAFETY:` comment per operation.

```rust
// Before: one block, two operations, one vague proof.
fn ends_before(v: &[u32]) -> (u32, u32) {
    assert!(!v.is_empty());
    // SAFETY: indices are in bounds.
    unsafe { (*v.get_unchecked(0), *v.get_unchecked(v.len() - 1)) }
}

// After: each operation gets its own proof.
fn ends(v: &[u32]) -> (u32, u32) {
    assert!(!v.is_empty());
    // SAFETY: `0 < v.len()`, by the `assert!`.
    let first = unsafe { *v.get_unchecked(0) };
    // SAFETY: `v.len() - 1 < v.len()`, and it doesn't underflow, by the `assert!`.
    let last = unsafe { *v.get_unchecked(v.len() - 1) };
    (first, last)
}
```

<details>

- **Point:** one `unsafe` operation per block, each with its own `SAFETY:`
  comment, so a reviewer can tell which proof covers which operation.

- Picture the real version: a 30-line `unsafe` block with five operations and
  one comment at the top. Nobody can tell which proof covers which operation.
- Splitting also keeps unrelated safe code out of `unsafe` blocks, so a reviewer
  sees exactly which operations need a proof.
- Lints that help: `clippy::undocumented_unsafe_blocks` requires a `SAFETY:`
  comment, and `clippy::multiple_unsafe_ops_per_block` enforces one operation
  per block.
- There are two schools of thought on block size. Day 2 comes back to proofs
  that span several operations.

</details>
