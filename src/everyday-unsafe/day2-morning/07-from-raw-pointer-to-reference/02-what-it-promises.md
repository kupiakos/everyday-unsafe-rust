---
minutes: 2
---

# What That Line Promises

- Validity: non-null, aligned, a live, initialized `State`.
- Aliasing: nothing else accesses it.
- For how long: while `state` is live.

```rust
use std::ffi::c_void;

struct State {
    clicks: u32,
}

/// # Safety
///
/// `user_data` must be the pointer registered with the event library: a live
/// `State` that nothing else accesses during this call.
unsafe extern "C" fn on_click(user_data: *mut c_void) {
    // SAFETY: Creating this `&mut State` asserts that `user_data` is
    // non-null, aligned, points to a live initialized `State` (validity), and
    // isn't accessed any other way while `state` is live (aliasing,
    // mutability). The `# Safety` section requires all of these.
    let state = unsafe { &mut *user_data.cast::<State>() };
    state.clicks += 1;
}
```

<details>

- **Answer:** validity, aliasing, and for how long, then: the next slides take
  one promise each.

- Answer to the last slide's question. Check the board's list against it.
- The `# Safety` section grew, too: it now says what the caller must make true.
- Which promise breaks? The next slides take one each: validity at creation,
  aliasing, and mutability.

</details>
