---
minutes: 3
---

# Questions to Ask at Every Boundary

- Ask these about every FFI function.
- The C docs answer most of them.
- No answer means escalate.

| Question          | Today's example                                      |
| ----------------- | ---------------------------------------------------- |
| Pointer valid?    | Null, aligned, live: `Option<&mut MaybeUninit<T>>`   |
| Who owns it?      | `lp_new` allocates, `lp_free` frees, once            |
| Until when?       | `rec` until we return; `user` until `lp_free`        |
| Representation?   | `#[repr(C)]`, `c_int` not `bool`, `size_t` = `usize` |
| Which thread?     | The worker thread: `State: Send`, `set_var`          |
| Panics, re-entry? | `catch_unwind`; no `&mut` across a C call            |

<details>

- **Point:** the afternoon as one checklist for every FFI function, each row answered in a `# Safety` section or a `SAFETY:` comment.

- Use this table to review the afternoon: point at each row and ask which
  slide it came from.
- "Valid" is a list here, as everywhere: non-null, aligned, initialized,
  live, not aliased. Each pointer at the boundary gets every item checked.
- Every row should end up in a `# Safety` section or a `SAFETY:` comment. If
  the C docs don't answer a row, that's a question for the library's owners,
  not a guess.
- If the course adopts Review Triage, this table is its FFI checklist.

</details>
