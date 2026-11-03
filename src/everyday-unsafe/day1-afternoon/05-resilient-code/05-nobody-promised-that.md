---
minutes: 2
---

# Nobody Promised That

- Your code broke it. The docs never said "non-empty".
- The `SAFETY:` comment relied on today's behavior, not the interface.
- Fix: check, or get the promise written down.

```rust
# mod config {
#     pub fn names() -> Vec<String> {
#         vec![String::from("default")]
#     }
# }
// Check:
pub fn primary_name() -> Option<String> {
    config::names().first().cloned()
}
```

```rust,editable
mod config {
    /// Returns the configured names.
    ///
    /// # Safety-usable invariant
    ///
    /// The returned `Vec` is never empty.
    pub fn names() -> Vec<String> {
        vec![String::from("default")]
    }
}

// Or get the promise written down, and cite it:
pub fn primary_name() -> String {
    let names = config::names();
    // SAFETY: Relies on the safety-usable invariant of `config::names`: the
    // `Vec` is never empty, so index 0 is in bounds.
    unsafe { names.get_unchecked(0) }.clone()
}
```

<details>

- **Answer:** your code, because its `SAFETY:` comment relied on today's
  behavior, not a documented promise, then check it, or get the guarantee
  written into the docs.

- Answer to the question on [A Minor Version Bump?](04-minor-version-bump.md).
- A patch release is just another future edit, like a new target. The `SAFETY:`
  comment was true on the day it was written.
- If the check matters for performance, ask `config` to document the guarantee.
  One convention for this is a `# Safety-usable invariant` section on the safe
  function. Then a breaking change to it is a semver break, and the `SAFETY:`
  comment can cite it. The second block shows both halves.
- A proof that reads another function's body is fragile for the same reason: the
  body can change without its docs changing.

</details>
