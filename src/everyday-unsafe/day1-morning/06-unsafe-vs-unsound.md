---
minutes: 3
---

# Unsafe vs Unsound

Rust has an `unsafe` keyword, so calling code "unsafe" means it uses that keyword.
When discussing memory safety in Rust, these are the key terms:

- **Undefined Behavior**: Some state that *must* be unreachable is reached anyway.
- **Unsafe**: The compiler cannot prove that undefined behavior is impossible.
- **Unsound**: The author mislabeled some encapsulated `unsafe` code.

<details>

- **Goal:** students can tell unsafe (code the compiler can't check) from unsound (a wrong label: safe code can cause UB), and point at the code at fault even when every test passes. **Arc:** three words → the soundness property → a lamp that works → until someone touches it → green tests → labels and wiring → the renovation → `push_byte` is at fault → exercises.

- Three words, one line each, no code yet. Write them on the board: the rest of
  the course uses them.
- UB: a rule was broken. Unsafe: the compiler can't check this code. Unsound:
  safe code can cause UB through it.
- Usual confusion: "unsafe" and "unsound" sound alike. Unsafe is syntax you
  can grep for. Unsound is a bug.

</details>
