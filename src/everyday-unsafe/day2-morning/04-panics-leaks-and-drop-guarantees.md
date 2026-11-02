---
minutes: 3
---

# Panics, Leaks, and Drop Guarantees

- Every value is dropped exactly once.
- Safe Rust does that for you.
- `unsafe` code tracks it by hand.

<!-- mdbook-xgettext: skip -->

```bob
 +--------+  write   +------+  drop   +---------+
 | uninit +--------->| init +-------->| dropped |
 +--------+          +------+         +----+----+
      ^                                    |
      +------------------------------------+
               "storage reused"
```

<details>

- **Goal:** students keep `unsafe` code sound when the code it calls panics: leaks are safe and double drops aren't, so soundness can't depend on a destructor. **Arc:** every value dropped once → leaking is safe → callers can panic → the predicate that panics: who's at fault? → fix: leak → fix: a guard → don't count on a destructor → exercise.

- The other end of the lifecycle from Initialization. There, `MaybeUninit` made
  you start the lifecycle by hand. Here, panics and leaks end it early or not
  at all.
- `ptr::read` copies the bits out, and now two places think they own the
  value. Ownership in safe Rust prevents exactly that.
- Ask: "Which arrow can safe code skip?" Drop: leaking is safe (next slide).
  Running drop twice never is.

</details>

<!-- Sources for this section's slides (split from the earlier one-slide
version): the "Panic / unwind" and "Drop / destructor elision" rows of
`[topics]`, "Sequencing Ownership Transfer" under `[rej.vec-owns]`,
`[comment.state-change]`, `[dep.hostile]`, `[rej.no-panic]`, and the "FFI/ABI"
row of `[topics]`, in the unsafe Rust review skill:
https://github.com/google/rust-skills/blob/main/unsafe_rust_review/SKILL.md -->
