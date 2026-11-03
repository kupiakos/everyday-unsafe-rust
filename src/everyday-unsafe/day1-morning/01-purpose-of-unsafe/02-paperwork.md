---
minutes: 3
---

# `unsafe` Is Paperwork

- A 4,000-line crate, three `unsafe` blocks.
- No `unsafe`: no memory-safety bugs start here.
- Each `unsafe` block requires a developer show their work.

```text
$ grep -rn "unsafe" src/
src/buffer.rs:41:    unsafe { self.ptr.as_ptr().add(self.len).write(value) };
src/buffer.rs:88:    unsafe { self.ptr.as_ptr().add(i).drop_in_place() };
src/ffi.rs:17:    let n = unsafe { strlen(s.as_ptr()) };
```

<details>

- **Point:** `unsafe` marks the only places a memory-safety bug can start, and
  each one is where a person has to show their work.

- Before a review, you search the crate and find three blocks. That's where the
  compiler handed the proof to a person.
- `unsafe` is bureaucracy: it marks where paperwork is required. If you never
  use it, you can't write a memory-safety bug.
- Careful: a block's proof can depend on other code in its module.
  [The Renovation](../05-unsafe-vs-unsound/06-renovation.md) shows that.
- `#![forbid(unsafe_code)]` turns "this crate has no `unsafe`" into a compile
  error if someone adds some.

</details>
