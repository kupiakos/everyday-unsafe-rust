---
minutes: 3
---

# Why a `Box` Isn't Enough

- Moving a `Box` doesn't move its contents.
- But a `&mut T` can: `mem::swap`, `mem::replace`.
- `Box<T>` hands out `&mut T` to anyone.

```rust
struct SelfRef {
    data: [u8; 4],
    ptr: *const u8, // Points into `data`.
}

fn boxed(data: [u8; 4]) -> Box<SelfRef> {
    let mut b = Box::new(SelfRef { data, ptr: std::ptr::null() });
    b.ptr = b.data.as_ptr();
    b
}

fn main() {
    let mut a = boxed(*b"abcd");
    let mut b = boxed(*b"wxyz");
    std::mem::swap(&mut a, &mut b); // Fine: swaps the pointers.
    std::mem::swap(&mut *a, &mut *b); // Moves the `SelfRef`s themselves.
    println!("{:p} vs {:p}", a.ptr, a.data.as_ptr()); // Stale again.
}
```

<details>

- **Point:** a `Box` keeps its contents in place only until someone gets a `&mut T`. `mem::swap` through it moves them.

- The first `swap` exchanges the two `Box` pointers. Each `SelfRef` stays where
  it is, so its `ptr` is still right.
- The second `swap` goes through `&mut SelfRef`, and moves the values between
  the two allocations. Both `ptr`s now point into the other box.
- Boxing a C++ object "to avoid pinning" also breaks earlier: `Box::new(x)`
  moves `x` into the heap after it was constructed and registered. The object
  has to be constructed at its final address.
- Ask: "So what do we need?" A pointer that never hands out `&mut T`. That's
  `Pin`.

</details>
