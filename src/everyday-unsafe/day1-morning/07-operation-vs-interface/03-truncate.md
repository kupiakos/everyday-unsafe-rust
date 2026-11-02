---
minutes: 3
---

# `truncate` Writes the Same Field

- A safe `set_len` lets safe code break `get`.
- `truncate` also writes `len`, and it's safe.
- What's the difference from `set_len`?

```rust
# use std::ptr::NonNull;
# pub struct Vec<T> {
#     ptr: NonNull<T>,
#     cap: usize,
#     len: usize,
# }
impl<T> Vec<T> {
    pub fn truncate(&mut self, len: usize) {
        if len >= self.len {
            return;
        }
        let old_len = self.len;
        self.len = len; // The same field write as `set_len`.
        for i in len..old_len {
            // SAFETY: `i < old_len`, so the value is initialized, and it's no
            // longer counted by `len`, so nothing else will drop it.
            unsafe { self.ptr.as_ptr().add(i).drop_in_place() };
        }
    }
}
```

<details>

- **Answer:** a safe `set_len` lets `v.set_len(100)` break `get`. **Question:**
  `truncate` writes the same field and is safe: what's different? The answer is
  on the next slide.

- Answer to the last slide's question: `set_len` is `unsafe` because a safe one
  lets `v.set_len(100)` break `get`, with no `unsafe` in the caller.
- Shrinking can't break the `len` invariant: the first `len` values were already
  initialized.
- Dropping the removed values keeps their destructors running, and `len` stops
  covering them, so each is dropped exactly once.
- `len` is updated before the drops, like in the standard library. Why that
  order matters comes on Day 2, with panics.
- Ask: what's the difference between `set_len` and `truncate`? Usual wrong
  answer: "`truncate` does something safer". Expected answer: not the operation.
  The interface. The next slide opens with that.

</details>
