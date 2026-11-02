---
minutes: 2
---

# Atomics and Memory Orderings

- Atomics and memory orderings exist.
- `unsafe` code that relies on them: escalate.
- Prefer `Mutex`, channels, and `Arc`.

```rust
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

- A data race is UB in Rust, as in C++. Rust's memory orderings are the same as
  C++20's.
- Atomics on their own are safe. The question is when `unsafe` code relies on an
  ordering to prove something, such as "the data is written before `READY`".
  That proof goes to an expert reviewer.
- Global state counts too: `env::set_var` became `unsafe` in the 2024 edition,
  because C's `getenv` isn't thread-safe. Day 2 afternoon returns to it.

</details>
