---
minutes: 5
---

# In-Bounds Access

- `add` and `sub` must stay in the allocation.
- One past the end is allowed.
- Nothing reads before `begin`. Which line is UB?

```rust
// Ported from C: `for (p = end - 1; p >= begin; --p) sum += *p;`
pub fn sum_backwards(buf: &[u32]) -> u32 {
    let begin = buf.as_ptr();
    let mut sum = 0;
    let mut p = unsafe { begin.add(buf.len()).sub(1) };
    while p >= begin {
        // SAFETY: `begin <= p < end`.
        sum += unsafe { *p };
        p = unsafe { p.sub(1) };
    }
    sum
}
```

<details>

- **Question:** students find the UB line even though nothing reads `begin - 1`:
  the `sub` that computes it. The answer is on the next slide.

- This was UB in C too: only one-past-the-end is allowed. C compilers rarely
  punish it. Rust's can, since it may assume `p >= begin` is always true.
- Ask: "Which line is the bug, if nothing reads `begin - 1`?" The `sub` itself.
  Computing the pointer is the UB. The next slide opens with the answer.
- Expected: the `p.sub(1)` in the loop, on its last step. Also the first
  `sub(1)`, when `buf` is empty.
- Usual wrong answer: "no line, since `begin - 1` is never dereferenced."
- Fix: step before reading, `while p > begin { p = p.sub(1); sum += *p; }`.
  Better: `buf.iter().rev().sum()`, with no `unsafe`.
- `wrapping_sub` and `wrapping_add` don't have the in-bounds rule, for address
  math that's never dereferenced.

</details>
