---
minutes: 1
---

# Designing Sound Interfaces

- Your safe wrapper works. Is every caller forced to use it correctly?
- Where should the one `unsafe` live?

{{%segment outline}}

<details>

- **Goal:** move from what must hold to where the proof goes: design the wrapper
  so every caller is forced to use it correctly.

- [The Rules](../day2-morning/02-the-rules.md) said what must hold. This segment
  is about where the proof goes.
- The C library story continues through [Pinning](04-pinning.md) and
  [FFI](05-ffi.md) after this.
- Ask the first question and leave it open. The answer is "only if the type
  makes them".

</details>
