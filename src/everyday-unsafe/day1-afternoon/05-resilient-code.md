---
minutes: 3
---

# Resilient Code

- Sound code is resilient code, portable code is resilient code.
- Resilience in the face of future edits.
- One of those edits can be "run on a different platform".
- Resilient code uses local reasoning wherever possible.

| Future mutations to...                                                                                                |
| --------------------------------------------------------------------------------------------------------------------- |
| the code in the function you're writing                                                                               |
| its module, or its crate                                                                                              |
| the standard library, or Rust itself                                                                                  |
| your build environment: the future platforms the code might be compiled to run on, or the linking of a static library |

<details>

- **Goal:** students know soundness can depend on context (platform, compiler,
  dependencies), and prefer code that fails to compile where it isn't valid.
  **Arc:** resilience to future edits → portability (ESP32) → the sibling chip →
  sound only on 64-bit → a minor version bump → nobody promised that → compile
  error > panic > UB.

- Usual wrong idea: "Bastardized idea of resilient code = defensive coding, null
  check everything."
  [Null Checks Don't Make It Sound](../day1-morning/06-fixing-an-unsound-logger/01-null-checks-dont-make-it-sound.md)
  already showed a null check doesn't make code sound.
- "If you need to make sync'd edits across a codebase for things to not just
  compile but be correct, then it's not resilient."
- It's
  [A Stale `SAFETY:` Comment](03-writing-safety-comments/05-stale-comment.md) at
  a larger scale. A check is only evidence if nothing since then could undo it.
  A future edit, a new target, or a dependency update is just a slower way to
  undo it.
- Non-portable code should fail to compile on platforms it doesn't support.
  That's how it survives a platform owner changing the rules, like pointer
  signing on iOS taking bits that tagged pointers assumed were free.
- This section: a new platform (portability, the sibling chip), a dependency
  update, and then the ladder that ties them together.

</details>
