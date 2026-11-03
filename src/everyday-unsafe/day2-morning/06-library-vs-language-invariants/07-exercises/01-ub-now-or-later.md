---
minutes: 10
---

# Exercise: UB Now or Later?

- Label each numbered line: _fine_, _breaks a library rule_, _breaks a language
  rule_, or _may be UB because of an earlier line_.
- If it crashes, which line shows up in the stack trace?
- Replace both `unsafe` blocks with safe code.

```rust,editable
fn read_log_line() -> Vec<u8> {
    // Level 2, and a Latin-1 "é" (0xE9), which isn't UTF-8.
    b"2 GET /caf\xE9".to_vec()
}

fn main() {
    let raw = read_log_line();
    let level = raw[0] - b'0'; // 1
    let line: &str = unsafe { std::str::from_utf8_unchecked(&raw) }; // 2
    let verbose: bool = unsafe { std::mem::transmute(level) }; // 3
    let words = line.split(' ').count(); // 4
    let chars = line.chars().count(); // 5
    println!("{verbose} {words} {chars} {}", raw.len()); // 6
}
```

<details>

- **Goal:** labeling each line as breaking a language rule (UB now) or a library
  rule (UB later, in safe code).

- Hints:
  - Hint: for each line, ask: is it UB right now, or does it break a promise
    that later code relies on?
  - If stuck on the stack trace: which code actually reads the bytes of `line`?
  - If they say "line 4 is fine, `split(' ')` only looks for spaces": what do
    the [`str` docs](https://doc.rust-lang.org/std/primitive.str.html#invariant)
    promise for bytes that aren't UTF-8?
  - If stuck on the fix: look for a checked version of each conversion.

</details>
