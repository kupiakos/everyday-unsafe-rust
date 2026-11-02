---
minutes: 3
---

# What `unsafe` Doesn't Do

- The borrow checker still runs.
- Types are still checked.
- It unlocks a few extra operations.

```rust,compile_fail
fn main() {
    let mut v = vec![1, 2, 3];
    unsafe {
        let first = &v[0];
        v.push(4); // Still an error: `unsafe` doesn't turn off borrowck.
        println!("{first}");
    }
}
```

<details>

- **Point:** `unsafe` turns off no checks: the borrow checker and type checks
  still run, and it only unlocks a few extra operations.

- The same code as the first slide, inside `unsafe`. Same error.
- The extra operations: dereference a raw pointer, call an `unsafe fn`, access a
  `static mut`, read a `union` field, and `unsafe impl` a trait. There are a few
  more, such as `unsafe extern` blocks.
- Usual wrong answer: "`unsafe` turns off Rust's checks." It turns off none of
  them. It only permits these operations.

</details>
