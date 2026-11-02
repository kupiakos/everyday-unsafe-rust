---
minutes: 3
---

# More on Day 2

- Non-null is only one part of "valid".
- No runtime check tells you a pointer is valid.
- Day 2 unpacks "valid" into a list.

```rust
use std::ptr::NonNull;

fn main() {
    let p: *const i32 = NonNull::dangling().as_ptr(); // Non-null, aligned.
    let q: *const i32 = {
        let x = 1;
        &x as *const i32
    }; // Non-null, but `x` is gone.
    println!("{p:?} {q:?}"); // Fine: printing doesn't read through them.
    // `unsafe { *p }` or `unsafe { *q }` would be UB.
}
```

<details>

- **Point:** non-null isn't valid: a dangling pointer is non-null, no runtime
  check can tell, and Day 2 lists the rest of validity.

- This is the morning's "what isn't a fix" from the logger: the null check let
  `NonNull::dangling()` through.
- `q` is the C bug of returning the address of a local. Rust lets you make the
  pointer; it just won't let you read through it without `unsafe`.
- Ask: "What else could make a pointer invalid?" Collect answers (freed,
  misaligned, wrong type, out of bounds) and park them for Day 2.
- For the rest of today, "valid" means "points at a live value of the right
  type". We practice reading and writing the contract itself.

</details>
