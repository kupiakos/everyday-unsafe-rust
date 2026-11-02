---
minutes: 3
---

# Compile Error > Panic > UB

- Fail as early as you can.
- A compile error beats a panic.
- A panic beats UB.

| Fails as      | You find out...          | `Image::new`                                    |
| ------------- | ------------------------ | ----------------------------------------------- |
| Compile error | When building            | `const _: () = assert!(usize::BITS >= 64);`     |
| Panic         | At the bad input         | `checked_mul`, then `.expect("image too big")`  |
| UB            | Maybe never, maybe later | Wrapping `w * h * 4`                            |

<details>

- **Point:** fail as early as you can: a compile error beats a panic, and a panic beats UB.

- The ladder the whole morning has been climbing.
- The logger's Fix 1 turned UB into a compile error. `first_checked`'s
  `assert!` turned UB into a panic. The ESP32 `cfg` made the wrong build fail
  to compile.
- For `Image`, either top row is fine. Which one to pick depends on whether
  32-bit targets matter to you.
- Close the morning: the question for every `unsafe` review is "can any safe
  caller, on any target we support, cause UB?"

</details>
