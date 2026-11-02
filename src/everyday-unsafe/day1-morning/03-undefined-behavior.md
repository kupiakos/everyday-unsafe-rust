---
minutes: 5
---

# Undefined Behavior

Fundamentally, Undefined Behavior occurs when the rules of the language have
been broken. The compiler is only obligated to consider cases where the behavior
is defined.

Undefined Behavior is a state at compile time and at runtime.

| Rule the compiler relies on                | So it may...                    |
| ------------------------------------------ | ------------------------------- |
| A reference is never null                  | Delete null checks on it        |
| A `&mut` is never aliased                  | Keep its value in a register    |
| `unreachable_unchecked()` is never reached | Delete the branch that calls it |

<details>

- **Goal:** students can explain UB as breaking a rule the compiler relies on,
  and why "it didn't crash" and "the tests pass" prove nothing. **Arc:** rules
  the compiler relies on → the null check that vanished (C) → the same in Rust →
  time travel → what can this print? → UB isn't a crash → why UB exists:
  `Vec::push`, `&mut` → not every rule is settled.

- The optimizer doesn't check these rules. It assumes them, and transforms the
  code as if they always hold.
- Break one, and the program's behavior is no longer described by its source
  code. Not "it crashes": anything.
- Each row comes back in this section: null checks next, then the `unreachable`
  branch, then `&mut`.
- C and C++ have the same idea, with different rules.

</details>
