
# Solution

- `unsafe impl<T>` promises `Send` for every `T`, including `Rc`.
- Fix: `unsafe impl<T: Send> Send for Job<T>`, and say so in the comment.

```rust,editable
#![allow(dead_code)]
use std::rc::Rc;
use std::thread;

pub struct Job<T> {
    pub payload: T,
    name: *const u8, // Always points to a static C string.
}

impl<T> Job<T> {
    pub fn new(payload: T) -> Self {
        Job { payload, name: c"job".as_ptr().cast() }
    }
}

// SAFETY: `name` points to immutable static data, so any thread may read it,
// and `T: Send` means the payload may move to another thread.
unsafe impl<T: Send> Send for Job<T> {}

// Needs `T: Send` now: the compiler asks for the bound the `unsafe impl` forgot.
pub fn run_on_worker<T: Send + 'static>(job: Job<T>, f: fn(T)) -> thread::JoinHandle<()> {
    thread::spawn(move || {
        let job = job;
        f(job.payload)
    })
}

fn churn(rc: Rc<u32>) {
    for _ in 0..100_000 {
        drop(rc.clone()); // Updates the count, with no synchronization.
    }
}

fn main() {
    let rc: Rc<u32> = Rc::new(0);
    // Before the fix this compiled, and both threads raced on the count.
    // Now: error, `Rc<u32>` cannot be sent between threads safely.
    // let worker = run_on_worker(Job::new(rc.clone()), churn);
    churn(rc);
    // worker.join().unwrap();
}
```

<details>

- **Answer:** add `T: Send` to the `unsafe impl`, and say so in the `SAFETY:` comment.

- the comment only covers `name`. The `impl` covers `Job<T>` for
  every `T`, so it also says a `Job<Rc<u32>>` may cross threads.
  - Usual wrong answer: `T: Sync`. Sending a `T` needs `T: Send`.
  - What isn't a fix: adding `T: Send` to `run_on_worker` only. `Job<Rc<u32>>`
    is still `Send`, so `thread::spawn` can move it anyway.
  - Better: store `name: &'static CStr`. Then the compiler derives `Send`,
    and the `unsafe impl` goes away.
- the commented-out lines are the hostile caller. Uncomment them to
  see the compile error: *compile error > panic > UB*.
- after the fix, `run_on_worker` stops compiling until it says
  `T: Send`. The bug was visible to the compiler all along; the `unsafe impl`
  hid it.

</details>
