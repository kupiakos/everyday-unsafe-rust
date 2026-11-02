---
minutes: 3
---

# Can Any Safe Caller Cause UB?

- Can any safe caller cause UB?
- "Any" includes hostile, panicking, and lying callers.
- If yes, the safe function is unsound.

| The hostile caller tries | It breaks code that trusts       | More on Day 2           |
| ------------------------ | -------------------------------- | ----------------------- |
| `usize::MAX`, empty      | Arithmetic that "can't" overflow | In-Bounds Access        |
| A panicking closure      | Code that finishes what it began | Panics, Leaks, and Drop |
| A lying trait impl       | A safe trait's documentation     | Library vs Language     |
| A surprising `T`         | Assumptions about size and drop  | Pointers in Full        |

<details>

- **Point:** the question for every review: can any safe caller, however
  hostile, cause UB? If yes, the safe function is unsound.

- This is the question to take home, especially for students who only attend
  Day 1. Ask it of every safe function with `unsafe` inside.
- Sound means no safe caller, however hostile, can cause UB. "Nobody would call
  it like that" is not an argument.
- When you can't answer it, make the function `unsafe` with a `# Safety`
  section, or escalate to someone who can.
- Day 2 turns each row of this table into a rule.

</details>
