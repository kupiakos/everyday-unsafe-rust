---
minutes: 2
---

# Where Each Line Goes

- Two rows are UB: `# Safety`.
- One is a bug: `# Errors`.

| From the header               | If the caller gets it wrong         | Goes in    |
| ----------------------------- | ----------------------------------- | ---------- |
| `buf` is at least `len` bytes | C writes past the buffer: UB        | `# Safety` |
| Returns `-1` on error         | The error is ignored: a bug         | `# Errors` |
| Leaves `*out` unwritten       | Reading an uninitialized `*out`: UB | `# Safety` |

<details>

- **Answer:** the buffer size and the unwritten `*out` are UB and go in
  `# Safety`, while `-1` goes in `# Errors`, then the takeaway: only UB belongs
  in `# Safety`.

- Answer to the last slide's question.
- Ignoring `-1` on its own is a logic bug. It only becomes UB through the
  third row: reading `*out` when nothing wrote it.
- If the caller initialized `out` first, the third row is just a wrong number,
  not UB. Being precise about the cause keeps `# Safety` short.
- Panics are never UB. A wrapper that can panic says so under `# Panics`.

</details>
