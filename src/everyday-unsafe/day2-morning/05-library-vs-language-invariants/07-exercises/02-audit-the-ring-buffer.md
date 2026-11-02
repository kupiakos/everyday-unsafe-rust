---
minutes: 10
---

# Exercise: Audit the Ring Buffer

- `current` has the only `unsafe`. Which functions must you read to trust it?
- Two safe methods can break the invariant. Write a `main` that makes
  `current` read out of bounds.
- Fix both. For each: check, make it private, or make it an `unsafe fn`?

```rust,editable
pub struct RingBuffer {
    buf: Vec<u32>,
    // Safety invariant: `head < buf.len()`.
    head: usize,
}

impl RingBuffer {
    pub fn new(cap: usize) -> Self {
        assert!(cap > 0);
        RingBuffer { buf: vec![0; cap], head: 0 }
    }
    pub fn from_vec(buf: Vec<u32>) -> Self {
        RingBuffer { buf, head: 0 }
    }
    pub fn current(&self) -> u32 {
        // SAFETY: `head < buf.len()`, by the invariant on `head`.
        unsafe { *self.buf.get_unchecked(self.head) }
    }
    pub fn push(&mut self, x: u32) {
        self.buf[self.head] = x;
        self.head = (self.head + 1) % self.buf.len();
    }
    pub fn set_head(&mut self, head: usize) {
        self.head = head % self.buf.len();
    }
    pub fn shrink(&mut self, cap: usize) {
        assert!(cap > 0);
        self.buf.truncate(cap);
    }
    pub fn clear(&mut self) {
        self.buf.fill(0);
        self.head = 0;
    }
}

fn main() {
    todo!("make `current` read out of bounds, with safe calls only")
}
```

<details>

- **Goal:** auditing a field invariant means reading every function that writes the field, not only the one with `unsafe`.

- Hints:
  - Hint: which functions write `buf` or `head`?
  - Hint: which methods change `buf.len()` without looking at `head`, or skip
    a check that `new` makes?
  - Bigger hint: the holes: `from_vec(Vec::new())` (`0 < 0` is false), and
    `shrink` after `set_head` (head 7, length 2).
  - If they say `set_head`: what does `%` do to `head`? What happens with an
    empty `buf`?
  - If they say "`current` is at fault, it has the `unsafe`": is its proof
    wrong, or did another method break what the proof relies on?
  - If they add a `debug_assert!` in `current`: what happens in release
    builds?

</details>
