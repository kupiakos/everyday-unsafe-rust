---
minutes: 3
---

# The Plugin Calls Back

- Last slide: the optimizer may assume no alias. `f` may return the old `*x`.
- Your callback calls into a C plugin.
- The plugin calls your callback again.
- Two live `&mut State`: UB, on one thread.

```rust
use std::ffi::c_void;

struct State {
    clicks: u32,
}

unsafe extern "C" {
    // A C plugin's hook. Sometimes it calls `on_click(user_data)` again.
    fn plugin_notify(user_data: *mut c_void);
}

unsafe extern "C" fn on_click(user_data: *mut c_void) {
    // SAFETY: (wrong) "Nothing else accesses the `State` during this call."
    let state = unsafe { &mut *user_data.cast::<State>() };
    state.clicks += 1;
    // If the plugin calls `on_click` again, the inner call creates a second
    // `&mut State` while `state` is still live: UB, on a single thread.
    unsafe { plugin_notify(user_data) };
    state.clicks += 1;
}
```

<details>

- **Answer:** aliasing is about what the optimizer assumes, not threads, then: a
  reentrant C callback can make two live `&mut State` on one thread.

- Answer to the last slide's question: aliasing is about what the optimizer may
  assume, not about threads. With `x` and `y` both live, `f` may print 0 or 1.
- The `void* user_data` callback from earlier in this section, with one change:
  it calls a plugin while `state` is live.
- The plugin got the same pointer when it was registered, and nothing stops it
  from calling back. The `# Safety` promise, "nothing else accesses the
  `State`", was never true.
- Fix: end the borrow before calling out. Use `state` last before
  `plugin_notify`, and create a fresh `&mut` after it returns.
- Or make `State` shareable: `&State` with `Cell` fields, coming up in
  Mutability.

</details>
