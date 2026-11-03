---
minutes: 5
---

# Fix 1: Stay Safe

The preferred fix: just stay safe! Don't use `unsafe` unless you really have to.
Let the compiler do its job of validation while you declare what's required.

### `handler.rs`

```rust,editable
#[derive(Default)]
pub struct Logger {
    pub lines: Vec<String>,
}

pub struct Handler<'a> {
    logger: &'a mut Logger,
}

impl<'a> Handler<'a> {
    pub fn new(logger: &'a mut Logger) -> Handler<'a> {
        logger.lines.push("handler started".to_string());
        Handler { logger }
    }

    pub fn log(&mut self, line: &str) {
        self.logger.lines.push(line.to_string());
    }
}
```

### `cpp_glue.rs`

```rust
# #[derive(Default)]
# pub struct Logger {
#     pub lines: Vec<String>,
# }
# pub struct Handler<'a> {
#     logger: &'a mut Logger,
# }
# impl<'a> Handler<'a> {
#     pub fn new(logger: &'a mut Logger) -> Handler<'a> {
#         logger.lines.push("handler started".to_string());
#         Handler { logger }
#     }
#     pub fn log(&mut self, line: &str) {
#         self.logger.lines.push(line.to_string());
#     }
# }
/// Called by the C++ server for each request.
///
/// # Safety
///
/// `logger` must point to a live `Logger` that nothing else uses until this
/// function returns.
pub unsafe fn handle_request(logger: *mut Logger) {
    // SAFETY: The caller promised `*logger` is live, and unused by others,
    // until we return. The reference doesn't escape this function.
    let logger = unsafe { &mut *logger }; // The one raw-pointer conversion.
    let mut handler = Handler::new(logger);
    handler.log("request 1");
}
```

### `main.rs`

```rust
# mod handler {
#     #[derive(Default)]
#     pub struct Logger {
#         pub lines: Vec<String>,
#     }
#     pub struct Handler<'a> {
#         logger: &'a mut Logger,
#     }
#     impl<'a> Handler<'a> {
#         pub fn new(logger: &'a mut Logger) -> Handler<'a> {
#             logger.lines.push("handler started".to_string());
#             Handler { logger }
#         }
#         pub fn log(&mut self, line: &str) {
#             self.logger.lines.push(line.to_string());
#         }
#     }
# }
use handler::*;

fn main() {
    // Different type: the compiler *requires* the callee pass a valid Logger.
    let mut logger = Logger::default();
    let mut handler = Handler::new(&mut logger);
    handler.log("request 1");
}
```

<details>

- **Point:** the preferred fix is a reference: `Handler<'a>` makes the compiler
  check that the logger is valid and outlives the handler, with one raw-pointer
  conversion at the C++ boundary.

- If we switch `Handler::new` to using a reference type, the compiler guarantees
  the referent is valid - there's no unsafe in `handler.rs`, so no UB there.
- We declare how long the pointer must be valid _in the type_ itself. `'a` means
  "borrowed for as long as the `Handler` exists".
- If we still wanted optionality, then `Option<&mut Logger>` is just as
  efficient as passing `*mut Logger`:
  [null is `None`](https://doc.rust-lang.org/std/option/index.html#representation).

- C++ still hands us a pointer. Convert it once, at the boundary.
- The rest of the Rust code, including `main`, gets a checked reference.
- `'a` says the handler can't outlive the logger. The compiler enforces it.
- `handle_request`'s `# Safety` section is a promise about C++ code. If C++ also
  uses the logger while a handler exists, Fix 1 doesn't fit: that's
  [Fix 2](03-fix-2-make-handler-new-unsafe.md).

</details>
