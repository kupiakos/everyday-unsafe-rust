---
minutes: 2
---

# UB Isn't a Crash

- Wrong values, leaked data, or "works".
- Fine at `opt-level=0`, broken at `opt-level=3`.
- Passing tests prove nothing.

| It printed... | Because                                   |
| ------------- | ----------------------------------------- |
| `false`       | The freed memory wasn't reused. Still UB. |
| `true`        | The attacker's bytes reused the memory.   |
| Nothing       | It crashed: one of the luckier outcomes.  |

<details>

- **Answer:** no, `false` isn't fine: a use after free is UB, and it may print
  `false`, print `true`, or crash, then passing tests prove nothing, since tests
  mostly run unoptimized.

- Answer to the last slide's question: no, `false` isn't fine. Reading `session`
  after `drop` is a use after free: UB. The program may print `false`, print
  `true`, or do something else entirely.
- `true` here is the exploit: the attacker's byte now decides who's an admin.
- `cargo test` builds without optimizations by default, so tests mostly see the
  unoptimized program. The optimizer's assumptions show up in release.

</details>
