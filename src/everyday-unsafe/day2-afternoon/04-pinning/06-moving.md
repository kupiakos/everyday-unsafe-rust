---
minutes: 5
---

# Moving Pinned Values

- `Pin::set`: drop it in place, write a new one.
- Projection: from a pinned struct to a pinned field.
- Hand-written projection is `unsafe`.
- `pin-project` writes it for you.

```rust
use std::future::Future;
use std::pin::Pin;
use std::task::{Context, Poll};
use std::time::Instant;

pub struct Timeout<F> {
    inner: F,          // Structurally pinned.
    deadline: Instant, // Not structurally pinned: a plain `&mut` is fine.
}

impl<F: Future> Future for Timeout<F> {
    type Output = Option<F::Output>;

    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output> {
        if Instant::now() >= self.deadline {
            return Poll::Ready(None);
        }
        // SAFETY: `inner` is structurally pinned: `Timeout` never moves it out
        // of a pinned `self`, has no `Drop` impl, isn't `repr(packed)`, and is
        // only `Unpin` when `F` is.
        let inner = unsafe { self.map_unchecked_mut(|t| &mut t.inner) };
        inner.poll(cx).map(Some)
    }
}
```

<details>

- **Point:** a pinned value can still be replaced in place (`Pin::set`) or
  reached through a field (projection). Hand-written projection is `unsafe`, and
  its proof is about the whole type.

- A pinned value can't move, but it can be replaced: `Pin::set` runs the old
  value's destructor where it is, then writes the new value at the same address.
- `Timeout` needs `Pin<&mut F>` for its field to call `poll`. Getting one is a
  projection, and the `SAFETY:` comment lists what makes it sound.
- Every item in that comment is a promise about the whole type, not this line:
  add a `Drop` impl that moves `inner` later, and this block becomes unsound.
- Candidates for the library question above: `pin-project` and
  `pin-project-lite` generate the projection and check those promises at compile
  time.

</details>
