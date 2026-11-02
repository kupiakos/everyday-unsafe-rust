
# Solution

- `push_str` reallocated `text`. Moving `Tokens` was never the problem.
- Store byte ranges, and slice `text` when asked.

```rust,editable
#![allow(dead_code)]
use std::ops::Range;

pub struct Tokens {
    text: String,
    tokens: Vec<Range<usize>>, // Byte ranges into `text`. No `unsafe`.
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
        let base = self.text.as_ptr() as usize;
        for tok in self.text[start..].split_whitespace() {
            let begin = tok.as_ptr() as usize - base; // `tok` is in `text`.
            self.tokens.push(begin..begin + tok.len());
        }
    }

    pub fn tokens(&self) -> impl Iterator<Item = &str> {
        self.tokens.iter().map(|r| &self.text[r.clone()])
    }
}

fn main() {
    let mut t = Tokens::new("let x = 1;".to_string());
    t.push_line(&" y".repeat(1000)); // Reallocates `text`: still fine.
    assert_eq!(t.tokens().take(3).collect::<Vec<_>>(), ["let", "x", "="]);
}
```

<details>

- **Answer:** `push_str` reallocates `text`. Store byte ranges, and slice `text`
  when asked.

- moving is fine. A `String` move copies the pointer, not the heap buffer.
  - Trigger it: `t.push_line(&" y".repeat(100))`, then print `t.tokens()`. Every
    older token points into the freed buffer.
  - The `SAFETY:` comment answers the wrong question: it rules out moves, not
    reallocation.
  - Not a fix: `Pin<Box<Tokens>>`. It keeps `Tokens` in place, but the bytes
    live in `text`'s buffer. Not a fix: `String::with_capacity`. It holds until
    one line is longer than you guessed.
  - Byte ranges into `text` need no `unsafe`, and survive both moves and
    reallocation. Often you don't need `Pin` at all.
- the address subtraction is plain integer math on two addresses in the same
  `String`, so it needs no `unsafe`. Slicing `text` is bounds-checked.
- the old `tokens()` returned `&[&str]`, tied to `&self`. Returning
  `&[&'static str]` would have been a second bug: a token that outlives
  `Tokens`.

</details>
