---
minutes: 5
---

# Writing a `# Safety` Section

- Who must ensure it?
- What, exactly?
- Until when?

| Function                                                                                          | Who        | What                                        | Until when                      |
| ------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------- | ------------------------------- |
| [`Handler::new`](../day1-morning/06-fixing-an-unsound-logger/03-fix-2-make-handler-new-unsafe.md) | The caller | `logger` points to a live `Logger`          | As long as the `Handler` exists |
| [`set_len`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.set_len)                     | The caller | Elements `old_len..new_len` are initialized | At the call                     |
| [`as_bytes_mut`](https://doc.rust-lang.org/std/primitive.str.html#method.as_bytes_mut)            | The caller | The bytes are valid UTF-8                   | When the borrow ends            |

<details>

- **Goal:** students write a `# Safety` section for their own function: who must
  do what, until when, and only for things that cause UB. **Arc:** who, what,
  until when → vague to precise → a C header comment → UB or just a bug? → move
  it into a type → a precondition nobody can check → exercises.

- Every row comes from a contract we already read:
  [Fix 2: Make `Handler::new` `unsafe`](../day1-morning/06-fixing-an-unsound-logger/03-fix-2-make-handler-new-unsafe.md),
  [`set_len`'s Two Bullets](02-reading-a-safety-section/01-two-bullets.md), and
  [A Bullet with a Clock](02-reading-a-safety-section/05-a-bullet-with-a-clock.md).
- "Who" is almost always the caller. Saying it out loud still helps when a
  requirement is about some other code, like the rest of the program.
- "Until when" is the column people forget. A requirement with no end is
  ambiguous: the reader has to guess.
- Students now write their own. Start from a vague one.

</details>
