---
minutes: 4
---

# `Pin` Promises It Won't Move

- `Pin<P>` wraps a pointer, like `Pin<Box<T>>`.
- Promise: the `T` never moves again.
- No safe `&mut T` unless `T: Unpin`.
- Most types are `Unpin`. `Pin` doesn't affect them.

```rust
use std::marker::PhantomPinned;
use std::pin::Pin;

struct SelfRef {
    data: [u8; 4],
    ptr: *const u8,      // Points into `data`.
    _pin: PhantomPinned, // Makes `SelfRef` `!Unpin`.
}

fn pinned(data: [u8; 4]) -> Pin<Box<SelfRef>> {
    let mut b =
        Box::pin(SelfRef { data, ptr: std::ptr::null(), _pin: PhantomPinned });
    let ptr = b.data.as_ptr();
    // SAFETY: Writing a field doesn't move the `SelfRef` out of its box.
    unsafe { b.as_mut().get_unchecked_mut().ptr = ptr };
    b
}

fn main() {
    let mut a = pinned(*b"abcd");
    let mut b = pinned(*b"wxyz");
    std::mem::swap(&mut a, &mut b); // Fine: swaps the pointers.
    // std::mem::swap(&mut *a, &mut *b); // Error: `Pin` won't give a `&mut
    // SelfRef`.
}
```

<details>

- **Point:** `Pin` doesn't stop moves. It removes safe code's ways to get a
  `&mut T` when `T` isn't `Unpin`, so safe code can't move it.

- Same example as the last slide. Two changes: `Box::pin` instead of `Box::new`,
  and a `PhantomPinned` field.
- `Pin` doesn't change the pointer or the value. It only removes the safe ways
  to get a `&mut T`, so safe code can't move the value.
- `Unpin` is an auto trait: a type is `Unpin` unless a field isn't. For an
  `Unpin` type, `Pin<Box<T>>` acts just like `Box<T>`. `async` blocks aren't
  `Unpin`, and a Rust type wrapping a C++ object like `Widget` shouldn't be.
- `get_unchecked_mut` is the escape hatch. Its precondition: don't move the
  value out of the `&mut` it returns.
- Usual wrong answer: "`Pin` tells the compiler not to move it." Values only
  move where code moves them. `Pin` takes away safe code's ways to do that.

</details>
