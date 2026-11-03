---
minutes: 10
---

# Exercise: The Event Loop Calls Back

- Fill in the `todo!`, with a `SAFETY:` comment listing what `&mut *` promises.
- Which line breaks your comment? Follow `loop_emit`.
- Fix `on_event` so no `&mut State` is live when the loop can call back.

```rust,editable
#![allow(unreachable_code, unused_variables)]
use std::ffi::c_void;

// == Simulated C library: `void loop_emit(loop_t *lp, int event);` ==

// "Calls the registered callback right away, on the calling thread."
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
    let state: &mut State = todo!("convert `user_data`, with a `SAFETY:` comment");
    state.log.push(format!("event {event}"));
    if event == RESIZE {
        state.resizes += 1;
        // SAFETY: `lp` is the loop that called us.
        unsafe { loop_emit(lp, REDRAW) }; // A resize needs a redraw.
        state.log.push(format!("resized {} times", state.resizes));
    }
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

- **Goal:** a reentrant callback breaks a `&mut` on a single thread, so end the
  borrow before calling out.

- Hints:
  - Hint: go down the references checklist for the `SAFETY:` comment. Which item
    is about _other_ accesses to the `State`?
  - If stuck on the break: what does `loop_emit` call, and with which
    `user_data`?
  - If they say "the inner call only touches `log`, not `resizes`": how much of
    `State` does a `&mut State` cover?
  - If they say "fine, it's single-threaded": what does the optimizer assume
    about a `&mut`?
  - If they use `user_data.cast::<State>().as_mut()`: what does it check?

</details>
