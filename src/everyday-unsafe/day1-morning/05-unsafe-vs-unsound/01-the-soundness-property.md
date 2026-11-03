---
minutes: 2
---

# The Soundness Property

- Undefined Behavior is when you violate the contract of Rust's abstract state
  machine.
- Unsafety helps Rust programmers achieve goals that they couldn't otherwise.
- `unsafe` operations may be wrapped in safe abstractions.
- Unsoundness describes _incorrect_ code that violates Rust's **soundness
  property**:

> **No matter what, Safe Rust clients can’t cause Undefined Behavior.**
>
> ([The Rustonomicon](https://doc.rust-lang.org/nomicon/safe-unsafe-meaning.html))

This is the contract between safe and unsafe Rust.

<details>

- **Point:** the soundness property, "safe Rust callers can't cause UB, no
  matter what", is the contract between safe and unsafe code, and unsound code
  breaks it.

- The soundness property is the promise every safe API makes. Starting with
  [A Lamp That Works](02-lamp.md), the slides in this section break it.

- Each bullet is one of the three words from
  [Unsafe vs Unsound](../05-unsafe-vs-unsound.md), one step further: what UB
  violates, what `unsafe` is for, and what makes code unsound.
- Write the quote on the board next to the three words.

</details>
