---
minutes: 15
---

# Exercise: A Stack of Numbers

- `as_slice` trusts one invariant. Which fields does it cover?
- Which methods let a safe caller break it? Fix each one: an `unsafe fn` with a
  `# Safety` section, or a check.
- Is any `unsafe` here for no reason?

```rust,editable
#![allow(dead_code)]

/// A stack of up to `capacity` numbers.
pub struct Stack {
    // Every slot holds a number. The length of `data` is the capacity.
    // `len` says how many are in use.
    data: Box<[u32]>,
    // Safety invariant: `len <= data.len()`.
    len: usize,
}

impl Stack {
    pub fn with_capacity(capacity: usize) -> Stack {
        Stack { data: vec![0; capacity].into_boxed_slice(), len: 0 }
    }

    pub fn from_parts(data: Box<[u32]>, len: usize) -> Stack {
        Stack { data, len }
    }

    pub fn push(&mut self, x: u32) {
        self.data[self.len] = x;
        self.len += 1;
    }

    pub fn set_len(&mut self, len: usize) {
        self.len = len;
    }

    pub fn truncate(&mut self, len: usize) {
        self.len = self.len.min(len);
    }

    pub unsafe fn clear(&mut self) {
        self.len = 0;
    }

    pub fn replace_storage(&mut self, data: Box<[u32]>) -> Box<[u32]> {
        std::mem::replace(&mut self.data, data)
    }

    pub fn as_slice(&self) -> &[u32] {
        // SAFETY: `len <= data.len()`, by the invariant on `len`.
        unsafe { self.data.get_unchecked(..self.len) }
    }
}

fn main() {}
```

<details>

- **Goal:** reviewing a type like `Vec`: find every method that can break the
  safety invariant `as_slice` relies on, fix each one, and spot `unsafe` that
  isn't needed.

- Hints:
  - Hint: the invariant names some fields. Which methods write any of them?
  - Hint: for each method, try to pick arguments that break the invariant.
  - If they say "`push` writes `len`, so it needs `unsafe`": what does the first
    line of `push` do when the stack is full?
  - If they say "`replace_storage` doesn't touch `len`": which fields does the
    invariant name? See
    [The Renovation](../../05-unsafe-vs-unsound/06-renovation.md): a new safe
    method broke an invariant that an untouched `unsafe` block relied on.
  - Hint for the last question: for each `unsafe fn`, is there a call that
    breaks the invariant?
  - If they make `as_slice` an `unsafe fn`: who would have to prove the
    invariant, and can they see it?
  - If they add a doc comment to `set_len`: does a safe caller have to read it?
  - Bigger hint: look up which of
    [`Vec`'s methods](https://doc.rust-lang.org/std/vec/struct.Vec.html) with
    the same names are `unsafe`.

</details>
