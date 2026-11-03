---
minutes: 2
---

# Atomics and Memory Orderings

- Atomics and memory orderings exist.
- `unsafe` code that relies on them: escalate.
- Prefer `Mutex`, channels, and `Arc`.

```rust,editable
use std::sync::atomic::{AtomicBool, Ordering};

static READY: AtomicBool = AtomicBool::new(false);

pub fn publish() {
    // Which `Ordering`? If `unsafe` code depends on the answer, escalate.
    READY.store(true, Ordering::Release);
}

pub fn is_ready() -> bool {
    READY.load(Ordering::Acquire)
}
```

<details>

- **Point:** atomics are safe, but `unsafe` code whose proof relies on a memory
  ordering needs an expert reviewer; prefer `Mutex`, channels, and `Arc`.

- A data race is UB in Rust, as in C++. Rust's
  [memory orderings](https://doc.rust-lang.org/std/sync/atomic/enum.Ordering.html)
  are the same as C++20's.
- Atomics on their own are safe. The question is when `unsafe` code relies on an
  ordering to prove something, such as "the data is written before `READY`".
  That proof goes to an expert reviewer.
- Global state counts too:
  [`env::set_var`](https://doc.rust-lang.org/std/env/fn.set_var.html#safety)
  became `unsafe` in the 2024 edition, because C's `getenv` isn't thread-safe.
  [The Callback Runs on Another Thread](../../day2-afternoon/05-ffi/03-other-thread.md)
  returns to it.

</details>
