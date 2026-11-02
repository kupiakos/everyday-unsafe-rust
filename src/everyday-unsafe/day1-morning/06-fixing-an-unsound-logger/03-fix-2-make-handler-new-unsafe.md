---
minutes: 5
---

# Fix 2: Make `Handler::new` `unsafe`

The other option is that `handler.rs` declare its init function as `unsafe`. Add
`Safety`/`SAFETY` docs.

### `handler.rs`

```rust
#[derive(Default)]
pub struct Logger {
    pub lines: Vec<String>,
}

pub struct Handler {
    logger: *mut Logger,
}

impl Handler {
    /// Creates a handler that logs to `*logger`.
    ///
    /// # Safety
    ///
    /// - `logger` must point to a live `Logger` for as long as the `Handler`
    ///   exists.
    /// - Nothing else may use `*logger` while a `Handler` method runs.
    pub unsafe fn new(logger: *mut Logger) -> Handler {
        // SAFETY: The caller promised `logger` points to a live `Logger`,
        // and nothing else uses it during this call.
        unsafe {
            (*logger).lines.push("handler started".to_string());
        }
        Handler { logger }
    }

    pub fn log(&self, line: &str) {
        // SAFETY: The caller of `new` promised `*self.logger` is live while
        // `self` exists, and unused by others while we run.
        let logger = unsafe { &mut *self.logger };
        logger.lines.push(line.to_string());
    }
}
```

### `main.rs`

- The author of `main` must now write `unsafe` and document that they're
  upholding the memory safety requirements declared by `handler.rs`.
- If `main` gets its `unsafe` wrong it's the fault of `main`, not
  `Handler::new`.

```rust
# mod handler {
#     #[derive(Default)]
#     pub struct Logger {
#         pub lines: Vec<String>,
#     }
#     pub struct Handler {
#         logger: *mut Logger,
#     }
#     impl Handler {
#         pub unsafe fn new(logger: *mut Logger) -> Handler {
#             unsafe {
#                 (*logger).lines.push("handler started".to_string());
#             }
#             Handler { logger }
#         }
#         pub fn log(&self, line: &str) {
#             let logger = unsafe { &mut *self.logger };
#             logger.lines.push(line.to_string());
#         }
#     }
# }
# use handler::*;
fn main() {
    // The caller must write unsafe: it's now our responsibility to pass a
    // valid pointer.
    let mut logger = Logger::default();

    // SAFETY: `logger` outlives `handler`: both drop at the end of `main`,
    // `handler` first. Nothing else uses `logger` while `handler` exists.
    let handler = unsafe { Handler::new(&mut logger) };
    handler.log("request 1");
}
```

<details>

- **Point:** when a reference won't fit (C++ also uses the logger), make
  `Handler::new` an `unsafe fn` with a `# Safety` section; the caller's
  `SAFETY:` comment then carries the blame.

- The title-case `Safety` says "you must uphold these requirements"
- The all-caps `SAFETY` says "I am upholding these requirements"
- Why would you do this? Raw pointers give more flexibility: I am able to hold
  onto a `logger` pointer after calling `Handler::new`, so long as I don't try
  to access it during the `log` fn.
- That second `Safety` requirement for `Handler::new` can be pretty non-local!
  It's making a promise about whatever code is aliasing the `logger`.
- A fix may be to switch `log` to be `unsafe` as well, but that could be very
  noisy. If `fn log` were `unsafe` then `new`'s second requirement could move to
  it: it's now a safety responsibility of the caller to ensure nothing else uses
  the logger during `handler.log`.
- Best to stay safe and use references where needed.
- In future slides we'll go over in more detail how one designs a sound
  interface that uses `unsafe` internally.

- Why choose this over Fix 1? The C++ server logs too, between Rust calls. A
  `&mut Logger` held the whole time would be a lie.
- The second requirement allows that: C++ may use the logger, just not while a
  `Handler` method runs.
- `log` stays safe. Its `SAFETY:` comment points back to `new`'s contract.
- `main`'s `SAFETY:` comment answers each line of `new`'s `# Safety` section.

</details>
