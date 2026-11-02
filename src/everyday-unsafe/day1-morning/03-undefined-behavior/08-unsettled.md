---
minutes: 3
---

# Not Every Rule Is Settled

- The rules live in documents.
- Some are still being decided.
- This course: the settled ones.
- At the edge: ask an expert.

| Question                                  | Status      | This course       |
| ----------------------------------------- | ----------- | ----------------- |
| Dereference a null pointer?               | UB          | Never             |
| Read an uninitialized `u8`?               | UB          | Never             |
| Make a `&mut u8` to uninitialized memory? | Not settled | Use `MaybeUninit` |

<details>

- **Point:** the UB rules live in documents and some aren't settled yet; this
  course stays on the settled side, and says when to ask an expert.

- The documents: the Rust Reference's "Behavior considered undefined" list, and
  the `# Safety` sections in the standard library docs.
- The Reference says its list isn't exhaustive. Some rules, like exactly how
  `&mut` aliasing works, are still being decided. Memory models for them exist,
  but they aren't final.
- Unsettled means "may become UB". Code that relies on it may be fine with
  today's compiler and break with the next one.
- So stay on the settled side: "use `MaybeUninit` everywhere" avoids the third
  row entirely.

</details>
