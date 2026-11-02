---
minutes: 4
---

# The Callback Re-enters

- C calls `on_record` from inside `lp_feed`.
- `feed` still holds a `&mut State`.
- `on_record` makes a second one: UB.
- Don't hold references across calls into C.

```rust
use std::ffi::{c_char, c_int};
use std::marker::PhantomPinned;
use std::pin::Pin;
# #[repr(C)]
# pub struct lp_parser {
#     _private: [u8; 0],
# }
# unsafe extern "C" {
#     fn lp_feed(p: *mut lp_parser, buf: *const c_char, len: usize) -> c_int;
# }

pub struct State {
    pub records: u64,
    pub errors: u64,
    _pin: PhantomPinned,
}

pub struct Parser {
    raw: *mut lp_parser,
    state: Pin<Box<State>>, // C's `user` pointer points here.
}

impl Parser {
    pub fn feed(&mut self, buf: &[u8]) {
        // SAFETY: We don't move the `State` out.
        let state = unsafe { self.state.as_mut().get_unchecked_mut() };
        // SAFETY: `raw` is live, and `buf` is valid for `buf.len()` bytes.
        let ret = unsafe { lp_feed(self.raw, buf.as_ptr().cast(), buf.len()) };
        // UB: during `lp_feed`, `on_record` made a second `&mut State` while
        // `state` was still live.
        state.errors += u64::from(ret != 0);
    }
}
```

<details>

- **Point:** a `&mut State` held across a call into C aliases the one the callback makes from `user`: UB, even on one thread.

- Every `SAFETY:` comment here is true about its own line. The bug is between
  them: `state` is a `&mut State` that's live across the call into C, and
  `on_record` makes another `&mut State` from `user` during that call.
- Two `&mut`s to the same `State` in use at once is UB, even with one thread.
  The compiler may assume `state.errors` and `state.records` didn't change
  during `lp_feed`.
- Fix: finish with `state` before calling C, and get a fresh reference after
  it returns. The conservative version keeps only a raw pointer to `State`
  (from `Box::into_raw`), and makes short-lived references from it, never
  across a call into C.
- Re-entry can also come from the user: if a handler could reach the `Parser`
  (say, through `Rc<RefCell<..>>`), it could call `feed` from inside `feed`.
  Check what the C library allows.

</details>
