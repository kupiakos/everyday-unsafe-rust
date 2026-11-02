---
minutes: 3
---

# Your Type's Rules

- `head < buf.len()` is a library invariant.
- Write it on the field.
- `unsafe` code may rely on it.
- Each write to `head` comments why it's still `< buf.len()`.

```rust
pub struct RingBuffer {
    buf: Vec<u32>,
    // Safety invariant: `head < buf.len()`.
    head: usize,
}

impl RingBuffer {
    pub fn new(len: usize) -> Self {
        assert!(len > 0);
        // Maintains the invariant on `head`: `0 < len == buf.len()`.
        RingBuffer { buf: vec![0; len], head: 0 }
    }

    pub fn current(&self) -> u32 {
        // SAFETY: `head < buf.len()`, by the invariant on `head`.
        unsafe { *self.buf.get_unchecked(self.head) }
    }

    pub fn advance(&mut self) {
        // Maintains the invariant on `head`: `x % buf.len()` is `< buf.len()`.
        self.head = (self.head + 1) % self.buf.len();
    }
}
```

<details>

- **Point:** your type can add its own rule (`head < buf.len()`), written on the field as a safety invariant that `unsafe` code relies on.

- Story 3.6. The compiler knows nothing about `head < buf.len()`. It's a rule
  this module adds on top of the language.
- The `SAFETY:` comment in `current` cites the invariant instead of a local
  check.
- Writing a private field isn't `unsafe`, so there's no `SAFETY:` comment on a
  write. "Maintains the invariant on `head`" mirrors "by the invariant on
  `head`", so a reviewer can grep for both. With unsafe fields (RFC 3458, not
  stable yet), `head` could be declared `unsafe`. Then writing it needs an
  `unsafe` block, and this comment becomes a `SAFETY:` comment.
- Ask: "Which functions do you have to read to trust `current`?" Every one that
  writes `head` or `buf`: `new` and `advance`.

</details>
