---
minutes: 5
---

# Reviewing an Unsound Diff

- A contributor sends a PR: "2x faster parsing."
- It adds `unsafe` to the wrapper.
- Every test passes.
- Your job: find the safe caller that triggers UB.

| Change                                     | Why it's faster      |
| ------------------------------------------ | -------------------- |
| Adopt C's buffers instead of copying       | No allocation        |
| `unsafe impl<H> Send for Parser<H>`        | Parse on a pool      |
| Return slices of C memory as `&'static`    | No copies            |
| Rewrite the record filter in place         | No second `Vec`      |

<details>

- **Goal:** students review a realistic `unsafe` change, find the safe caller that triggers UB in each bug, and say what isn't a fix. **Arc:** the 2x-faster PR → a safe `from_raw` → `Send` without a bound → `'static` slices of C memory → a double drop on panic → what to keep.

- This is the last round of "who's at fault?" for the course. Each change
  from this PR gets two slides: the code and the question, then the answer.
- For each bug, ask the same question: which safe caller triggers UB? Then:
  what isn't a fix?
- Tests passing proves little here. Each bug needs a caller the tests didn't
  write: one that passes the wrong pointer, uses another thread, keeps a
  reference too long, or panics.
- The speedups are real. The point isn't "reject `unsafe`", it's that each
  change needs a proof.

</details>
