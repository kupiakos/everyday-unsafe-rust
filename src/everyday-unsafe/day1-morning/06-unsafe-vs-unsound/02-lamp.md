---
minutes: 3
---

# A Lamp That Works

- A safe `fn` that takes a raw pointer.
- Every test passes, like a lamp that lights up.
- Is `read_and_double` OK?

```rust
pub fn read_and_double(x: *mut u32) -> u32 {
    unsafe { *x * 2 }
}
```

<details>

- **Question:** students decide whether `read_and_double` is OK even though every test passes (no: a safe caller can pass null). The answer is on the next slide.

- Story 1.5. A lamp wired with hot and neutral swapped still lights up. Nobody
  notices until someone touches the wrong part.
- Ask: is `read_and_double` OK? Usual answer: "yes, if the tests pass". Expected
  answer: no, and the next slide shows why.
- Ask: what does the signature promise a caller? (It's safe, so: any `*mut u32`
  is fine to pass.)

</details>
