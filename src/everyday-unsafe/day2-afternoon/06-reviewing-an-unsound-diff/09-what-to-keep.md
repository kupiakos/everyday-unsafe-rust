---
minutes: 3
---

# What to Keep

- The core loop: find, justify, wrap.
- One question: which safe caller can trigger UB?
- Approve the boring cases. Escalate the rest.

<!-- mdbook-xgettext: skip -->

```bob
.--------------------.     .--------------------.     .--------------------.
| Find the callee's  |     | Write a "SAFETY:"  |     | Wrap it, so the    |
| "# Safety" section +---->| comment answering  +---->| next caller        |
|                    |     | each item          |     | doesn't have to    |
'--------------------'     '--------------------'     '---------+----------'
          ^                                                      |
          '------------------------ next "unsafe" ---------------'
```

<details>

- **Point:** what to keep from the course: find the `# Safety` section, answer
  it in a `SAFETY:` comment, wrap it, and ask which safe caller can trigger UB.

- If students forget everything else, this loop is what should stay. Every
  section of the course ran it on a new rule.
- The question works on every bug from today: the wrong pointer, another thread,
  a reference kept too long, a panic. Each one is a safe caller doing something
  legal.
- "Boring" `unsafe` follows a documented pattern with a complete `SAFETY:`
  comment. Anything relying on unsettled rules, or that you can't finish the
  proof for, goes to an `unsafe` reviewer.
- If the course adopts Review Triage, its full version goes here.
- Close: ask each student for one change they'll make to code they own.

</details>
