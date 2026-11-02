---
minutes: 2
---

# Usually, It's Your Code

- "Only at `-O3`" points at the top layer.
- Check your own contract first.

| Layer        | How often?   |
| ------------ | ------------ |
| Your code    | Usually      |
| rustc + LLVM | Rarely       |
| The chip     | Almost never |

<details>

- **Answer:** usually your code broke a language rule, then check your own contract before blaming the compiler, since optimizations rely on those rules.

- Answer to the last slide's question: usually your code broke a language
  rule.
- Optimizations rely on the language rules. If code breaks a rule, the
  optimizer exposes it, so "only at `-O3`" points at the top layer.
- Compiler bugs exist, but check your own contract first. The `tun` driver bug
  looked like a compiler bug too.

</details>
