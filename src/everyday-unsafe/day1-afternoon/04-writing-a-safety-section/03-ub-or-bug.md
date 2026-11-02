---
minutes: 1
---

# UB or Just a Bug?

- Only UB goes in `# Safety`.
- Errors go in `# Errors`, panics in `# Panics`.
- For each row: what if the caller gets it wrong?

| From the header               | If the caller gets it wrong | Goes in |
| ----------------------------- | --------------------------- | ------- |
| `buf` is at least `len` bytes | ?                           | ?       |
| Returns `-1` on error         | ?                           | ?       |
| Leaves `*out` unwritten       | ?                           | ?       |

<details>

- **Question:** for each header item, students decide whether getting it wrong
  is UB or just a bug, and so whether it goes in `# Safety` or `# Errors`. The
  answer is on the next slide.

- Ask the class to fill in both columns before moving on. The next slide has the
  answers.
- Expected: rows 1 and 3 are UB and go in `# Safety`. Row 2 goes in `# Errors`.
- Usual wrong answer: "Ignoring `-1` is UB, so it goes in `# Safety`." On its
  own it's a logic bug. It only becomes UB through row 3.
- Another: "Row 3 is just a wrong number." Only if the caller initialized `*out`
  first.

</details>
