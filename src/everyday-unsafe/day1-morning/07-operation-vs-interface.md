---
minutes: 5
---

# Safe/Sound Operation vs Interface

- Three fields: `ptr`, `cap`, `len`.
- Each has a safety invariant.
- `Vec`'s `unsafe` code trusts them.

```rust
use std::ptr::NonNull;

/// Roughly how `std::vec::Vec` is laid out (the real one adds an allocator
/// parameter and a `RawVec` layer).
pub struct Vec<T> {
    // Safety invariant: aligned for `T`. If `cap > 0` and `T` isn't zero-sized,
    // `ptr` points to an allocation for `cap` values of `T` from the global
    // allocator.
    ptr: NonNull<T>,
    // Safety invariant: the number of `T`s the allocation has room for.
    cap: usize,
    // Safety invariant: `len <= cap`, and the first `len` values are
    // initialized.
    len: usize,
}
```

<details>

- **Goal:** students see that unsafe and unsound describe interfaces, not
  operations: the same field write is sound behind one interface and unsound
  behind another. **Arc:** what's inside a `Vec` → `push`: safe, with `unsafe`
  inside → `set_len` → `truncate` → delete half of `truncate` → four ways to
  read `x[0]` → three shapes of sound code → exercise.

- The running example, opened up. The real `Vec` adds `RawVec` and an allocator
  parameter, but the invariants are the same.
- The fields are private, so only `Vec`'s own module can break these invariants.
  Every `unsafe` block in `Vec` relies on them.
- When `cap` is 0, `ptr` is `NonNull::dangling()`: non-null and aligned, but
  pointing at nothing. The logger showed that's not "valid".
- Ask: which field would you least want a caller to write? (Hold the answer for
  `set_len`.)

</details>
