---
minutes: 3
---

# `set_len`'s Two Bullets

- Read one bullet at a time.
- For each: who makes it true, and how?

```rust,ignore
impl<T> Vec<T> {
    /// Forces the length of the vector to `new_len`.
    ///
    /// # Safety
    ///
    /// - `new_len` must be less than or equal to `capacity()`.
    /// - The elements at `old_len..new_len` must be initialized.
    pub unsafe fn set_len(&mut self, new_len: usize) {
        self.len = new_len;
    }
}
```

<details>

- **Point:** `set_len`'s contract is two separate preconditions, room (capacity)
  and contents (initialized). Read each one and ask who makes it true.

- These are the two bullets from the `std` docs, word for word.
- The body is one field write, as in Operation vs Interface this morning. All
  of the danger is in what other code does with `len` afterward.
- Bullet 1 is about the buffer: there must be room.
- Bullet 2 is about the contents: every newly counted element must already
  hold a real `T`. Ask: "Which bullet would a C programmer skip?" Usually the
  second.

</details>
