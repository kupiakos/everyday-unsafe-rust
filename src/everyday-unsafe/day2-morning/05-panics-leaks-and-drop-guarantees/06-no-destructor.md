---
minutes: 3
---

# Don't Count on a Destructor

- Safe code can skip any destructor.
- So a `Drop` can't be what makes it sound.
- A panic out of `extern "C"`
  [aborts](https://doc.rust-lang.org/reference/panic.html#unwinding-across-ffi-boundaries).

```rust,ignore,editable
// Pre-1.0 `std`, since removed: the guard's destructor joined the thread.
let mut data = vec![1, 2, 3];
let guard = thread::scoped(|| data.push(4)); // The thread borrows `data`.
mem::forget(guard); // Safe! So the join never happens...
drop(data); // ...and the thread may push into freed memory.
```

<details>

- **Point:** safe code can skip any destructor, so a `Drop` can't be what makes
  code sound (`thread::scoped`).

- `thread::scoped` was only sound if the guard's destructor ran.
  [`mem::forget`](https://doc.rust-lang.org/std/mem/fn.forget.html) is safe, so
  it was removed before Rust 1.0 (the "Leakpocalypse").
- Today's `thread::scope` takes a closure, and joins the threads before it
  returns. The library controls the join, not a destructor.
- The guard on [Fix: A Guard](05-guard.md) is fine: it improves the result, and
  the `set_len(0)` fallback keeps things sound without it.
- For [Day 2 afternoon](../../day2-afternoon/00-welcome.md): a panic that
  reaches an `extern "C"` function aborts the process instead of unwinding into
  C. `extern "C-unwind"` is the alternative.
- [Pinning's drop guarantee](https://doc.rust-lang.org/std/pin/index.html#drop-guarantee)
  builds on this section.

</details>
