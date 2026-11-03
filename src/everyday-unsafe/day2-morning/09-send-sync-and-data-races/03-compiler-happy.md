---
minutes: 2
---

# Making the Compiler Happy

- Adding both `unsafe impl`s compiles.
- Read the C docs on `Parser`.
- Which `unsafe impl` is true?

```rust,editable
use std::ffi::c_void;

/// C docs: "A parser may be used from any thread, but by one thread at a time."
pub struct Parser {
    raw: *mut c_void,
}

impl Parser {
    pub fn feed(&mut self, _input: &str) { /* C call using `self.raw` */
    }
    pub fn line(&self) -> usize {
        /* C call using `self.raw` */
        0
    }
}

// Added to make the thread pool compile.
// SAFETY: The C library permits use from any thread.
unsafe impl Send for Parser {}
// SAFETY: The C library permits use from any thread.
unsafe impl Sync for Parser {}
```

<details>

- **Question:** students decide which `unsafe impl` the C docs justify: only
  `Send`, since "one thread at a time" rules out `Sync`. The answer is on
  [Only `Send` Is True](04-only-send.md).

- Ask: "Which of these two `unsafe impl`s is true?"
  [Only `Send` Is True](04-only-send.md) has the answer.
- Expected: only `Send`. "One thread at a time" rules out `Sync`, because
  `line(&self)` could run on two threads at once.
- Usual wrong answer: "We never share it, so `Sync` is harmless." An
  `unsafe impl` is a promise about what _any_ safe code may do.
- Point at the copy-pasted `SAFETY:` comments: neither one mentions "one thread
  at a time".

</details>
