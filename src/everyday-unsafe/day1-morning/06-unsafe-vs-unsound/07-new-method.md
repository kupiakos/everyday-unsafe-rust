---
minutes: 2
---

# `push_byte` Is at Fault

- `push_byte(0xFF)` breaks the invariant from safe code.
- `as_str` didn't change, and it's now unsound.
- Review the whole module.

```rust
pub struct Digits {
    // Safety invariant: every byte is an ASCII digit.
    bytes: Vec<u8>,
}

impl Digits {
    pub fn push_byte(&mut self, b: u8) {
        assert!(b.is_ascii_digit(), "not an ASCII digit");
        self.bytes.push(b);
    }
}
```

<details>

- **Answer:** `push_byte`, because safe code can use it to break the safety invariant `as_str` relies on, then the whole module is the unit of review.

- Answer to the last slide's question: `push_byte`. It's safe, and it lets a
  caller break the invariant that `as_str`'s `SAFETY:` comment relies on.
- Fix: check `b.is_ascii_digit()`, and panic or return an error.
- `bytes` is private, so only code in this module can break the invariant.
  That's what makes the `SAFETY:` comment checkable, and why the module is the
  unit of review.
- Unsoundness is about wrong labels, not about the line that crashes.

</details>
