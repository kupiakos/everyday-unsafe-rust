---
minutes: 2
---

# What `from_raw_parts` Asks For

- Every row is a `# Safety` bullet.
- Non-null even for `len == 0`.
- A pointer is more than its address.

| Property    | Seen in              | [`slice::from_raw_parts`] asks for  |
| ----------- | -------------------- | ----------------------------------- |
| Non-null    | [The logger]         | `data` non-null, even if `len == 0` |
| Live        | [Dangling `String`]  | valid for reads, for all of `'a`    |
| Aligned     | [Packed header]      | `data` properly aligned             |
| Initialized | [`MaybeUninit`]      | `len` initialized values of `T`     |
| In bounds   | [Bump], [provenance] | all `len` values in one allocation  |

[`slice::from_raw_parts`]: https://doc.rust-lang.org/std/slice/fn.from_raw_parts.html#safety
[The logger]: ../../day1-morning/06-fixing-an-unsound-logger.md
[Dangling `String`]: 01-non-null-and-live.md
[Packed header]: 02-aligned.md
[`MaybeUninit`]: 03-initialized.md
[Bump]: 04-in-bounds/01-check-before-compute.md
[provenance]: 04-in-bounds/04-provenance.md

<details>

- **Answer:** each row is one of its `# Safety` bullets, non-null even for
  `len == 0`, then: every `# Safety` section picks from this list.

- Answer to the question on [The Checklist](05-checklist.md). Compare with what
  the class wrote.
- The table paraphrases
  [the docs](https://doc.rust-lang.org/std/slice/fn.from_raw_parts.html#safety).
  Its remaining bullets, "not mutated for `'a`" and "total size at most
  `isize::MAX`", lead into
  [From Raw Pointer to Reference](../08-from-raw-pointer-to-reference.md).
- "One allocation" is provenance, from
  [Provenance](04-in-bounds/04-provenance.md): `data` must be allowed to access
  all `len` values, not just point at their address.
- Thread: _"valid" is a list_. Every later `# Safety` section is a selection
  from this table, plus the reference rules in
  [From Raw Pointer to Reference](../08-from-raw-pointer-to-reference.md).

</details>
