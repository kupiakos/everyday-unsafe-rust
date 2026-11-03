
# Solution

- `as_slice` trusts `len <= data.len()`.
- `set_len` and `from_parts` become `unsafe fn`. `replace_storage` clamps `len`.
- `clear` doesn't need `unsafe`.

```rust,editable
#![allow(dead_code)]

pub struct Stack {
    // Every slot holds a number. The length of `data` is the capacity.
    // `len` says how many are in use.
    data: Box<[u32]>,
    // Safety invariant: `len <= data.len()`.
    len: usize,
}

impl Stack {
    /// # Safety
    ///
    /// The caller must ensure that `len <= data.len()`.
    pub unsafe fn from_parts(data: Box<[u32]>, len: usize) -> Stack {
        Stack { data, len }
    }

    pub fn push(&mut self, x: u32) {
        self.data[self.len] = x; // Panics when full, so `len` stays in range.
        self.len += 1;
    }

    /// # Safety
    ///
    /// The caller must ensure that `len` is at most the capacity.
    pub unsafe fn set_len(&mut self, len: usize) {
        self.len = len;
    }

    pub fn clear(&mut self) {
        self.len = 0; // Shrinking keeps the invariant: no `unsafe` needed.
    }

    pub fn replace_storage(&mut self, data: Box<[u32]>) -> Box<[u32]> {
        // Keep the invariant for the new storage.
        self.len = self.len.min(data.len());
        std::mem::replace(&mut self.data, data)
    }
}

fn main() {}
```

<details>

- **Answer:** `set_len` and `from_parts` become `unsafe fn` (or check),
  `replace_storage` clamps `len`, and `clear` doesn't need `unsafe`.

- `with_capacity`, `truncate`, and `as_slice` are unchanged and left out.
- `from_parts` could stay safe with `assert!(len <= data.len())` instead. Either
  is sound. The check is better unless callers need the speed.
- `replace_storage` could also be an `unsafe fn`. Clamping is cheaper for
  callers and keeps it safe.
- `as_slice` trusts `len <= data.len()`. Code that writes `len` _or_ `data` can
  break it.
  - Must change: `set_len`, `from_parts`, and `replace_storage`.
  - Already sound: `push` (indexing panics when the stack is full), `truncate`
    (only shrinks), `with_capacity`.
  - Crying wolf: `clear`. Setting `len` to 0 can't break the invariant.
  - Usual wrong answer: "`push` writes `len`, so it needs `unsafe`". The
    indexing checks first.
  - Usual wrong answer: "`replace_storage` doesn't touch `len`". It changes the
    other side of the invariant, like `push_byte` in
    [The Renovation](../../../05-unsafe-vs-unsound/06-renovation.md).
  - What isn't a fix: making `as_slice` an `unsafe fn`. Every reader would have
    to prove an invariant they can't see, and the writers are the bug. Also not
    a fix: a doc comment on `set_len`.
  - `std` agrees:
    [`Vec::set_len`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.set_len)
    and
    [`Vec::from_raw_parts`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.from_raw_parts)
    are `unsafe`;
    [`truncate`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.truncate)
    and
    [`clear`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.clear)
    are safe.

</details>
