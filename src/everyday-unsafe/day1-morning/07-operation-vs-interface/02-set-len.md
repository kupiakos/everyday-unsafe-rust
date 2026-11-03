---
minutes: 4
---

# `set_len` Is Just a Field Write

- `push` is sound: no caller can reach the fields.
- [`Vec::set_len`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.set_len)
  is `self.len = new_len`.
- No unsafe operation in its body.
- Yet it's an `unsafe fn`. Why?

```rust
# use std::ptr::NonNull;
pub struct Vec<T> {
    ptr: NonNull<T>,
    cap: usize,
    // Safety invariant: `len <= cap`, and the first `len` values are
    // initialized.
    len: usize,
}

impl<T> Vec<T> {
    // What if it were safe?
    pub fn set_len(&mut self, new_len: usize) {
        self.len = new_len;
    }

    pub fn get(&self, i: usize) -> Option<&T> {
        // SAFETY: `i < self.len`, and the first `len` values are initialized.
        (i < self.len).then(|| unsafe { &*self.ptr.as_ptr().add(i) })
    }
}
```

<details>

- **Answer:** no safe caller can break `push`, so it's sound. **Question:** why
  is `set_len`, just a field write, an `unsafe fn`? The answer is on
  [`truncate` Writes the Same Field](03-truncate.md).

- Answer to the question on [`push` Is Safe, With `unsafe` Inside](01-push.md):
  no safe caller can break `push`. It's sound: `unsafe` inside, fully
  encapsulated.
- Ask: why is the real `set_len` an `unsafe fn`? Usual wrong answer: "it isn't,
  there's nothing unsafe in it".
- Expected answer: this `set_len` is safe, and that's the bug: `v.set_len(100)`
  followed by `v.get(50)` reads memory that was never written.
- The real one is `pub unsafe fn set_len(&mut self, new_len: usize)`.
  [Its `# Safety` section](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.set_len):
  `new_len` must be at most `capacity()`, and the elements at `old_len..new_len`
  must be initialized.
- Ask: where is the UB? In `get`. Who's at fault? A safe `set_len`. Same shape
  as the logger's
  [`Handler::new`](../06-fixing-an-unsound-logger/06-handler-new-is-at-fault.md).
  [`truncate` Writes the Same Field](03-truncate.md) opens with that.
- "Unsafe" and "unsound" describe interfaces, not just operations.

</details>
