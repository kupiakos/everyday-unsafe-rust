---
minutes: 2
---

# Leaking Is Fine

- `mem::forget` on a pinned value is a leak, not UB.
- The memory is never reused, so the address stays valid.
- [Pinning](https://doc.rust-lang.org/std/pin/index.html#drop-guarantee) doesn't
  need `drop` to run. It needs the memory to stay put if it doesn't.

| What happens        | The registered address          | Sound? |
| ------------------- | ------------------------------- | ------ |
| `drop`, then free   | Unregistered before the free    | Yes    |
| `mem::forget`       | Never freed, so still valid     | Yes    |
| Free without `drop` | Still registered, memory reused | No     |

<details>

- **Answer:** a leak, not UB, then the takeaway: pinned memory must stay valid
  until `drop` runs, and memory that's never freed always does.

- Recall
  [Leaking Is Safe](../../day2-morning/05-panics-leaks-and-drop-guarantees/01-leaking-is-safe.md):
  [`mem::forget`](https://doc.rust-lang.org/std/mem/fn.forget.html#safety) is
  safe, so soundness can't depend on a destructor running.
  [`Pin`'s drop guarantee](https://doc.rust-lang.org/std/pin/index.html#drop-guarantee)
  is written around that.
- The last row is what `Pin` rules out: memory reused while something still
  holds its address. Safe code can't do that to a pinned value. `unsafe` code
  that frees or overwrites pinned memory without running `drop` is unsound.
- [FFI](../05-ffi.md) relies on this: C holds `State`'s address until `lp_free`,
  and `Parser`'s `Drop` calls `lp_free` before the box is freed.

</details>
