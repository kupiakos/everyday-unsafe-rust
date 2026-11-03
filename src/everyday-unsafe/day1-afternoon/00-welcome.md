---
session: Day 1 Afternoon
target_minutes: 120
---

# Welcome Back

[This morning](../day1-morning/08-soundness-assigns-responsibility.md): who is
at fault for UB. This afternoon: the contracts.

By the end of today, you can:

- Read a `# Safety` section, bullet by bullet.
- Write a `SAFETY:` comment answering every bullet.
- Write a `# Safety` section for your function.
- Spot code that's only sound on some platforms, or that relies on behavior
  nobody promised.
- Review a safe function by trying to break it.

{{%session outline}}

<details>

- **Goal:** this half-day turns the
  [morning's contracts](../day1-morning/04-contracts-between-engineers.md) into
  practice: read a `# Safety` section, answer it in a `SAFETY:` comment, write
  one for your own function, and review a safe function as a hostile caller.

- This afternoon is practical: the core loop from the logger's
  [Fix 2: Make `Handler::new` `unsafe`](../day1-morning/06-fixing-an-unsound-logger/03-fix-2-make-handler-new-unsafe.md),
  done carefully. Find the `# Safety` section, answer it in a `SAFETY:` comment,
  then wrap it so the next caller doesn't have to.
- Ask: "Who remembers which file was at fault in the logger?" The answer
  ([`Handler::new` Is at Fault](../day1-morning/06-fixing-an-unsound-logger/06-handler-new-is-at-fault.md))
  is the reason contracts matter.
- Raw pointers came in
  [A First Look at Raw Pointers](../day1-morning/02-a-first-look-at-raw-pointers.md),
  only briefly. The full meaning of "valid" is in Day 2's
  [The Raw Pointer Checklist](../day2-morning/07-the-raw-pointer-checklist.md).
- The afternoon ends with the question every review asks. If you only attend Day
  1, that's the one to keep.

</details>
