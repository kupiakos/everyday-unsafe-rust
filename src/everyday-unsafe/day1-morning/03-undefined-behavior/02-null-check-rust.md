---
minutes: 3
---

# The Same Thing in Rust

- Not a compiler bug: the C code broke a rule.
- Same order: dereference, then check.
- Same result: the check can vanish.
- Rust has the same kind of rules.

```rust,editable
pub struct Tun {
    sk: u32,
}

/// # Safety
///
/// `tun` must be null or point to a live `Tun`.
pub unsafe fn poll(tun: *const Tun) -> Option<u32> {
    // SAFETY: (wrong) `tun` may still be null here: the check comes after.
    let sk = unsafe { (*tun).sk };
    if tun.is_null() {
        // The optimizer may delete this branch: `tun` was already dereferenced,
        // so it "can't" be null.
        return None;
    }
    Some(sk)
}
```

<details>

- **Answer:** not a compiler bug: dereferencing null is UB and GCC relied on
  that rule, then Rust has the same kind of rule, so a raw pointer dereferenced
  before `is_null()` can lose its check too.

- Answer to the question on [The Null Check That Vanished](01-null-check-c.md):
  not a compiler bug. Dereferencing null is UB in C, and GCC relied on that
  rule.
- Dereferencing a null raw pointer is UB in Rust too, so the optimizer may
  reason exactly like GCC did.
- The `SAFETY:` comment is wrong on purpose: the `# Safety` section allows null,
  and the dereference happens before the check.
- Ask: what's the fix? Move the `is_null()` check above the dereference.
- Raw pointers are the one place Rust lets you write this bug. With `&Tun` or
  `Option<&Tun>`, it doesn't compile.

</details>
