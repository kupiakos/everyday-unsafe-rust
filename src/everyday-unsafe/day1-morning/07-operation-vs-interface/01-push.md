---
minutes: 3
---

# `push` Is Safe, With `unsafe` Inside

- `push` is a safe `fn`.
- Its `unsafe` block trusts the invariants.
- Can a safe caller break them?

```rust
# use std::ptr::NonNull;
# pub struct Vec<T> {
#     ptr: NonNull<T>,
#     cap: usize,
#     len: usize,
# }
impl<T> Vec<T> {
    pub fn push(&mut self, value: T) {
        if self.len == self.cap {
            self.grow(); // Afterward, `len < cap`.
        }
        // SAFETY: `len < cap`, so slot `len` is inside the allocation.
        unsafe { self.ptr.as_ptr().add(self.len).write(value) };
        self.len += 1;
    }

    fn grow(&mut self) {
        todo!("allocate a bigger buffer, move the values, update `ptr` and `cap`")
    }
}
```

<details>

- **Question:** students work out whether any safe caller can break `push` (no:
  the fields are private, and `grow` keeps `len < cap`). The answer is on
  [`set_len` Is Just a Field Write](02-set-len.md).

- The same `push` as in
  [Why UB Exists: `Vec::push`](../03-undefined-behavior/06-vec-push.md), now
  with the struct behind it.
- Ask: what could a caller pass to break `push`? Expected answer: nothing. Any
  `T`, any number of times. The caller can't touch `ptr`, `cap`, or `len`, and
  `grow` keeps `len < cap`. [`set_len` Is Just a Field Write](02-set-len.md)
  opens with that.
- After the write, slot `len` is initialized, so `len += 1` keeps the `len`
  invariant.
- This is the first shape of sound code with `unsafe` in it: a safe interface,
  with every requirement checked inside.

</details>
