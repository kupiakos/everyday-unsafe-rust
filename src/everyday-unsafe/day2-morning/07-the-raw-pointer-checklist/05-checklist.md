---
minutes: 2
---

# The Checklist

- "Valid" is a list, not a check.
- Each `# Safety` bullet names some of it.
- What does `slice::from_raw_parts` ask for?

| Property    | Seen in              | `slice::from_raw_parts(data, len)` |
| ----------- | -------------------- | ---------------------------------- |
| Non-null    | [The logger]         | ?                                  |
| Live        | [Dangling `String`]  | ?                                  |
| Aligned     | [Packed header]      | ?                                  |
| Initialized | [`MaybeUninit`]      | ?                                  |
| In bounds   | [Bump], [provenance] | ?                                  |

[The logger]: ../../day1-morning/06-fixing-an-unsound-logger.md
[Dangling `String`]: 01-non-null-and-live.md
[Packed header]: 02-aligned.md
[`MaybeUninit`]: 03-initialized.md
[Bump]: 04-in-bounds/01-check-before-compute.md
[provenance]: 04-in-bounds/04-provenance.md

<details>

- **Question:** students fill in what `slice::from_raw_parts` requires for each
  row, including non-null when `len == 0`. The answer is on
  [What `from_raw_parts` Asks For](06-from-raw-parts.md).

- Ask: "Fill in the last column. What does `from_raw_parts` need for each row?"
  [What `from_raw_parts` Asks For](06-from-raw-parts.md) has the
  [docs' answers](https://doc.rust-lang.org/std/slice/fn.from_raw_parts.html#safety).
- The tricky row: non-null even if `len == 0`. Usual wrong answer: "an empty
  slice can't read anything, so null is fine."

</details>
