---
minutes: 5
---

# Writing `SAFETY:` Comments

- `# Safety`: what callers must ensure.
- `SAFETY:`: why it's true at this line.

```rust,ignore,editable
/// # Safety
///
/// - `logger` must point to a live `Logger` for as long as the `Handler`
///   exists.
/// - Nothing else may use `*logger` while a `Handler` method runs.
pub unsafe fn new(logger: *mut Logger) -> Handler { ... }

fn main() {
    let mut logger = Logger::default();
    // SAFETY: `logger` outlives `handler`: both drop at the end of `main`,
    // `handler` first. Nothing else uses `logger`.
    let handler = unsafe { Handler::new(&mut logger) };
}
```

<details>

- **Goal:** students write a `SAFETY:` comment that answers every bullet of the
  callee's `# Safety`, with evidence that still holds at that line. **Arc:**
  `# Safety` vs `SAFETY:` → one line per bullet → `(NULL, 0)` from C → non-null
  even for zero → evidence, not reassurance → a stale comment → one block, one
  proof → exercises.

- This is the logger's
  [Fix 2: Make `Handler::new` `unsafe`](../day1-morning/06-fixing-an-unsound-logger/03-fix-2-make-handler-new-unsafe.md),
  trimmed to the pair.
- `# Safety` is written once, by the author of the `unsafe fn`. `SAFETY:` is
  written at every call site, by the caller.
- The comment names the requirement and the evidence: `logger` and `handler` are
  locals in the same scope, and `handler` drops first.
- Ask: "If this program has UB, who is at fault now?" Whoever wrote a false
  `SAFETY:` comment, or a `# Safety` section that left something out.

</details>
