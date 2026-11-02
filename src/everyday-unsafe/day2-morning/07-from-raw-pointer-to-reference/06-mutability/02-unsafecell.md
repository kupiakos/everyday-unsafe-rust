---
minutes: 3
---

# `UnsafeCell` Underneath

- `Cell` and `RefCell` are built on `UnsafeCell`.
- It's the only sound way to mutate behind `&`.
- You prove nobody else is looking.

```rust
use std::cell::UnsafeCell;

pub struct Counter {
    n: UnsafeCell<u32>, // Also makes `Counter` `!Sync`.
}

impl Counter {
    pub fn incr(&self) {
        // SAFETY: `Counter` is `!Sync`, so no other thread can access `n`, and
        // no reference to the contents of `n` exists outside this statement.
        unsafe { *self.n.get() += 1 }
    }
}
```

<details>

- **Point:** `UnsafeCell` is the only sound way to mutate behind `&`, and you prove the aliasing yourself.

- `BadCounter` from two slides ago, with one change: `n` is an
  `UnsafeCell<u32>`. It tells the compiler "this may change behind `&`".
- `get()` is safe and returns `*mut u32`. Using that pointer is `unsafe`, and
  the proof is aliasing again: no other reference to `n`'s contents is live.
- Why it has to be `!Sync`: two threads calling `incr` at once would race on
  `n`. `UnsafeCell` is `!Sync`, so `Counter` is too, unless someone writes
  `unsafe impl Sync`.
- Closes the References section. Next: other threads.

</details>
