---
minutes: 3
---

# Evidence, Not Reassurance

- Name the requirement.
- Point at the evidence.
- A reviewer must be able to check it.

```rust
fn pick(v: &[u32], i: usize) -> u32 {
    assert!(i < v.len());
    // Reassurance: "SAFETY: this is fine."
    // Reassurance: "SAFETY: `i` is valid."
    // Evidence:
    // SAFETY: `get_unchecked` requires `i < v.len()`. The `assert!` above
    // checks it, and neither `i` nor `v` changes in between.
    unsafe { *v.get_unchecked(i) }
}
```

<details>

- **Point:** a `SAFETY:` comment names the requirement and points at evidence a
  reviewer can check. "This is fine" and "`i` is valid" give them nothing.

- `get_unchecked`'s `# Safety` section: an out-of-bounds index is UB, even if
  the resulting reference is never used.
- "This is fine" gives the reviewer nothing to check. "`i` is valid" uses a
  word that hides the actual property.
- Have the class rewrite a few vague comments from their own codebase, if they
  have some.
- Of course, `v[i]` would do the same check without `unsafe`. Keep the example
  small; the point is the comment.

</details>
