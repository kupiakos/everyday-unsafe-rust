---
minutes: 3
---

# `unsafe` in a Trait

- `unsafe` on the trait, on a method, and inside method bodies.
- For each one: does it ask, or answer?
- Who has to do the homework?

```rust
/// # Safety
///
/// `len` must return `as_slice().len()`.
pub unsafe trait Buffer {
    fn as_slice(&self) -> &[u8];
    fn len(&self) -> usize;

    /// # Safety
    ///
    /// `i` must be less than `self.len()`.
    unsafe fn get_unchecked(&self, i: usize) -> u8;

    fn last(&self) -> Option<u8> {
        let n = self.len();
        if n == 0 {
            return None;
        }
        // SAFETY: ?
        Some(unsafe { *self.as_slice().get_unchecked(n - 1) })
    }
}

pub struct Packet {
    data: Vec<u8>,
}

// SAFETY: ?
unsafe impl Buffer for Packet {
    fn as_slice(&self) -> &[u8] {
        &self.data
    }

    fn len(&self) -> usize {
        self.data.len()
    }

    unsafe fn get_unchecked(&self, i: usize) -> u8 {
        // SAFETY: ?
        unsafe { *self.data.get_unchecked(i) }
    }
}

fn main() {
    let p = Packet { data: vec![1, 2, 3] };
    assert_eq!(p.last(), Some(3));
    // SAFETY: ?
    assert_eq!(unsafe { p.get_unchecked(0) }, 1);
}
```

<details>

- **Question:** students fill in each `SAFETY: ?` and work out who has the
  homework for each `unsafe`: implementors, callers, or the author of that body.
  The answer is on the next slide.

- Builds on "Two roles": the same ask/answer split, now with traits.
- Ask: fill in each `SAFETY: ?`. Whose promise does each block lean on?
- Expected answers:
  - `last`'s block leans on the trait's promise, made by each implementor.
  - `Packet::get_unchecked`'s block leans on its caller's promise.
  - `main`'s block is the caller keeping that promise: `0 < 3`.
  - The `unsafe impl` is `Packet`'s author signing the trait's promise.
- Usual wrong answer: "`unsafe fn` in a trait means implementors must be
  careful." It's the callers who have the homework. Implementors get to rely on
  it.
- Hint if stuck: `# Safety` on the trait talks about `len`. Who writes `len`?

</details>
