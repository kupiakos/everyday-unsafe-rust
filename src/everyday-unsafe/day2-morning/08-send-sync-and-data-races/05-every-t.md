---
minutes: 1
---

# An `unsafe impl` for Every `T`

- `unsafe impl<T>` promises it for every `T`.
- The caller picks `T`.
- Is this `unsafe impl` sound? Which `T` breaks it?

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

// SAFETY: `LeakyBox` owns its `T`, so sending it sends the only pointer.
unsafe impl<T> Send for LeakyBox<T> {}
```

<details>

- **Question:** students find the `T` that breaks `unsafe impl<T> Send`: `Rc<u8>`, because the caller picks `T`. The answer is on the next slide.

- `T` is chosen by the caller, so it's caller input, like a function argument.
- Ask: "Is this sound? Which `T` breaks it?" The next slide has the answer.
- Answer: `get` is sound, but the `unsafe impl` is unsound.
  We're emulating a `Box`, so we should copy [`Box`'s requirements](https://doc.rust-lang.org/std/boxed/struct.Box.html#impl-Send-for-Box%3CT,+A%3E).
  `T = Rc<u8>`: keep one clone, send a `LeakyBox` holding
  another. Two threads then update one reference count.
- Possible wrong answer: "the `SAFETY:` comment is true, so it's fine." It's true
  about pointer ownership, but not whether `T` can be sent across threads.

</details>
