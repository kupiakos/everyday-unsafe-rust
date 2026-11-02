---
minutes: 3
---

# Soundness Assigns Responsibility

- Each bug this morning, and who had to fix it.
- Exactly one owner: whoever broke a promise `unsafe` code may rely on.
- Often not the function where the UB happened.

| Example                                    | The UB                                                                    | At fault                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| Unsafe vs Unsound: `read_and_double`       | Safe `main` passes null                                                   | `read_and_double`: its safe signature accepts any pointer |
| The logger, with `unsafe fn Handler::new`  | `log` uses a pointer to a local that's gone                               | `make_handler`: its `SAFETY:` comment                     |
| The logger, with a safe `Handler::new`     | The same                                                                  | `Handler::new`: a safe `fn` that accepts any pointer      |
| Our `Vec`, with `truncate`'s check deleted | `truncate(100)` grows `len`, then `get` reads past the initialized values | `truncate`                                                |

<details>

- **Goal:** students can say who's at fault for UB: whoever broke a promise
  `unsafe` code may rely on (a safe signature, a `# Safety` section, an
  `unsafe impl`), and know that trait laws and application rules don't count.
  **Arc:** recap: who's at fault? → traits can carry promises → `Eq` can lie →
  `Size32` makes the promise `unsafe` → a dangerous `connect` → `unsafe` is only
  for memory safety → exercise.

- A recap of the morning so far, read as "who's at fault?".
- The rule: follow the promise. A safe signature promises every caller is fine.
  An `unsafe fn` call promises the `# Safety` section is met. An `unsafe impl`
  promises the trait's `# Safety` section.
- Only those count. A safe trait's docs (like `Eq`'s, or "at most 64") are trait
  laws, not safety contracts: `unsafe` code can't rely on them, so a lying impl
  is never at fault for UB.
- Safe code that only calls sound interfaces is never at fault for UB. That's
  the soundness property, put to work.
- Soundness exists so that a bug has one clear owner, and the review knows where
  to look.

</details>
