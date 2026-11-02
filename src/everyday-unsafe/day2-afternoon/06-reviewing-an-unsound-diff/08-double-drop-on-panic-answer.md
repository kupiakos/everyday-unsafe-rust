---
minutes: 2
---

# Answer 4: A Double Drop on Panic

- Safe caller: `f` panics, on a `Vec<String>`.
- Unwinding drops `item`. Then the `Vec` drops slot `i` again.
- Fix: length 0 during the loop, so a panic leaks instead.

```rust
/// Replaces every element `x` of `v` with `f(x)`, without reallocating.
pub fn map_in_place<T>(v: &mut Vec<T>, mut f: impl FnMut(T) -> T) {
    let len = v.len();
    // SAFETY: 0 is at most the capacity. If `f` panics, the `Vec` owns no
    // elements, so the rest leak instead of dropping twice.
    unsafe { v.set_len(0) };
    let p = v.as_mut_ptr();
    for i in 0..len {
        // SAFETY: `i < len`, so slot `i` still holds an initialized `T`.
        let item = unsafe { p.add(i).read() };
        let new = f(item);
        // SAFETY: `i < len`, and slot `i` was moved out above.
        unsafe { p.add(i).write(new) };
    }
    // SAFETY: `len` was the old length, and every slot below it holds a `T`.
    unsafe { v.set_len(len) };
}
```

<details>

- **Answer:** `f` panics on a `Vec<String>`, a double drop, then the takeaway: set the length to 0 during the loop, so a panic leaks instead.

- The fix: `set_len(0)` before the loop and restore the length after it. A
  panic leaks the elements, which is safe. Or a guard whose `Drop` drops the
  remaining elements and sets the length.
- Not a fix: "`f` must not panic" in a doc comment. `f` is safe code.

</details>
