---
minutes: 2
---

# Check Before You Compute

- `add` first, compare later: too late.
- The out-of-bounds `add` was already UB.
- Compare sizes, then `add`.

```rust
pub struct Bump {
    // Safety invariant: `next` and `end` point into (or one past the end of)
    // the same allocation, and `next <= end`.
    next: *mut u8,
    end: *mut u8,
}

impl Bump {
    pub fn alloc(&mut self, size: usize) -> Option<*mut u8> {
        if size > self.end.addr() - self.next.addr() {
            return None;
        }
        // SAFETY: `size <= end - next` (checked above), so by the invariant on
        // the fields, `next + size` stays within the allocation or one past it.
        let new = unsafe { self.next.add(size) };
        Some(std::mem::replace(&mut self.next, new))
    }
}
```

<details>

- **Answer:** no, the out-of-bounds `add` was already UB and the compiler may delete the check, then: compare sizes first, then `add`.

- Answer to the last slide's question: no. By the time it compares, the UB has
  happened, and the compiler may assume `new <= end` and delete the check.
- A huge `size` can also wrap the address around, so the check passes anyway.
- The C version, `if (next + size > end)`, has the same bug. Compare sizes:
  `size > end - next`.
- The last slide's `SAFETY:` comment, "checked right below", is the tell: a
  check after the `unsafe` can't be its proof.

</details>
