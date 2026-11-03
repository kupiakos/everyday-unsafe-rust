---
minutes: 1
---

# A Generic Type

- The caller picks `T`.
- Pick a `T` that breaks `clear_bad`.
- Zero-sized? Huge? One with a destructor?

```rust,editable
/// Drops every element of `v`, keeping its buffer.
pub fn clear_bad<T>(v: &mut Vec<T>) {
    for x in v.iter_mut() {
        // SAFETY: `x` is a live `T`, and `set_len(0)` below stops anyone
        // from dropping it again.
        unsafe { std::ptr::drop_in_place(x) }
    }
    // SAFETY: `0 <= capacity()`, and there are no elements in `0..0`.
    unsafe { v.set_len(0) }
}
```

<details>

- **Question:** students pick a `T` that breaks `clear_bad`: one whose `Drop`
  panics. The answer is on [A `Drop` That Panics](05-drop-that-panics.md).

- Ask: "What `T` would you pass?" Give the class a minute.
- Expected answer: a `T` whose `Drop` panics. `set_len(0)` never runs, and
  unwinding drops the earlier elements again.
- Usual wrong answer: "`T = ()` breaks it." Zero-sized types are worth trying,
  but this code never divides by `size_of::<T>()` or moves a pointer.
- Another: "Nothing, the `SAFETY:` comments are true." Ask which one assumes
  something about code that runs later.
- [A `Drop` That Panics](05-drop-that-panics.md) shows the `T`.

</details>
