---
minutes: 2
---

# The Renovation

- `as_str` was sound.
- Then someone added a safe method.
- Nobody touched the `unsafe` block.
- Which function is at fault?

```rust
pub struct Digits {
    // Safety invariant: every byte is an ASCII digit.
    bytes: Vec<u8>,
}

impl Digits {
    pub fn as_str(&self) -> &str {
        // SAFETY: ASCII digits are valid UTF-8, by the invariant on `bytes`.
        unsafe { std::str::from_utf8_unchecked(&self.bytes) }
    }

    // Added later, in a "harmless" refactor.
    pub fn push_byte(&mut self, b: u8) {
        self.bytes.push(b);
    }
}
```

<details>

- **Question:** students work out which function is at fault after a safe `push_byte` is added and `as_str`'s `unsafe` block is untouched (`push_byte`). The answer is on the next slide.

- An electrician moves an outlet, and a label at the panel that used to be
  right is now wrong.
- Ask: which function is at fault? Usual wrong answer: `as_str`, because it
  holds the `unsafe` block. Expected answer: `push_byte`. It's safe, and
  `push_byte(0xFF)` breaks the invariant from safe code.
- Hint if needed: what does the comment on `bytes` promise, and who can break
  it?
- The next slide has the answer and the fix.

</details>
