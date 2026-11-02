---
minutes: 0
---

# Exercise: The Self-Referential Tokenizer

- `main` moves `Tokens`. Is that UB?
- Write a safe `main` that reads a freed token.
- Fix it with no `unsafe`.

```rust,editable
#![allow(dead_code)]
use std::mem::transmute;

pub struct Tokens {
    text: String,
    // Safety invariant: each token points into `text`'s heap buffer.
    tokens: Vec<&'static str>,
}

impl Tokens {
    pub fn new(text: String) -> Self {
        let mut t = Tokens { text: String::new(), tokens: Vec::new() };
        t.push_line(&text);
        t
    }

    /// Appends `line`, and tokenizes only the new part.
    pub fn push_line(&mut self, line: &str) {
        let start = self.text.len();
        self.text.push_str(line);
        for tok in self.text[start..].split_whitespace() {
            // SAFETY: Moving `Tokens` doesn't move `text`'s heap buffer.
            self.tokens.push(unsafe { transmute::<&str, &'static str>(tok) });
        }
    }

    pub fn tokens(&self) -> &[&str] {
        &self.tokens
    }
}

fn main() {
    let t = Tokens::new("let x = 1;".to_string());
    let moved = t;
    println!("{:?}", moved.tokens());
}
```

<details>

- **Goal:** find what really leaves a self-referential pointer dangling (reallocation, not the move), and fix it with no `unsafe` and no `Pin`.

- Hints:
  - Students who just learned `Pin` usually blame the move. What else can
    change where `text`'s bytes live?
  - Triggering it: `t.push_line(&" y".repeat(100))`, then print
    `t.tokens()`.
  - If they're stuck on the fix: it needs no `Pin` either.

</details>
