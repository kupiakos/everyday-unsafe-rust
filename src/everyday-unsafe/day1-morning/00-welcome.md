---
course: Everyday Unsafe
session: Day 1 Morning
target_minutes: 180
---

# Welcome to Everyday Unsafe!

> IMPORTANT: THIS MODULE IS IN A DRAFT STAGE OF DEVELOPMENT

This course is for engineers who know safe Rust and are new to `unsafe`. C or
C++ experience helps, but you only need it for the FFI sections.

By lunch, you'll be able to:

- Say what `unsafe` marks, and its two roles.
- Explain undefined behavior, and why passing tests prove nothing.
- Tell unsafe from unsound, and find the code at fault.
- Keep a safe interface safe for every caller.
- Explain why non-null doesn't mean "valid".

## Schedule

{{%session outline}}

## Course Credit

This Course has been developed by Alyssa Haroldsen at
[explain.rs](https://explain.rs) in collaboration with Google.

<details>

- **Goal:** what Day 1 morning is for: by lunch, students can say what `unsafe`
  marks, explain UB, tell unsafe from unsound, find the code at fault, and keep
  a safe interface sound for every caller, and explain why non-null isn't
  "valid".

- Ask: who has written `unsafe` Rust? Who has reviewed it?
- The goal is a confident "yes" on simple `unsafe` reviews, and knowing when to
  escalate the rest.
- One running example (`Vec`) and one exercise (the logger) carry this session.
- No threads in this session. `Send` and `Sync` come in
  [`Send`, `Sync`, and Data Races](../day2-morning/09-send-sync-and-data-races.md).

</details>
