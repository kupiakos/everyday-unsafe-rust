---
minutes: 1
---

# The Bump Allocator

- [In Bounds](../04-in-bounds.md): the `sub` that computes `begin - 1` is UB.
- `alloc` checks `new > end` before it uses `new`.
- Is that check enough?

```rust,editable
pub struct Bump {
    // Safety invariant: `next` and `end` point into (or one past the end of)
    // the same allocation, and `next <= end`.
    next: *mut u8,
    end: *mut u8,
}

impl Bump {
    pub fn alloc(&mut self, size: usize) -> Option<*mut u8> {
        // SAFETY: Checked right below.
        let new = unsafe { self.next.add(size) };
        if new > self.end {
            return None;
        }
        Some(std::mem::replace(&mut self.next, new))
    }
}
```

<details>

- **Question:** students work out that checking `new > end` after the `add` is
  too late: the `add` was already UB. The answer is on
  [Check Before You Compute](02-check-before-compute.md).

- Answer to the question on [In Bounds](../04-in-bounds.md) (first bullet):
  computing the pointer is the UB, read or not.
- Same rule as [In Bounds](../04-in-bounds.md), in a real allocator.
- Ask: "`alloc` checks `new > end`. Is that enough?"
  [Check Before You Compute](02-check-before-compute.md) has the answer.
- Expected: no. By the time it compares, the `add` was already UB, and the
  compiler may assume `new <= end` and delete the check.
- Usual wrong answer: "the `if` catches it, and nothing reads `new` before
  then."

</details>
