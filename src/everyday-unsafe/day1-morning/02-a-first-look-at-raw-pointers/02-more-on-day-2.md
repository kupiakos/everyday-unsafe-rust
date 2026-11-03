---
minutes: 3
---

# More on Day 2

- Non-null is only one part of
  ["valid"](https://doc.rust-lang.org/std/ptr/index.html#safety).
- No runtime check tells you a pointer is valid.
- [The Raw Pointer Checklist](../../day2-morning/07-the-raw-pointer-checklist.md)
  unpacks "valid" into a list.

```rust,editable
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
  check can tell, and
  [The Raw Pointer Checklist](../../day2-morning/07-the-raw-pointer-checklist.md)
  lists the rest of validity.

- The logger hits this later: in
  [Null Checks Don't Make It Sound](../06-fixing-an-unsound-logger/01-null-checks-dont-make-it-sound.md),
  a null check lets `NonNull::dangling()` through.
- `q` is the C bug of returning the address of a local. Rust lets you make the
  pointer; it just won't let you read through it without `unsafe`.
- Ask: "What else could make a pointer invalid?" Collect answers (freed,
  misaligned, wrong type, out of bounds) and park them for
  [The Raw Pointer Checklist](../../day2-morning/07-the-raw-pointer-checklist.md).
- For the rest of today, "valid" means "points at a live value of the right
  type". We practice reading and writing the contract itself.

</details>
