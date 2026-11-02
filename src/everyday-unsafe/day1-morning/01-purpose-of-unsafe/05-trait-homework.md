---
minutes: 2
---

# Who Has the Homework

| Where                                  | Declares or promises               | Homework for                                        |
| -------------------------------------- | ---------------------------------- | --------------------------------------------------- |
| `unsafe trait Buffer`                  | Declares                           | Every implementor                                   |
| `unsafe fn get_unchecked` in the trait | Declares                           | Every caller                                        |
| `unsafe impl Buffer for Packet`        | Promises the trait                 | `Packet`'s author                                   |
| `unsafe {}` in `last`                  | Promises `get_unchecked` on slices | The trait's author, using the implementor's promise |
| `unsafe {}` in `Packet::get_unchecked` | Promises `get_unchecked` on `Vec`  | `Packet`'s author, using the caller's promise       |

```rust,no_run
# /// # Safety
# ///
# /// `len` must return `as_slice().len()`.
# pub unsafe trait Buffer {
#     fn as_slice(&self) -> &[u8];
#     fn len(&self) -> usize;
#     /// # Safety
#     ///
#     /// `i` must be less than `self.len()`.
#     unsafe fn get_unchecked(&self, i: usize) -> u8;
fn last(&self) -> Option<u8> {
    // ...
#     let n = self.len();
#     if n == 0 {
#         return None;
#     }
    // SAFETY: `n - 1 < n`, and implementors promise `n == as_slice().len()`.
    Some(unsafe { *self.as_slice().get_unchecked(n - 1) })
}
# }
#
# pub struct Packet {
#     data: Vec<u8>,
# }

// SAFETY: `len` returns `self.data.len()`, the length of `as_slice()`.
unsafe impl Buffer for Packet {
    // ...
#     fn as_slice(&self) -> &[u8] {
#         &self.data
#     }
#     fn len(&self) -> usize {
#         self.data.len()
#     }
    unsafe fn get_unchecked(&self, i: usize) -> u8 {
        // SAFETY: The caller promised `i < self.len()`, which is
        // `self.data.len()`.
        unsafe { *self.data.get_unchecked(i) }
    }
}
```

<details>

- **Answer:** `unsafe` on a trait is homework for implementors, on a method for
  callers, and an `unsafe {}` block for whoever wrote that body, then the
  compiler enforces that shape.

- Answer to the last slide's question.
- `unsafe` on a trait is homework for implementors. `unsafe` on a method is
  homework for callers. An `unsafe {}` block, in any body, is homework for
  whoever wrote that body.
- The compiler enforces the shape:
  - A plain `impl` of an `unsafe trait` is an error (E0200).
  - `unsafe impl` of a safe trait is an error too (E0199).
  - An impl can't make `get_unchecked` safe. It must stay `unsafe fn` (E0053).
- Since the 2024 edition, the body of an `unsafe fn` isn't an `unsafe` block.
  `Packet::get_unchecked` needs its own block and its own `SAFETY:` comment.
- A safe method in a safe trait gets no promises from anyone. Any `unsafe {}`
  inside it must hold for every safe caller.

</details>
