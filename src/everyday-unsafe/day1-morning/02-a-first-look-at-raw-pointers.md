---
minutes: 3
---

# A First Look at Raw Pointers

- Making a raw pointer is safe.
- Even a null one. Why?

```rust,editable
fn main() {
    let x = 42;
    let p: *const i32 = &x as *const i32;
    let null: *const i32 = std::ptr::null();
    println!("{p:?} {null:?}"); // Prints two addresses.
}
```

<details>

- **Goal:** making a raw pointer is safe, reading through one needs `unsafe` and
  a "valid" pointer, and non-null is only part of validity. **Arc:** making one
  is safe, even null → dereferencing needs `unsafe` → non-null isn't valid; more
  on Day 2.

- Today's examples need just enough raw-pointer vocabulary. This is it.
- `*const T` and `*mut T` are like C pointers: no lifetime, no borrow checking.
- Creating, copying, comparing, and printing them is safe, even for null.
- Ask: "Why is making a null pointer safe?" Because nothing reads through it
  yet. The `unsafe` comes at the use.
  [Dereferencing Needs `unsafe`](02-a-first-look-at-raw-pointers/01-using-one.md)
  opens with this.
- Usual wrong answer from C: "It isn't safe: a null pointer is already a bug."
  Only reading through it is.

</details>
