---
minutes: 3
---

# How Long Must It Stay Valid?

- `Handler::new` is an `unsafe fn` now.
- `make_handler` writes a `SAFETY:` comment.
- Check it against the `# Safety` section.

## `handler.rs`

```rust
# #[derive(Default)]
# pub struct Logger {
#     pub lines: Vec<String>,
# }
# pub struct Handler {
#     logger: *mut Logger,
# }
impl Handler {
    /// Creates a handler that logs to `*logger`.
    ///
    /// # Safety
    ///
    /// - `logger` must point to a live `Logger` for as long as the
    ///   `Handler` exists.
    /// - Nothing else may use `*logger` while a `Handler` method runs.
    pub unsafe fn new(logger: *mut Logger) -> Handler {
        // SAFETY: The caller promised `logger` points to a live `Logger`,
        // and nothing else uses it during this call.
        unsafe {
            (*logger).lines.push("handler started".to_string());
        }
        Handler { logger }
    }
#     pub fn log(&self, line: &str) {
#         let logger = unsafe { &mut *self.logger };
#         logger.lines.push(line.to_string());
#     }
}
```

## `main.rs`

```rust,no_run
# #[derive(Default)]
# pub struct Logger {
#     pub lines: Vec<String>,
# }
# pub struct Handler {
#     logger: *mut Logger,
# }
# impl Handler {
#     pub unsafe fn new(logger: *mut Logger) -> Handler {
#         unsafe {
#             (*logger).lines.push("handler started".to_string());
#         }
#         Handler { logger }
#     }
#     pub fn log(&self, line: &str) {
#         let logger = unsafe { &mut *self.logger };
#         logger.lines.push(line.to_string());
#     }
# }
fn make_handler() -> Handler {
    let mut logger = Logger::default();
    // SAFETY: `&mut logger` points to a live `Logger`, and nothing else
    // uses it.
    unsafe { Handler::new(&mut logger) }
}

fn main() {
    let handler = make_handler();
    handler.log("request 1");
}
```

<details>

- **Question:** students find the requirement the caller's `SAFETY:` comment
  forgot: how long. The answer is on the next slide.

- Ask: is `make_handler`'s `SAFETY:` comment right? Usual wrong answer: "yes,
  `&mut logger` is a valid pointer".
- Expected answer: no. `new` asked for "for as long as the `Handler` exists".
  The comment checked "live" and skipped "how long". `logger` is dropped when
  `make_handler` returns, the `Handler` still points to it, and `log` uses it
  after that: UB.
- `Handler::new` is `unsafe` and documented, so the blame is on `make_handler`.
  The next slide opens with that.
- Ask: how would Fix 1 handle this? `Handler<'a>` ties the handler to the borrow
  of `logger`, and `make_handler` doesn't compile (E0515).

</details>
