---
minutes: 2
---

# Add the Bound

- `LeakyBox<Rc<u8>>` could cross threads.
- Two threads, one `Rc` count: a data race.
- Fix: `T: Send`.

```rust
pub struct LeakyBox<T>(*mut T);

impl<T> LeakyBox<T> {
    pub fn new(t: T) -> Self {
        LeakyBox(Box::into_raw(Box::new(t)))
    }

    pub fn get(&self) -> &T {
        // SAFETY:
        // - `*self.0` is never mutated.
        // - `self.0` is valid for aligned reads of initialized `T` for the
        //    entire `&self` borrow, because it came from `Box::into_raw`,
        //    is never freed, and is only accessed as `&T`.
        unsafe { &*self.0 }
    }
}

// SAFETY: `LeakyBox` owns its `T`, like `Box<T>`, so sending a `LeakyBox<T>`
// sends a `T`, which `T: Send` allows.
unsafe impl<T: Send> Send for LeakyBox<T> {}
```

<details>

- **Answer:** `LeakyBox<Rc<u8>>` allows a data race on the count, then: add `T: Send`, and check every `unsafe impl` against every `T`.

- Answer to the last slide's question: the `unsafe impl` is at fault. A safe
  caller can keep one `Rc` clone and send a `LeakyBox` holding another to a
  second thread. Both threads then update the same reference count without
  synchronization: a data race.
- `Rc`, `Cell`, and raw pointers are all `T`s the old impl allowed.
- Auto traits are part of a type's safe API. A reviewer checks every
  `unsafe impl` against every possible `T`.

</details>
