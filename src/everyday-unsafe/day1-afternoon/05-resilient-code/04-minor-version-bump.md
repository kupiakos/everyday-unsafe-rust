---
minutes: 2
---

# A Minor Version Bump?

- Your crate depends on `config` 1.4.0.
- `config` 1.4.1 returns an empty `Vec` when nothing is configured.
- Nobody touched your code. Whose bug is it?

```rust
mod config {
    /// Returns the configured names.
    pub fn names() -> Vec<String> {
        vec![String::from("default")] // Today's implementation.
    }
}

pub fn primary_name() -> String {
    let names = config::names();
    // SAFETY: `names()` always returns at least one name.
    unsafe { names.get_unchecked(0) }.clone()
}
```

<details>

- **Question:** students decide whose bug it is when a patch release of `config` returns an empty `Vec` (yours: `names()` never promised non-empty). The answer is on the next slide.

- Ask: "Who broke it: `config`'s author, or you?" Let the class argue, and
  hold the answer for the next slide.
- Usual wrong answer: "`config` did. It changed behavior in a patch release."
- Hint if stuck: read `names()`'s doc comment. What does it promise?

</details>
