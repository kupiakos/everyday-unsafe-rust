---
minutes: 5
---

# Sound for Every Safe Caller

- A safe function with `unsafe` inside.
- Your job: cause UB from safe code.
- No `unsafe` allowed at the call site.

```rust,editable
/// Returns `v[i]` and `v[i + 1]`.
pub fn pair<T>(v: &[T], i: usize) -> (&T, &T) {
    assert!(i + 1 < v.len());
    // SAFETY: `i < i + 1 < v.len()`, checked by the `assert!`.
    unsafe { (v.get_unchecked(i), v.get_unchecked(i + 1)) }
}
```

<details>

- **Goal:** students review a safe function by playing the hostile safe caller:
  if any safe caller can cause UB, it's unsound. **Arc:** break `pair` → weird
  values → a closure that panics → a trait that lies → a generic `T` → a `Drop`
  that panics → the review question → exercise.

- Play the hostile safe caller. A safe function promises that no safe caller can
  cause UB, however strange the arguments.
- Give the class two minutes. Ask: "What arguments would you try?"
- Expect: an empty slice, `i = 0`, `i = v.len()`, `i = usize::MAX`. Try each
  against the `assert!` and the `SAFETY:` comment.
- Don't reveal the answer yet.
  [Weird Values](06-sound-for-every-safe-caller/01-weird-values.md) does.

</details>
