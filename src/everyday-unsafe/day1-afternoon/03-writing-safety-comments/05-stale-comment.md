---
minutes: 3
---

# A Stale `SAFETY:` Comment

- A refactor moved the check.
- The comment still says "checked above".
- Reviewers trust it anyway.

```rust
fn pick(v: &[u32], i: usize) -> u32 {
    // An `assert!(i < v.len())` used to be here, until a refactor moved it
    // into the caller.
    // SAFETY: index checked above.   <- Now false, and reviewers still trust it.
    unsafe { *v.get_unchecked(i) }
}
```

<details>

- **Point:** a check is only evidence if it's still there and nothing since
  could undo it. After the refactor, "checked above" is false and the safe
  `pick` is unsound.

- Same `pick` as the last slide, after a refactor. `pick` is safe, so now any
  caller can pass any `i`: it's unsound.
- A check is only evidence if nothing since then could undo it, and if it's
  still there.
- Fixes: move the `assert!` back next to the block, or make `pick` an
  `unsafe fn` whose `# Safety` says `i < v.len()`, or use `v[i]`.
- The previous slide's comment named the `assert!` and the property. A reviewer
  of the refactor would have seen it go stale.

</details>
