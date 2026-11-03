---
minutes: 1
---

# Safety Documentation

- You found an `unsafe fn` in a library. What does it want from you?
- How would a reviewer know you gave it that?

{{%segment outline}}

<details>

- **Goal:** the core loop: find the callee's `# Safety` section, answer each
  bullet in a `SAFETY:` comment, and write a precise `# Safety` section of your
  own.

- This is the logger's
  [Fix 2: Make `Handler::new` `unsafe`](../day1-morning/06-fixing-an-unsound-logger/03-fix-2-make-handler-new-unsafe.md),
  done carefully: the core loop.
- Raw pointers appear only enough to have something to document. The full
  meaning of "valid" is in
  [The Raw Pointer Checklist](../day2-morning/07-the-raw-pointer-checklist.md).
- Ask the two questions and leave them open. The answers are `# Safety` and
  `SAFETY:`.

</details>
