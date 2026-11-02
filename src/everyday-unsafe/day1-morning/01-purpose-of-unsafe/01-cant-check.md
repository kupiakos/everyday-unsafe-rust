---
minutes: 3
---

# What the Compiler Can't Check

- Some correct code can't be proven safe.
- `unsafe` is for that code.

| Code                    | What the compiler can't see          |
| ----------------------- | ------------------------------------ |
| Calling C's `strlen(s)` | Whether `s` ends with a NUL byte     |
| A buffer for `read()`   | Which bytes have been written yet    |
| The inside of `Vec`     | That `len` counts initialized values |

<details>

- **Point:** some correct code (calling C, partly written buffers, the inside of
  `Vec`) can't be proven safe by the compiler, and `unsafe` is what lets it be
  written in Rust at all.

- The compiler can't see inside C code, can't track which bytes of a buffer are
  initialized, and can't know what `Vec`'s fields mean.
- Ask: what else belongs in this table? (Hardware registers, system calls,
  memory-mapped files.)
- Without `unsafe`, none of these could be written in Rust at all, including
  `Vec` itself.

</details>
