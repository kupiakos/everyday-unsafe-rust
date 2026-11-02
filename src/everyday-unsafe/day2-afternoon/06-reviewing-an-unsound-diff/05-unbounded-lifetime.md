---
minutes: 1
---

# Bug 3: Fields Without Copying

- The PR returns record fields as slices of C's memory.
- Which safe caller triggers UB?
- Hint: compare the doc comment with the signature.

```rust
/// Caller must pass a pointer valid for reads of `len` elements.
pub fn from_ptr<T>(ptr: *const T, len: usize) -> &'static [T] {
    // SAFETY: The caller passes a valid pointer, as documented above.
    unsafe { core::slice::from_raw_parts(ptr, len) }
}
```

<details>

- **Question:** students find both bugs: a safe function with a precondition in its doc comment, and a `'static` lifetime tied to nothing. The answer is on the next slide.

- Ask: "Which safe caller triggers UB?" Give the class a minute before the
  next slide.
- Expected answer: `let v = vec![1]; let s = from_ptr(v.as_ptr(), 1);
  drop(v);`, then read `s[0]`. Any pointer works, and so does any later use.
- There are two bugs. Students usually find one: either the safe function
  with a precondition in its doc comment, or the `'static` lifetime.
- Usual wrong answer: "It's fine if callers follow the doc comment." It's a
  safe function: callers don't have to.
- If the class is stuck: the morning's Lifetimes section.

</details>
