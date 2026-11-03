---
minutes: 5
---

# Fixing an Unsound Logger

This program invokes Undefined Behavior! Which section of code is _unsound_ and
should be fixed?

### `server.cc`

```cpp
// Our C++ server owns the logger and hands Rust a pointer to it.
Logger logger;
Handler* handler = rust_handler_new(&logger);
```

### `handler.rs`

```rust,editable
#[derive(Default)]
pub struct Logger {
    pub lines: Vec<String>,
}

/// Handles requests for our C++ server. The server owns the `Logger`.
pub struct Handler {
    logger: *mut Logger,
}

impl Handler {
    pub fn new(logger: *mut Logger) -> Handler {
        unsafe {
            (*logger).lines.push("handler started".to_string());
        }
        Handler { logger }
    }

    pub fn log(&self, line: &str) {
        let logger = unsafe { &mut *self.logger };
        logger.lines.push(line.to_string());
    }
}
```

### `main.rs`

```rust,no_run,editable
# mod handler {
#     #[derive(Default)]
#     pub struct Logger {
#         pub lines: Vec<String>,
#     }
#     pub struct Handler {
#         logger: *mut Logger,
#     }
#     impl Handler {
#         pub fn new(logger: *mut Logger) -> Handler {
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
# use std::ptr;
use handler::*;

fn main() {
    // This invokes UB with safe code!
    let handler = Handler::new(ptr::null_mut());
    handler.log("request 1");
}
```

<details>

- **Goal:** when UB happens, students can say which code is at fault (the code
  that broke a promise `unsafe` code relied on), and fix it two ways: stay safe,
  or write the promise down. **Arc:** UB from safe code → a null check isn't a
  fix → Fix 1: a reference → Fix 2: `unsafe fn` + `# Safety` → until when? → UB
  that shows up somewhere else.

- Here's an example of code we know to invoke UB.
- Let's step through this.
- Say that `Handler::new` was written by one author, and then `main` by a
  totally different author.
- Author of `main` doesn't know that `logger` must be valid.
- Since `main` writes safe code and UB happens anyway, the program is _unsound_.
- The soundness rules tell us which code is at fault here: it's the author of
  `Handler::new` and _not_ the author of `main`.
- The fix? Two good ones.

- Why a raw pointer? C++ owns the `Logger`, and a C++ caller can only hand us a
  `Logger*`. How it crosses the boundary is Day 2:
  [FFI](../day2-afternoon/05-ffi.md).
- The C++ server isn't the only caller. A teammate writes a Rust `main`.
- Usual wrong answer: `main`, because it passed null.
- No threads here: the handler is a plain value, not a global.

</details>
