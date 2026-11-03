---
minutes: 2
---

# A Safe `Handler::new`

- [How Long Must It Stay Valid?](04-how-long-must-it-stay-valid.md):
  `make_handler` was at fault. Every requirement needs an end.
- Now `Handler::new` only stores the pointer, so it's safe?
- No `unsafe` in `main.rs`. The UB happens inside `log`.
- Who's at fault?

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
    pub fn new(logger: *mut Logger) -> Handler {
        // No unsafe operation here: storing a pointer is safe.
        Handler { logger }
    }

    pub fn log(&self, line: &str) {
        // SAFETY: ???
        let logger = unsafe { &mut *self.logger };
        logger.lines.push(line.to_string());
    }
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
#     pub fn new(logger: *mut Logger) -> Handler {
#         Handler { logger }
#     }
#     pub fn log(&self, line: &str) {
#         let logger = unsafe { &mut *self.logger };
#         logger.lines.push(line.to_string());
#     }
# }
fn make_handler() -> Handler {
    let mut logger = Logger::default();
    Handler::new(&mut logger) // Safe call.
} // `logger` is dropped here.

fn main() {
    let handler = make_handler();
    handler.log("request 1"); // UB inside `log`.
}
```

<details>

- **Answer:** `make_handler`'s comment skipped "for as long as the `Handler`
  exists". **Question:** with `new` safe and the UB inside `log`, who's at
  fault? The answer is on
  [`Handler::new` Is at Fault](06-handler-new-is-at-fault.md).

- Answer to the question on
  [How Long Must It Stay Valid?](04-how-long-must-it-stay-valid.md):
  `make_handler`'s `SAFETY:` comment checked "live" and skipped "for as long as
  the `Handler` exists". Every requirement has an end: "until the borrow ends",
  "until `free`", "for as long as the `Handler` exists". Look for it in every
  `# Safety` section from now on.
- The same `make_handler` as
  [How Long Must It Stay Valid?](04-how-long-must-it-stay-valid.md), but `new`
  no longer touches the logger, so someone made it safe.
- Ask: which code is unsound? Usual wrong answer: `log`, because that's where
  the UB happens. Another: `make_handler`, again.
- Hint if needed: what can `log` write after `SAFETY:`? What did `new` promise
  its callers?
- [`Handler::new` Is at Fault](06-handler-new-is-at-fault.md) has the answer.

</details>
