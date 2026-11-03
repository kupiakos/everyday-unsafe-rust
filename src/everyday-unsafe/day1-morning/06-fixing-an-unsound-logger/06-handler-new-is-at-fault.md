---
minutes: 2
---

# `Handler::new` Is at Fault

- At fault: `Handler::new`.
- It accepted a pointer `log` can't check.
- Blame goes where the promise was made.

| Code           | What it did                             |
| -------------- | --------------------------------------- |
| `make_handler` | Passed a pointer to a local             |
| `Handler::new` | Accepted it: a safe `fn` takes anything |
| `log`          | Used it after it dangled: UB            |

<details>

- **Answer:** `Handler::new`, a safe `fn` that accepted a pointer `log` can't
  check, then blame goes where the promise was made, not where the UB happens.

- Answer to the question on [A Safe `Handler::new`](05-a-safe-handler-new.md):
  `Handler::new` is unsound.
- `log` can't check the pointer, and making every `log` call `unsafe` would be
  absurd. The pointer came in through `new`, so that's where the promise has to
  be made.
- `make_handler` isn't at fault this time: it made a safe call, and safe code
  that only calls sound interfaces is never at fault for UB.
- The fixes are the same: [Fix 1](02-fix-1-stay-safe.md) (`Handler<'a>` holding
  a `&'a mut Logger`) or [Fix 2](03-fix-2-make-handler-new-unsafe.md)
  (`unsafe fn new` with a `# Safety` section), even though its body has no
  unsafe operation.
- Blame goes where the promise was made, not where the UB happens.
  `Vec::set_len` is the same shape: see
  [`set_len` Is Just a Field Write](../07-operation-vs-interface/02-set-len.md).

</details>
