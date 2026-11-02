---
minutes: 2
---

# What `from_raw_parts` Asks For

- Every row is a `# Safety` bullet.
- Non-null even for `len == 0`.
- A pointer is more than its address.

| Property    | Seen in            | `slice::from_raw_parts` asks for       |
| ----------- | ------------------ | -------------------------------------- |
| Non-null    | Day 1's logger     | `data` non-null, even if `len == 0`    |
| Live        | Dangling `String`  | valid for reads, for all of `'a`       |
| Aligned     | Packed header      | `data` properly aligned                |
| Initialized | `MaybeUninit`      | `len` initialized values of `T`        |
| In bounds   | Bump, provenance   | all `len` values in one allocation     |

<details>

- **Answer:** each row is one of its `# Safety` bullets, non-null even for `len == 0`, then: every `# Safety` section picks from this list.

- Answer to the last slide's question. Compare with what the class wrote.
- The table paraphrases the docs. Its remaining bullets, "not mutated for
  `'a`" and "total size at most `isize::MAX`", lead into References.
- "One allocation" is provenance, from the Provenance slide: `data` must be
  allowed to access all `len` values, not just point at their address.
- Thread: *"valid" is a list*. Every later `# Safety` section is a selection
  from this table, plus the reference rules next.

</details>
