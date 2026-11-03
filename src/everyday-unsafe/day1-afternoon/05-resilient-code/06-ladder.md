---
minutes: 3
---

# Compile Error > Panic > UB

- Fail as early as you can.
- A compile error beats a panic.
- A panic beats UB.

| Fails as      | You find out...          | `Image::new`                                     |
| ------------- | ------------------------ | ------------------------------------------------ |
| Compile error | When building            | `const _: () = assert!(usize::BITS >= 64);`      |
| Panic         | At the bad input         | `checked_mul`, then `.expect("image too big")`   |
| UB            | Maybe never, maybe later | `w * h * 4` wraps, then `red` reads past the end |

<details>

- **Point:** fail as early as you can: a compile error beats a panic, and a
  panic beats UB.

- The ladder the whole day has been climbing.
- The logger's
  [Fix 1: Stay Safe](../../day1-morning/06-fixing-an-unsound-logger/02-fix-1-stay-safe.md)
  turned UB into a compile error. `first_checked`'s `assert!`, in
  [Four Ways to Read `x[0]`](../../day1-morning/07-operation-vs-interface/05-four-ways.md),
  turned UB into a panic. The ESP32 `cfg` in
  [The Sibling Chip](02-sibling-chip.md) made the wrong build fail to compile.
- For `Image`, either top row is fine. Which one to pick depends on whether
  32-bit targets matter to you.
- Close the section: the question for every `unsafe` review is "can any safe
  caller, on any target we support, cause UB?"

</details>
