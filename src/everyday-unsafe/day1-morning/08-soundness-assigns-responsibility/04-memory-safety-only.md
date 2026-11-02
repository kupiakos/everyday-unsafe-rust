---
minutes: 1
---

# A Dangerous `connect`

- Calling `connect` twice is a serious bug.
- So it's an `unsafe fn`.
- Is that a good use of `unsafe`?

```rust
pub struct Connection;

/// Opens a connection to the database.
///
/// # Safety
///
/// Call this at most once per program.
pub unsafe fn connect() -> Connection {
    Connection
}
```

<details>

- **Question:** students decide whether "call at most once" justifies an
  `unsafe fn` (no: a second call is a bug, but not UB). The answer is on the
  next slide.

- Ask: is this a good use of `unsafe`? Usual answer: "yes, it's dangerous".
- Expected answer: no. A second connection is a bug, but not UB.
- Hint if needed: what rule of the language does a second call break?
- The next slide has the answer.

</details>
