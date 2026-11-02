---
minutes: 1
---

# Which Contract Broke?

- Works at `-O0`, breaks at `-O3`.
- "Compiler bug!"
- Walk down the stack.

| Layer        | Question                         |
| ------------ | -------------------------------- |
| Your code    | Did it break a language rule?    |
| rustc + LLVM | Did it miscompile correct code?  |
| The chip     | Did it run an instruction wrong? |

<details>

- **Question:** students work out which layer is most likely at fault when code
  breaks only at `-O3`. The answer is on the next slide.

- Ask: have you ever blamed the compiler? Were you right?
- Ask: which layer is most likely at fault here? Usual wrong answer: the
  compiler, because only `-O3` breaks. Expected answer: your code.
- Hint if needed: what do optimizations rely on?

</details>
