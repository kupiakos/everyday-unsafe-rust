---
minutes: 5
---

# Pinning on the Heap

- `Box::pin(value)` pins a value on the heap.
- Moving the `Box` doesn't move the value.
- So its address can go to C as a `void*`.

```rust,editable
use std::future::Future;
use std::pin::Pin;

fn task(n: u32) -> impl Future<Output = u32> {
    async move { n }
}

fn main() {
    let mut a = Box::new(task(1));
    let mut b = Box::new(task(2));
    // Moves the futures themselves between the two allocations. Harmless here,
    // but not after they've been polled and hold pointers into themselves.
    std::mem::swap(&mut *a, &mut *b);

    let mut tasks: Vec<Pin<Box<dyn Future<Output = u32>>>> =
        vec![Box::pin(task(1)), Box::pin(task(2))];
    tasks.swap(0, 1); // Fine: this moves the boxes, not the futures.
    // `Pin` won't give out a `&mut` to the future inside, so the futures
    // themselves can't be swapped.
}
```

<details>

- **Point:** `Box::pin` keeps a value at one heap address for its whole life,
  even as the box moves, which is what a C `void *user` needs.

- The first half is [Why a `Box` Isn't Enough](02-box-isnt-enough.md) again,
  with futures: `mem::swap` through `&mut` moves them. The second half is the
  fix: a `Vec` of `Pin<Box<..>>` can be reordered freely, because that only
  moves the boxes.
- A `Pin<Box<T>>` can be stored in a struct, returned, and sent around, and the
  `T` stays at one address the whole time. That's what a C++ object or a C
  library's `void *user` needs.
- Preview of [FFI](../05-ffi.md): the wrapper keeps its callback state in a
  `Pin<Box<State>>` and gives C a pointer to it.
- Ask: "Until when is that `void*` valid?" Until the box is dropped.
  [Until It's Dropped](07-until-dropped.md) makes that precise.

</details>
