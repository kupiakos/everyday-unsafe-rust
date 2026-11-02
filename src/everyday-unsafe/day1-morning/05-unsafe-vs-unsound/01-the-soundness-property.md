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

This is the contract between safe and unsafe Rust.

<details>

- **Point:** the soundness property, "safe Rust callers can't cause UB, no
  matter what", is the contract between safe and unsafe code, and unsound code
  breaks it.

- The soundness property is the promise every safe API makes. The next slides
  break it.

- Each bullet is one of the three words from the last slide, one step further:
  what UB violates, what `unsafe` is for, and what makes code unsound.
- Write the quote on the board next to the three words.

</details>
