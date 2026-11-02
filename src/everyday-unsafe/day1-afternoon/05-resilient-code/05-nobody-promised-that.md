---
minutes: 2
---

# Nobody Promised That

- Your code broke it. The docs never said "non-empty".
- The `SAFETY:` comment relied on today's behavior, not the interface.
- Fix: check, or get the promise written down.

```rust
pub fn primary_name() -> Option<String> {
    config::names().first().cloned()
}
```

<details>

- **Answer:** your code, because its `SAFETY:` comment relied on today's behavior, not a documented promise, then check it, or get the guarantee written into the docs.

- Answer to the last slide's question.
- A patch release is just another future edit, like a new target. The
  `SAFETY:` comment was true on the day it was written.
- If the check matters for performance, ask `config` to document the
  guarantee. Dmytro's convention for this is a `# Safety-usable invariant`
  section on the safe function. Then a breaking change to it is a semver
  break, and the `SAFETY:` comment can cite it.
- A proof that reads another function's body is fragile for the same reason:
  the body can change without its docs changing.

</details>
