---
minutes: 10
---

# Exercise: Four Uses of `as_bytes_mut`

- Each function calls `str::as_bytes_mut`.
- Which ones break its contract?
- For each one that does: give an input, and say when it breaks.

```rust,editable
#![allow(dead_code)]

// 1. Replace spaces with underscores.
fn underscores(s: &mut str) {
    let bytes = unsafe { s.as_bytes_mut() };
    for b in bytes {
        if *b == b' ' {
            *b = b'_';
        }
    }
}

// 2. Ported from C: uppercase the Latin-1 letters `à` to `þ`.
fn upcase_latin1(s: &mut str) {
    let bytes = unsafe { s.as_bytes_mut() };
    for b in bytes {
        if (0xE0..=0xFE).contains(b) && *b != 0xF7 {
            *b -= 0x20;
        }
    }
}

// 3. Reverse the characters: reverse all bytes, then fix up each character.
fn reverse(s: &mut str) {
    let b = unsafe { s.as_bytes_mut() };
    b.reverse();
    let mut i = 0;
    while i < b.len() {
        let mut j = i;
        while b[j] & 0xC0 == 0x80 {
            j += 1; // Skip continuation bytes, which now come first.
        }
        b[i..=j].reverse();
        i = j + 1;
    }
}

// 4. Hide the first `n` bytes of a password.
fn mask_prefix(s: &mut str, n: usize) {
    let bytes = unsafe { s.as_bytes_mut() };
    for b in bytes.iter_mut().take(n) {
        *b = b'*';
    }
}
```

<details>

- **Goal:** applying "valid UTF-8 when the borrow ends" to real code, and
  finding the input that breaks it.

- Hints:
  - Hint: try characters of each UTF-8 length: `a`, `é`, `€`, and `😀`. Which
    bytes does each function change?
  - Hint: tests in English or French only use 1- and 2-byte characters.
  - If they say "invalid at any point is UB": reread the
    [`# Safety` section](https://doc.rust-lang.org/std/primitive.str.html#method.as_bytes_mut).
    _When_ must the bytes be valid UTF-8?
  - If they say "Only some inputs break it, so it's fine": who picks the input
    to a safe `fn`?
  - If they suggest `str::from_utf8(bytes).unwrap()` after the loop: what state
    are the bytes in when the panic ends the borrow?

</details>
