
# Solution

- Line 2 breaks a library rule; lines 4 and 5 are where it may bite.
- Line 3 breaks a language rule: UB on the spot.
- Both conversions have a safe, checked version.

```rust,editable
fn read_log_line() -> Vec<u8> {
    b"2 GET /caf\xE9".to_vec()
}

fn main() {
    let raw = read_log_line();
    let level = raw[0] - b'0'; // 1: fine.
    let line = String::from_utf8_lossy(&raw); // 2: was a library rule. Now "caf�".
    let verbose = level != 0; // 3: was a language rule. Now any level works.
    let words = line.split(' ').count(); // 4: was "may be UB".
    let chars = line.chars().count(); // 5: was "may be UB".
    println!("{verbose} {words} {chars} {}", raw.len()); // 6: fine.
}
```

<details>

- **Answer:** line 3 is UB now; line 2 breaks UTF-8, so lines 4 and 5 may be UB
  later. Both have checked versions.

- 1 fine. 2 breaks a library rule, but nothing happens yet. 3 breaks a language
  rule: UB right there. 4 and 5 may be UB: every `str` method may rely on UTF-8.
  6 is fine by itself, but the program is already UB from line 3.
  - The crash, if any, is inside `chars()` or `split`: safe code in `std`, far
    from line 2. That's what "UB later, somewhere else" means.
  - Usual wrong answer: "line 4 is fine, `split(' ')` only looks for spaces."
    Maybe today. The `str` docs only promise anything for valid UTF-8.
  - Fixes: `String::from_utf8_lossy(&raw)` or `str::from_utf8`, and `level != 0`
    or a `match`.
- if a log _must_ be valid UTF-8, `str::from_utf8` returns an error instead, and
  the caller decides.

</details>
