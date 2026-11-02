---
minutes: 1
---

# Breaking a Library Rule

- `from_utf8_unchecked` requires UTF-8.
- Latin-1 `é` is one byte, `0xE9`.
- Which line goes wrong? Who's at fault?

```rust
fn read_log_line() -> Vec<u8> {
    b"caf\xE9".to_vec() // Latin-1, not UTF-8.
}

fn main() {
    let line = read_log_line();

    // SAFETY: Our logs are always ASCII.
    let s = unsafe { std::str::from_utf8_unchecked(&line) };
    println!("{}", s.chars().count());
}
```

<details>

- **Question:** students find which line goes wrong and who's at fault (UB later in `chars()`; the `unsafe` block is at fault). The answer is on the next slide.

- Ask: "Which line goes wrong?" Then: "Where would it crash, and who's at
  fault?" The next slide has the answers.
- Expected: the `unsafe` line breaks the rule, but nothing happens there.
  `chars()` may go wrong later, in safe code. The `unsafe` block is at fault.
- Usual wrong answers: "the `unsafe` line is UB right away", by analogy with
  a `bool` holding 2; and "`chars()` has the bug, since that's where it
  crashes".

</details>
