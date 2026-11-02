---
session: Day 2 Afternoon
target_minutes: 120
---

# Welcome Back

Welcome back! This afternoon we wrap a C library, then a C++ object that can't
move. By the end, you can:

- Declare C functions and structs correctly.
- Design safe APIs over `unsafe` code.
- Pin C++ objects that care about their address.
- Review an FFI boundary: panics, re-entry, threads.
- Find the safe caller that triggers UB.

{{%session outline}}

<details>

- **Goal:** frame the afternoon as one story: bindings for a C library, a safe wrapper, a C++ object that registers `this`, the callback from C, and a PR review.

- One story all afternoon: bindings for a small C library, a safe wrapper, a
  C++ object that registers `this`, the callback from C, and a review of a
  contributor's PR.
- Each section reuses the morning's rules (initialization, panics, `Send`)
  at a real boundary. Point back to them when they come up.
- Pinning gets the most time. Teams avoid it in ways that cost them later.
- Examples run in Compiler Explorer, with C and Rust side by side.

</details>
