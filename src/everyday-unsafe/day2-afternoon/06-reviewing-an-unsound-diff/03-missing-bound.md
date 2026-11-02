---
minutes: 1
---

# Bug 2: Parsing on a Pool

- The PR makes `Parser<H>` `Send`, to parse on a thread pool.
- Which safe caller triggers UB?
- Hint: the caller chooses `H`.

```rust
use std::ffi::c_void;

pub struct Parser<H> {
    raw: *mut c_void, // The C parser.
    handler: H,       // Called on the library's worker thread.
}

impl<H: FnMut(u64)> Parser<H> {
    pub fn handle(&mut self, n: u64) {
        (self.handler)(n)
    }
}

// SAFETY: The C library permits use from any thread, one thread at a time.
unsafe impl<H> Send for Parser<H> {}
```

<details>

- **Question:** students find a safe caller that picks an `H` that isn't `Send`,
  like a handler holding an `Rc`. The answer is on the next slide.

- Ask: "Which safe caller triggers UB?" Give the class a minute before the next
  slide.
- Expected answer: a handler that captures an `Rc`, with one clone kept on this
  thread. Send the `Parser` to another thread, and both threads update the
  count: a data race.
- Usual wrong answer: "It's fine, the C library allows any thread." The
  `SAFETY:` comment is true about `raw`. Ask what it says about `handler`.
- If the class is stuck: this morning's `LeakyBox` on the `Send`/`Sync` page.

</details>
