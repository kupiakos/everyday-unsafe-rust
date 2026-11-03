
# Solution

- Holes: `from_vec` with an empty `Vec`, and `shrink` below `head`.
- Fix both with a check. Neither needs to be `unsafe`.

```rust,editable
pub struct RingBuffer {
    buf: Vec<u32>,
    // Safety invariant: `head < buf.len()`.
    head: usize,
}

impl RingBuffer {
    pub fn from_vec(buf: Vec<u32>) -> Self {
        assert!(!buf.is_empty()); // Keeps the invariant: `0 < buf.len()`.
        RingBuffer { buf, head: 0 }
    }
    pub fn current(&self) -> u32 {
        // SAFETY: `head < buf.len()`, by the invariant on `head`.
        unsafe { *self.buf.get_unchecked(self.head) }
    }
    pub fn set_head(&mut self, head: usize) {
        self.head = head % self.buf.len();
    }
    pub fn shrink(&mut self, cap: usize) {
        assert!(cap > 0);
        self.buf.truncate(cap);
        self.head %= self.buf.len(); // Keeps the invariant.
    }
    // `new`, `push`, and `clear` are unchanged: they already keep it.
}

fn main() {
    let mut r = RingBuffer::from_vec(vec![0; 8]);
    r.set_head(7);
    r.shrink(2); // Before the fix: `head` stayed 7.
    println!("{}", r.current()); // Before the fix: UB, reads `buf[7]` of 2.
    // RingBuffer::from_vec(Vec::new()); // Before: UB in `current`. Now: panic.
}
```

<details>

- **Answer:** the holes are `from_vec(Vec::new())` and `shrink` below `head`;
  fix both with a check.

- to trust `current`, read every function that writes `buf` or `head`: all of
  them except `current`.
  - Usual wrong answer: `set_head`. It looks like the setter in
    [A Safe `set_head`](../../04-harmless-setter.md), but `%` keeps it in range.
    With an empty `buf` it panics, which is safe.
  - Usual wrong answer: "`current` is at fault, it has the `unsafe`." Its proof
    is correct. The methods that break the invariant are at fault.
  - What isn't a fix: a `debug_assert!` in `current`. Release builds still read
    out of bounds.
  - Fixes: `assert!` in `from_vec`, and `self.head %= self.buf.len()` in
    `shrink`. Or replace `get_unchecked` with indexing and measure first.
- a privacy note. Both holes are safe `pub` methods, so privacy didn't help
  here: the module is the audit boundary, and every method in it counts.
- making `shrink` an `unsafe fn` would also be sound, but callers can't easily
  check "`cap > head`" without a getter. A check is cheaper than that `# Safety`
  section.

</details>
