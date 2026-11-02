---
minutes: 5
---

# Pinning on the Stack

- `pin!(value)` pins a value on the stack.
- It takes ownership: the old name is gone.
- `Pin::new_unchecked(&mut x)` leaves `x` movable.

```rust
use std::future::Future;
use std::pin::{Pin, pin};
use std::task::{Context, Poll, Waker};

fn poll_once<F: Future>(fut: Pin<&mut F>) -> Poll<F::Output> {
    fut.poll(&mut Context::from_waker(Waker::noop()))
}

fn main() {
    let mut fut = async { 42 };
    // SAFETY: (wrong) Nothing stops `fut` from being moved after this `Pin`
    // is gone.
    let _ = poll_once(unsafe { Pin::new_unchecked(&mut fut) });
    let _moved = fut; // Compiles, and breaks the pinning promise.

    let fut = pin!(async { 42 }); // `pin!` owns the future, so it can't move.
    let _ = poll_once(fut);
}
```

<details>

- **Point:** `pin!` pins on the stack by taking ownership.
  `Pin::new_unchecked(&mut x)` is wrong when `x` can still move after the `Pin`
  is gone.

- Futures are the everyday `!Unpin` type: an `async` block that holds a borrow
  across an `.await` points into itself, like `SelfRef`. `poll` takes
  `Pin<&mut Self>` for that reason.
- The `SAFETY:` comment on `new_unchecked` is wrong because the promise outlives
  the `Pin`: the value must never move again, even after the `Pin<&mut F>` is
  gone. The next line moves it.
- `pin!` moves the value into a place nobody can name, and hands back only a
  `Pin<&mut T>`. There's no way left to move it.
- The pinned value lives until the end of the enclosing block. A stack-pinned
  C++ object can't be returned from the function that created it; for that, use
  the heap.

</details>
