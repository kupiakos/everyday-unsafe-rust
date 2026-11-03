---
minutes: 5
---

# Null Checks Don't Make It Sound

This code still invokes Undefined Behavior! Null checks are **not a fix for
unsoundness**!

### `handler.rs`

```rust,editable
#[derive(Default)]
pub struct Logger {
    pub lines: Vec<String>,
}

pub struct Handler {
    logger: *mut Logger,
}

impl Handler {
    pub fn new(logger: *mut Logger) -> Handler {
        // This assert is not a fix!
        assert!(!logger.is_null(), "logger must be non-null");
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

```rust,no_run
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
#             assert!(!logger.is_null(), "logger must be non-null");
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
# use std::ptr::NonNull;
use handler::*;

fn main() {
    // This still invokes UB with safe code!
    let handler = Handler::new(NonNull::dangling().as_ptr());
    handler.log("request 1");
}
```

<details>

- **Point:** "valid" is more than non-null. A dangling pointer gets past the
  check, and the safe signature still promises every caller it's fine.

- First let me show you a _bad_ fix.
- Null pointer checks **do not fix this problem**.
- There is no runtime check you can do to confirm that a raw pointer is valid. A
  null pointer will never be valid, but there are plenty of invalid non-null
  pointers.
- The validity of a pointer is based on how and when it is used, not the pointer
  value itself.
- [`NonNull::dangling`](https://doc.rust-lang.org/std/ptr/struct.NonNull.html#method.dangling)
  is roughly equivalent to a use-after-free.

- `NonNull::dangling()` is non-null, aligned, and points at no `Logger`.
- A C++ developer has seen this before: a non-null pointer to a freed object.

</details>
