---
minutes: 3
---

# The Callback Panics

- A panic escaping `extern "C"`
  [aborts the process](https://doc.rust-lang.org/reference/panic.html#unwinding-across-ffi-boundaries).
- [`extern "C-unwind"`](https://doc.rust-lang.org/nomicon/ffi.html#ffi-and-unwinding)
  lets it unwind instead.
- Or [catch it](https://doc.rust-lang.org/std/panic/fn.catch_unwind.html#notes),
  and resume after C returns.

```rust
use std::any::Any;
use std::ffi::c_void;
use std::panic::{self, AssertUnwindSafe};
# #[repr(C)]
# pub struct lp_record {
#     _private: [u8; 0],
# }

pub struct State {
    pub records: u64,
    pub handler: Box<dyn FnMut(u64)>, // The user's code. It may panic.
    pub panic: Option<Box<dyn Any + Send>>,
}

unsafe extern "C" fn on_record(user: *mut c_void, _rec: *const lp_record) {
    // SAFETY: `user` is the pinned `State` that `Parser::new` registered, and
    // C only calls us while the parser is alive.
    let state = unsafe { &mut *user.cast::<State>() };
    state.records += 1;
    let n = state.records;
    // Without `catch_unwind`, a panic in `handler` aborts the process here.
    if let Err(payload) = panic::catch_unwind(AssertUnwindSafe(|| (state.handler)(n))) {
        state.panic = Some(payload); // `Parser::feed` resumes it after C returns.
    }
}
```

<details>

- **Point:** a panic can't leave an `extern "C"` callback without aborting, so
  catch it at the boundary and resume it after C returns.

- Since Rust 1.81, a panic that reaches an `extern "C"` function aborts. Before
  that, unwinding into C was UB. An abort is safe, but it's still a crash.
- [`extern "C-unwind"`](https://doc.rust-lang.org/reference/items/functions.html#unwinding)
  allows the panic to unwind through the foreign frames. Only use it when the
  code in between is built to be unwound through and stays consistent. A C
  library like `logparse` usually isn't.
- So catch the panic at the boundary, return to C normally, and call
  `panic::resume_unwind(payload)` in `feed` once `lp_feed` has returned.
- Recall
  [Code You Don't Control Can Panic](../../day2-morning/05-panics-leaks-and-drop-guarantees/02-code-can-panic.md):
  any call to code you don't control may panic. Here that's the user's
  `handler`, and it can't be a promise, because handler code is safe.

</details>
