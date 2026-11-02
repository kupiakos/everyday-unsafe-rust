---
minutes: 3
---

# Uninitialized Isn't "Some Value"

- In C: `malloc`, then fill. Nothing stops an early read.
- Never-written memory has no fixed value.
- Two reads of it can disagree.
- Reading it as a `u8` is UB.

```rust
use std::mem::MaybeUninit;

fn main() {
    // The byte just past the end of a string, never written.
    let slot = MaybeUninit::<u8>::uninit();
    // UB: reads a byte that was never written, as if it were a `u8`.
    let byte: u8 = unsafe { slot.assume_init() };
    let needs_nul = byte != 0; // May see 0, so the terminator is skipped...
    println!("needs_nul: {needs_nul}, byte: {byte}"); // ...and still print nonzero.
}
```

<details>

- **Answer:** in C, `malloc` then fill; in Rust, not `mem::uninitialized()`, then the takeaway: uninitialized memory has no fixed value, and reading it as a `u8` is UB.

- Answer to the last slide's question: in C, `malloc` and then the loop. In
  Rust, the usual wrong answer is `mem::uninitialized()`; this slide shows why
  reading early is worse than C programmers expect.
- Story 3.3, simplified: `fbstring` checked the byte past the end, and wrote
  `\0` only if it wasn't already zero. The check saw zero, a later read didn't,
  and strings lost their terminators.
- C instinct: "it's garbage, but it's *some* garbage." Not in Rust. The
  optimizer may treat each use of an uninitialized value as a fresh arbitrary
  value. In the `fbstring` case, the memory itself changed, too.
- By the rules, the whole program has no meaning once it reads uninitialized
  memory as an integer. The two disagreeing reads are just one way it shows.
- The course's rule: use `MaybeUninit` everywhere, and call `assume_init` only
  when you're done initializing. Next slide.

</details>
