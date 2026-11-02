---
session: Day 2 Morning
target_minutes: 180
---

# Welcome to Day 2

Yesterday: contracts. Today: the rules behind "valid". By lunch, you can:

- Say which bit patterns a type allows.
- Initialize memory in stages with `MaybeUninit`.
- Stay sound when called code panics.
- Tell language rules from library rules.
- Unpack "valid pointer" into its parts.
- Say what `&T` and `&mut T` promise.
- Say what `Send` and `Sync` promise.
- Give a reference a lifetime that's true.

{{%session outline}}

<details>

- **Goal:** turn Day 1's word "valid" into rules students can check and write in
  a `SAFETY:` comment: validity, initialization, panics, library rules,
  pointers, references, `Send`/`Sync`, and lifetimes.

- Each rule today runs the core loop from Day 1: find the `# Safety` section,
  answer it in a `SAFETY:` comment, then wrap it so the next caller doesn't have
  to.
- Ask: "Yesterday, what did 'valid pointer' mean?" Collect answers. Pointers in
  Full turns them into a checklist mid-morning.
- Every section has a "who's at fault?" question. Threads show up for the first
  time near the end.

</details>
