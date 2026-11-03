---
minutes: 3
---

# Delete Half of `truncate`

- Same operation, different interface.
- Delete the "only shrinks" check.
- `truncate(100)` now grows `len`.
- `get` and `Drop` trust `len`: unsound.

```rust,editable
# use std::ptr::NonNull;
# pub struct Vec<T> {
#     ptr: NonNull<T>,
#     cap: usize,
#     len: usize,
# }
impl<T> Vec<T> {
    pub fn truncate(&mut self, len: usize) {
        // Deleted: `if len >= self.len { return; }`
        let old_len = self.len;
        self.len = len; // Can now grow `len` past the initialized values.
        for i in len..old_len {
            // SAFETY: `i < old_len`, so the value is initialized, and it's no
            // longer counted by `len`, so nothing else will drop it.
            unsafe { self.ptr.as_ptr().add(i).drop_in_place() };
        }
    }
}
```

<details>

- **Answer:** same operation, different interface: `truncate` only shrinks, so
  no caller can break `len`, then delete that check and it's an unsound safe
  `set_len`.

- Answer to the question on [`truncate` Writes the Same Field](03-truncate.md):
  the operation is the same field write. The interface differs: `truncate` only
  shrinks, so no caller can break `len`. Delete that check, and it's a safe
  `set_len`.
- Nothing in `truncate` itself goes wrong: the loop is empty when `len` grows.
  The UB happens later, in `get`, indexing, or `Drop`, which all trust `len`.
- This `truncate` is now the safe `set_len` from
  [`set_len` Is Just a Field Write](02-set-len.md).
- Ask: what if we deleted the drop loop instead? Then removed values are leaked:
  never dropped. That's a bug, but leaking is safe.
  [Leaking Is Safe](../../day2-morning/05-panics-leaks-and-drop-guarantees/01-leaking-is-safe.md)
  comes back to this.
- Other code trusts `len`, so every write to `len` is part of the proof.

</details>
