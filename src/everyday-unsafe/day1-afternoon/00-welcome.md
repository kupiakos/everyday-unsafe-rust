---
session: Day 1 Afternoon
target_minutes: 120
---

# Welcome Back

This morning: who is at fault for UB. This afternoon: the contracts.

By the end of today, you can:

- Read a `# Safety` section, bullet by bullet.
- Write a `SAFETY:` comment answering every bullet.
- Write a `# Safety` section for your function.
- Spot code that's only sound on some platforms, or that relies on
  behavior nobody promised.
- Review a safe function by trying to break it.

{{%session outline}}

<details>

- **Goal:** this half-day turns the morning's contracts into practice: read a
  `# Safety` section, answer it in a `SAFETY:` comment, write one for your own
  function, and review a safe function as a hostile caller.

- This afternoon is practical: the core loop from the logger's Fix 2, done
  carefully. Find the `# Safety` section, answer it in a `SAFETY:` comment,
  then wrap it so the next caller doesn't have to.
- Ask: "Who remembers which file was at fault in the logger?" The answer
  (`Handler::new`) is the reason contracts matter.
- Raw pointers came in this morning, only briefly. The full meaning of "valid"
  is on Day 2.
- The afternoon ends with the question every review asks. If you only attend
  Day 1, that's the one to keep.

</details>
