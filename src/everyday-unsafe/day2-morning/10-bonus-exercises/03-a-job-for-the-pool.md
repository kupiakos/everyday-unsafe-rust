---
minutes: 0
---

# Exercise: A `Job` for the Pool

- The `SAFETY:` comment is true. Why is the `unsafe impl` still unsound?
- Write a `main`, with safe code only, that has a data race.
- Fix the `unsafe impl`, and check that your `main` no longer compiles.

```rust,editable
#![allow(dead_code, unused_imports, unused_variables)]
use std::rc::Rc;
use std::thread;

/// A job for the worker pool.
pub struct Job<T> {
    pub payload: T,
    name: *const u8, // Always points to a static C string.
}

impl<T> Job<T> {
    pub fn new(payload: T) -> Self {
        Job { payload, name: c"job".as_ptr().cast() }
    }
}

// SAFETY: `name` points to immutable static data, so any thread may read it.
unsafe impl<T> Send for Job<T> {}

pub fn run_on_worker<T: 'static>(job: Job<T>, f: fn(T)) -> thread::JoinHandle<()> {
    thread::spawn(move || {
        let job = job; // Move the whole `Job` into the thread.
        f(job.payload)
    })
}

fn main() {
    todo!("cause a data race, with safe code only")
}
```

<details>

- **Goal:** a true `SAFETY:` comment can still miss part of an `unsafe impl`, which covers every `T`.

- Hints:
  - Hint: the `SAFETY:` comment talks about `name`. What else is in a
    `Job<T>`, and which `T`s does the `impl` cover?
  - Bigger hint: send a `Job<Rc<u32>>`, and clone the `Rc` on both threads.
    The race: both threads update the `Rc`'s non-atomic count at the same
    time.
  - If they add `T: Sync`: what does moving a `T` to another thread need?
  - If they add `T: Send` to `run_on_worker` only: is `Job<Rc<u32>>` still
    `Send`? Can `thread::spawn` move it anyway?
  - Ask: could `name` be a type the compiler already knows is `Send`?

</details>
