---
minutes: 1
---

# Bug 4: Rewriting in Place

- The PR rewrites records in place, with no second `Vec`.
- Which safe caller triggers UB?
- Hint: `f` is the caller's code. What can it do?

```rust
/// Replaces every element `x` of `v` with `f(x)`, without reallocating.
pub fn map_in_place<T>(v: &mut Vec<T>, mut f: impl FnMut(T) -> T) {
    let p = v.as_mut_ptr();
    for i in 0..v.len() {
        // SAFETY: `i < len`, so slot `i` holds an initialized `T`.
        let item = unsafe { p.add(i).read() };
        let new = f(item);
        // SAFETY: `i < len`, and slot `i` was moved out above.
        unsafe { p.add(i).write(new) };
    }
}
```

<details>

- **Question:** students find that if `f` panics, the `Vec` drops an element `f`
  already dropped. The answer is on the next slide.

- Ask: "Which safe caller triggers UB?" Give the class a minute before the next
  slide.
- Expected answer: `map_in_place(&mut v, |s| panic!())` on a `Vec<String>`. `f`
  drops the `String`, and the `Vec` drops it again while unwinding.
- Usual wrong answer: "Both `SAFETY:` comments are true, so it's sound." They
  are, on the path where `f` returns.
- If the class is stuck: the morning's `retain` bug, in new clothes. Walk
  through a panic on the first element.

</details>
