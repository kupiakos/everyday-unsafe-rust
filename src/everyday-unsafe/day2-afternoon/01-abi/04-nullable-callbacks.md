---
minutes: 3
---

# Nullable Callbacks

- C function pointers may be `NULL`.
- Rust `fn` pointers may not.
- `Option<extern "C" fn(..)>`: same ABI.
- `None` is `NULL`.

```rust
use std::ffi::c_void;

#[repr(C)]
pub struct lp_parser {
    _private: [u8; 0],
}

/// Opaque for now: we only pass pointers to it.
#[repr(C)]
pub struct lp_record {
    _private: [u8; 0],
}

pub type lp_callback =
    unsafe extern "C" fn(user: *mut c_void, rec: *const lp_record);

unsafe extern "C" {
    // C: `void lp_set_callback(lp_parser *p, lp_callback cb, void *user);`
    // `cb` may be NULL, which maps to `None`.
    pub fn lp_set_callback(
        p: *mut lp_parser,
        cb: Option<lp_callback>,
        user: *mut c_void,
    );
}
```

<details>

- **Point:** a Rust `fn` pointer is never null, so a C callback that may be NULL
  is `Option<extern "C" fn>`, which has the same ABI.

- A Rust `fn` pointer, like a reference, is never null. A null one is an invalid
  value, which is UB.
- `Option<fn>` uses null as `None`. This is guaranteed for `extern "C" fn`, so
  `Option<lp_callback>` has exactly the ABI of C's `lp_callback`.
- Direction matters: passing a non-`Option` `fn` to C is only less flexible.
  Receiving one from C (a return value or struct field) that might be null is
  UB.
- Callbacks are `unsafe extern "C" fn`: C may call them with any `user` pointer,
  so the callback has a precondition. We write it in the FFI section.

</details>
