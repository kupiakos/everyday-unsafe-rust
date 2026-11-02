---
minutes: 3
---

# The Callback Runs on Another Thread

- C's docs: callbacks run on a worker thread.
- So `State` must be `Send`.
- The `void*` hides that from the compiler.
- `env::set_var` is `unsafe` for the same reason.

```rust
use std::env;

pub struct State {
    pub records: u64,
    // C runs `on_record` on its worker thread, so this must be `Send`.
    pub handler: Box<dyn FnMut(u64) + Send>,
}

const _: () = {
    const fn assert_send<T: Send>() {}
    assert_send::<State>(); // Fails to compile if `State` isn't `Send`.
};

pub fn use_utc() {
    // SAFETY: No other thread exists yet. The library's worker thread reads the
    // environment with C's `getenv`, so this must run before `lp_new`.
    unsafe { env::set_var("TZ", "UTC") };
}
```

<details>

- **Point:** the `void*` hides threads from the compiler, so `State` must be
  `Send`, checked with a `const` assertion. `env::set_var` is `unsafe` for the
  same reason.

- A pointer through `void*` erases the type, so no `Send` bound applies. The
  `const` assertion puts the check back: remove `+ Send` from `handler`, and it
  fails to compile.
- `Send` is enough if only one thread touches `State` at a time. If `Parser`
  also reads `records` while the worker thread runs, `State` needs a `Mutex` or
  atomics too.
- `env::set_var` became `unsafe` in the 2024 edition. Rust's own `env` functions
  take a lock, but C's `getenv` doesn't, so another thread calling `getenv` at
  the same time is a data race.
- Ask: "Who else might call `getenv`?" Any C library, including `logparse` and
  the C library's time functions. Usually the only safe time is before starting
  threads.

</details>
