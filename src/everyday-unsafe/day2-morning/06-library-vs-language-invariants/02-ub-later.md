---
minutes: 2
---

# UB Later, in Safe Code

- `from_utf8_unchecked`: rule broken, nothing happens yet.
- `chars()`
  [trusts UTF-8](https://doc.rust-lang.org/std/primitive.str.html#invariant): UB
  there, in safe code.
- At fault: the `unsafe` block. "Always ASCII" isn't a proof.

```rust,editable
fn read_log_line() -> Vec<u8> {
    b"caf\xE9".to_vec() // Latin-1, not UTF-8.
}

fn main() {
    let line = read_log_line();

    // Library invariant broken: nothing goes wrong yet.
    // let s = unsafe { std::str::from_utf8_unchecked(&line) };
    // UB later, inside safe code: `chars()` assumes valid UTF-8.
    // println!("{}", s.chars().count());

    // Language invariant broken: UB immediately.
    // let b: bool = unsafe { std::mem::transmute(2u8) };

    // The fix: check, and handle the error.
    match std::str::from_utf8(&line) {
        Ok(s) => println!("{}", s.chars().count()),
        Err(e) => println!("not UTF-8: {e}"),
    }
}
```

<details>

- **Answer:** the `unsafe` block is at fault, though UB shows up later in safe
  `chars()`, then: a broken library rule is UB later, somewhere else.

- Answer to the question on
  [Breaking a Library Rule](01-breaking-library-rule.md): the `unsafe` line
  breaks a library rule, and nothing happens yet. In UTF-8, `0xE9` starts a
  three-byte sequence. `chars()` trusts that, and may read past the end of the
  buffer.
- Where does it crash? In safe code, possibly far from the `unsafe` block.
- Who's at fault? The `unsafe` block, which had no proof the log was UTF-8.
  "It's always ASCII" isn't a proof.
- Compare the commented-out `bool`: breaking a language rule is UB right there.
- Fixes: `str::from_utf8`, which returns an error, or `String::from_utf8_lossy`.

</details>
