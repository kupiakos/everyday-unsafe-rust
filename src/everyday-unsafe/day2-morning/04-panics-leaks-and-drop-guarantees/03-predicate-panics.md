---
minutes: 4
---

# The Predicate That Panics

- `ptr::read` moves out; the slot keeps its bits.
- `keep` panics on the second element. What happens?
- Who's at fault: `retain_in_place`, or the closure?

```rust
pub fn retain_in_place<T>(v: &mut Vec<T>, mut keep: impl FnMut(&T) -> bool) {
    let len = v.len();
    let p = v.as_mut_ptr();
    let mut kept = 0;
    for i in 0..len {
        // SAFETY: `i < len`, so slot `i` holds an initialized `T`.
        let item = unsafe { p.add(i).read() };
        if keep(&item) {
            // SAFETY: `kept <= i`, and slot `kept` was already moved out.
            unsafe { p.add(kept).write(item) };
            kept += 1;
        }
    }
    // SAFETY: slots `0..kept` are initialized, and `kept <= len <= capacity`.
    unsafe { v.set_len(kept) };
}
```

<details>

- **Question:** students work out what a panic in `keep` does (a double drop) and who's at fault (`retain_in_place`, not the closure). The answer is on the next slide.

- Ask: "What happens when `keep` panics on the second element?" Then: "Who's
  at fault?" The next slide opens with the answers.
- Walk through a panic on the second element. Unwinding drops `item`, but slot
  1 still holds its bits and `v.len()` still says `len`. The caller's `Vec`
  then drops slot 1 a second time: a double drop, which frees the same `String`
  twice.
- C++ developers know this as exception safety. Unsafe Rust needs at least
  C++'s basic guarantee at every panic point, except that leaking is an
  acceptable fallback.
- The first `SAFETY:` comment is true but incomplete: it doesn't say what state
  the `read` leaves behind.
- Who's at fault? `retain_in_place`, not the closure. Panicking is safe.
  Usual wrong answer: "the closure shouldn't panic."
- Closes the panicking-closure branch of Day 1 afternoon's hostile caller.

</details>
