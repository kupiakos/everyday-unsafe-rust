---
minutes: 1
---

# Bug 1: Adopting a Buffer

- The PR adopts C's buffers instead of copying them.
- Which safe caller triggers UB?
- Hint: read `drop`'s `SAFETY:` comment. What makes it true?

```rust
use std::ptr;

pub struct Buffer {
    ptr: *mut u8,
    len: usize,
}

impl Buffer {
    /// Takes ownership of a buffer from `Box<[u8]>`, without copying it.
    pub fn from_raw(ptr: *mut u8, len: usize) -> Self {
        Buffer { ptr, len }
    }
}

impl Drop for Buffer {
    fn drop(&mut self) {
        // SAFETY: `ptr` came from a `Box<[u8]>` of `len` bytes.
        unsafe { drop(Box::from_raw(ptr::slice_from_raw_parts_mut(self.ptr, self.len))) }
    }
}
```

<details>

- **Question:** students find a safe caller that makes `drop` free a pointer `Box` never allocated, and trace the bug back to the safe `from_raw`. The answer is on the next slide.

- Ask: "Which safe caller triggers UB?" Give the class a minute before the
  next slide.
- Expected answer: `Buffer::from_raw(ptr::null_mut(), 1)`, or a pointer to a
  local array. Dropping the `Buffer` frees memory `Box` never allocated.
- Usual wrong answer: "The bug is in `drop`, where the `unsafe` is." The
  `SAFETY:` comment states a fact that nothing establishes. Follow it back to
  where `ptr` enters: `from_raw`, which is safe.
- Second ask: "What isn't a fix?" Collect answers. The next slide lists them.

</details>
