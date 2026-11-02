---
minutes: 1
---

# The `void* user_data` Callback

- C hands back the `void*` you registered.
- One line turns it into `&mut State`.
- List what that line promises.

```rust
use std::ffi::c_void;

struct State {
    clicks: u32,
}

/// # Safety
///
/// `user_data` must be the pointer registered with the event library.
unsafe extern "C" fn on_click(user_data: *mut c_void) {
    // SAFETY: What does this line promise?
    let state = unsafe { &mut *user_data.cast::<State>() };
    state.clicks += 1;
}
```

<details>

- **Question:** students list everything `&mut *user_data.cast::<State>()`
  promises: validity, aliasing, and for how long. The answer is on the next
  slide.

- Story 3.8. Ask: "List what that line promises." Write the list on the board.
  The next slide has the full `SAFETY:` comment.
- Expected: non-null, aligned, live, an initialized `State`, nothing else
  accessing it, and for how long: this call.
- Usual misses: aliasing ("nothing else accesses it") and the duration. Students
  who just did Pointers in Full list the pointer checklist and stop.

</details>
