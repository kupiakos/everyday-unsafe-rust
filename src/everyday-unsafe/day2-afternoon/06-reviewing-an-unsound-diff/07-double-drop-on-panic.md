---
minutes: 1
---

# Bug 4: Rewriting in Place

- The PR rewrites records in place, with no second `Vec`.
- Which safe caller triggers UB?
- Hint: `f` is the caller's code. What can it do?

```rust,editable
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
  already dropped. The answer is on
  [Answer 4: A Double Drop on Panic](08-double-drop-on-panic-answer.md).

- Ask: "Which safe caller triggers UB?" Give the class a minute before
  [Answer 4: A Double Drop on Panic](08-double-drop-on-panic-answer.md).
- Expected answer: `map_in_place(&mut v, |s| panic!())` on a `Vec<String>`. `f`
  drops the `String`, and the `Vec` drops it again while unwinding.
- Usual wrong answer: "Both `SAFETY:` comments are true, so it's sound." They
  are, on the path where `f` returns.
- If the class is stuck: the `retain_in_place` bug from
  [The Predicate That Panics](../../day2-morning/05-panics-leaks-and-drop-guarantees/03-predicate-panics.md),
  in new clothes. Walk through a panic on the first element.

</details>
