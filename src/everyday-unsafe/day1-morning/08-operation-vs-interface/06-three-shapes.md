---
minutes: 3
---

# Three Shapes of Sound Code

- Last slide: only `first` is unsound.
- Prefer the first shape.
- `unsafe fn` only when callers must prove something.
- Don't cry wolf.

| Shape                               | Examples                     | Caller writes `unsafe`? |
| ----------------------------------- | ---------------------------- | ----------------------- |
| Safe code only                      | `foo`, the logger's Fix 1    | No                      |
| `unsafe` inside, fully checked      | `push`, `first_checked`      | No                      |
| `unsafe fn` with `# Safety`         | `set_len`, `first_unchecked` | Yes                     |
| Crying wolf: `unsafe` for no reason | `unsafe fn len(&self)`       | Yes, for nothing        |

<details>

- **Answer:** only `first` is unsound, because a doc comment on a safe `fn` binds nobody, then prefer safe interfaces, and use `unsafe fn` only when callers must prove something.

- Answer to the last slide's question: `foo`, `first_checked`, and
  `first_unchecked` are sound. `first` is unsound: a doc comment on a safe
  `fn` binds nobody. Only `first_unchecked` is `unsafe` to call.
- The first two shapes are both safe interfaces. Callers can't tell them
  apart, and shouldn't need to.
- An `unsafe fn` is right when the caller knows something the callee can't
  check, or can't afford to check.
- Crying wolf: an `unsafe fn` with no real requirement. Callers write `unsafe`
  and a `SAFETY:` comment for nothing, and reviewers learn to skim them.
- Ask: which shape is the logger's Fix 2? (`unsafe fn` with `# Safety`.) And
  `read_and_double`? (None: it's unsound.)

</details>
