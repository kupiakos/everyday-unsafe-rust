---
minutes: 2
---

# The Checklist

- "Valid" is a list, not a check.
- Each `# Safety` bullet names some of it.
- What does `slice::from_raw_parts` ask for?

| Property    | Seen in            | `slice::from_raw_parts(data, len)` |
| ----------- | ------------------ | ---------------------------------- |
| Non-null    | Day 1's logger     | ?                                  |
| Live        | Dangling `String`  | ?                                  |
| Aligned     | Packed header      | ?                                  |
| Initialized | `MaybeUninit`      | ?                                  |
| In bounds   | Bump, provenance   | ?                                  |

<details>

- **Question:** students fill in what `slice::from_raw_parts` requires for each row, including non-null when `len == 0`. The answer is on the next slide.

- Ask: "Fill in the last column. What does `from_raw_parts` need for each
  row?" The next slide has the docs' answers.
- The tricky row: non-null even if `len == 0`. Usual wrong answer: "an empty
  slice can't read anything, so null is fine."

</details>
