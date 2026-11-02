---
minutes: 3
---

# Hand-Written Bindings

- Rust can't read C headers.
- You declare each function yourself.
- `unsafe extern`: "I promise this matches."
- The compiler can't check that promise.

```rust
use std::ffi::{c_char, c_int};

/// Opaque: only C knows what's inside.
#[repr(C)]
pub struct lp_parser {
    _private: [u8; 0],
}

// You promise these match `logparse.h`. Nothing checks it.
unsafe extern "C" {
    pub fn lp_new() -> *mut lp_parser;
    pub fn lp_feed(p: *mut lp_parser, buf: *const c_char, len: usize) -> c_int;
    pub fn lp_free(p: *mut lp_parser);
}
```

<details>

- **Point:** an `unsafe extern` block is a promise that each declaration matches C, and nothing checks it.

- Since the 2024 edition, an `extern` block must be written `unsafe extern`.
  The `unsafe` is on the block because the block itself is the unchecked
  promise.
- Every function in it is `unsafe` to call by default. You can mark one
  `safe fn` if calling it can never cause UB.
- Ask: "Could any of these be `safe fn`?" `lp_new` takes no arguments, and
  leaking its result is safe, so yes, if its docs agree. The other two take
  pointers that must be live, so no.
- The zero-sized private field makes `lp_parser` a type that Rust code can't
  construct or look inside. It's only ever used behind a pointer.

</details>
