---
minutes: 3
---

# Green Tests, Unhappy Reviewer

- At fault: `read_and_double`'s signature. It accepts any pointer.

Unsound code on its own does not invoke UB. It requires integration with some
other code that expects the code to be sound.

- The test passes.
- No caller passes null today.
- Why is the reviewer unhappy?

```rust
pub fn read_and_double(x: *mut u32) -> u32 {
    unsafe { *x * 2 }
}

#[test]
fn doubles() {
    let mut n = 21;
    assert_eq!(read_and_double(&mut n), 42);
}
```

<details>

- **Answer:** `read_and_double`'s signature is at fault, not `main`.
  **Question:** why is the reviewer unhappy when every test passes? The answer
  is on the next slide.

- Answer to the last slide's question: `read_and_double`'s signature is at
  fault, not `main`. A safe signature promises that every caller is fine.
- Results are correct, tests are green, sanitizers are clean. Ask: why is the
  reviewer unhappy? Usual wrong answer: "nothing's broken, they're being
  pedantic".
- Expected answer: the compiler can't do its job anymore. It would normally stop
  a caller from passing a bad pointer, and the safe signature switched that off.
  Nothing stops tomorrow's caller.
- Unsound code can sit in a binary that never triggers UB. It's still a bug,
  waiting for the next caller.

</details>
