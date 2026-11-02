---
minutes: 2
---

# `unsafe` Is Only for Memory Safety

- `unsafe` means: misuse can cause UB.
- Not for application rules.
- Other bugs: `Result`, `panic!`, or types.

| A second `connect()` call... | Tool                                 |
| ---------------------------- | ------------------------------------ |
| Returns an error             | `Result<Connection, AlreadyOpen>`    |
| Stops the program            | `panic!`                             |
| Can't be written             | A type that can only be built once   |

<details>

- **Answer:** no: a second `connect` breaks an application rule, not a language rule, then `unsafe` is only for UB; use `Result`, `panic!`, or types for other bugs.

- Answer to the last slide's question: no. Opening two connections may be a
  serious bug, but no rule of the language is broken. That's an application
  invariant.
- `unsafe` here is crying wolf: callers write `SAFETY:` comments that have
  nothing to do with memory, and reviewers learn to skim them.
- Instead: return an error on a second call, or panic, or make a type that can
  only be created once.

</details>
