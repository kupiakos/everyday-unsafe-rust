---
minutes: 2
---

# Only `Send` Is True

- The C docs allow one thread at a time.
- `Sync` lets two threads call `line(&self)` at once.
- Keep `Send`. Need sharing? `Mutex<Parser>`.

```rust
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

// SAFETY: The C library permits use from any thread, one thread at a time.
// `Parser` exclusively owns `raw`, so sending a `Parser` sends the only path
// to the C object.
unsafe impl Send for Parser {}

// UNSOUND: two threads could then call `line(&self)` at the same time.
// unsafe impl Sync for Parser {}
```

<details>

- **Answer:** only `Send`, because `Sync` lets two threads call `line(&self)` at
  once, then: need sharing? Use `Mutex<Parser>`.

- Answer to the last slide's question: only `Send`.
- The C library's docs are what the `SAFETY:` comment rests on.
- Why not `Sync`: with `Arc<Parser>`, `line(&self)` becomes callable from two
  threads at once. If every method that calls into C took `&mut self`, `Sync`
  would be sound, because a `&Parser` couldn't do anything.
- Need sharing? `Mutex<Parser>` is `Sync` as long as `Parser` is `Send`.

</details>
