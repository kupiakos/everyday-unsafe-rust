
# Solution

- `loop_emit` re-enters `on_event`, so two `&mut State` were live at once.
- Fix: end the borrow before calling out, and make a fresh one after.

```rust,editable
use std::ffi::c_void;

type Callback = unsafe extern "C" fn(*mut Loop, u32, *mut c_void);

pub struct Loop {
    cb: Callback,
    user_data: *mut c_void,
}

unsafe fn loop_emit(lp: *mut Loop, event: u32) {
    unsafe { ((*lp).cb)(lp, event, (*lp).user_data) }
}

const RESIZE: u32 = 1;
const REDRAW: u32 = 2;

struct State {
    resizes: u32,
    log: Vec<String>,
}

unsafe extern "C" fn on_event(lp: *mut Loop, event: u32, user_data: *mut c_void) {
    let p = user_data.cast::<State>();
    // SAFETY: `p` is the pointer registered in `main`: non-null, aligned, and
    // pointing to a live, initialized `State`. Nothing else accesses it while
    // `state` is live, because `state` ends before we call back into the loop.
    let state = unsafe { &mut *p };
    state.log.push(format!("event {event}"));
    if event != RESIZE {
        return;
    }
    state.resizes += 1; // Last use of `state`.
    // SAFETY: `lp` is the loop that called us.
    unsafe { loop_emit(lp, REDRAW) };
    // SAFETY: As above. The nested call's `&mut State` ended when it returned.
    let state = unsafe { &mut *p };
    state.log.push(format!("resized {} times", state.resizes));
}

fn main() {
    let mut state = State { resizes: 0, log: Vec::new() };
    let mut lp = Loop { cb: on_event, user_data: (&raw mut state).cast() };
    // SAFETY: `lp` is a live `Loop`.
    unsafe { loop_emit(&raw mut lp, RESIZE) };
    println!("{:?}", state.log);
}
```

<details>

- **Answer:** `loop_emit` re-enters `on_event` and makes a second live
  `&mut State`; end the borrow before calling out, and make a fresh one after.

- the `SAFETY:` comment should list non-null, aligned, a live initialized
  `State` (validity), and "nothing else accesses it while `state` is live"
  (aliasing).
  - The break: `loop_emit` calls `on_event` again, which makes a second
    `&mut State` while the first is live. One thread, still UB.
  - Usual wrong answer: "the inner call only touches `log`, not `resizes`." Each
    `&mut State` covers the whole `State`.
  - Usual wrong answer: "fine, it's single-threaded." Aliasing is about what the
    optimizer assumes, not about threads.
  - What isn't a fix: `user_data.cast::<State>().as_mut()`. It checks null, and
    nothing else.
  - Another fix: make the callback take `&State`, with `Cell` or `RefCell`
    fields. A `RefCell` turns the bug into a panic.
- the `SAFETY:` comment now names the line it depends on: "`state` ends before
  we call back". A reviewer can check that, and re-check it when someone adds a
  line after `loop_emit`.
- the `p` raw pointer is reused for both borrows. Each `&mut` is made fresh from
  it, and neither outlives a call back into the loop.

</details>
