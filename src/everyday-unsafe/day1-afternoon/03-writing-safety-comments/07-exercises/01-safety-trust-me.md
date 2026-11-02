---
minutes: 10
---

# Exercise: "SAFETY: Trust Me"

- Rewrite each `SAFETY:` comment so a reviewer can check it.
- Name the requirement. Point at the evidence.
- If no true comment exists, fix the code.

```rust,editable
#![allow(dead_code)]

const DIGITS: &[u8; 16] = b"0123456789abcdef";

fn hex(bytes: &[u8]) -> String {
    let mut out = Vec::with_capacity(bytes.len() * 2);
    for b in bytes {
        out.push(DIGITS[(b >> 4) as usize]);
        out.push(DIGITS[(b & 0xF) as usize]);
    }
    // SAFETY: this is fine.
    unsafe { String::from_utf8_unchecked(out) }
}

fn prefix(v: &[u32], n: usize) -> &[u32] {
    assert!(n <= v.len());
    // SAFETY: the pointer is valid.
    unsafe { std::slice::from_raw_parts(v.as_ptr(), n) }
}

/// Drops the trailing checksum word, then returns word `i`.
fn word_without_checksum(v: &mut Vec<u32>, i: usize) -> u32 {
    assert!(i < v.len());
    v.pop();
    // SAFETY: index checked above.
    unsafe { *v.get_unchecked(i) }
}

/// # Safety
///
/// The caller must ensure that `i < v.len()`.
unsafe fn at(v: &[u32], i: usize) -> u32 {
    // SAFETY: the caller guarantees it.
    unsafe { *v.get_unchecked(i) }
}
```

<details>

- **Goal:** rewriting reassurance into evidence, and noticing when a check has
  been undone, so no true comment exists.

- Hints:
  - Hint for `hex`: what does `from_utf8_unchecked` require, and where does
    every byte of `out` come from?
  - Hint for `prefix`: list every bullet of `from_raw_parts`'s `# Safety`
    section, and answer each one.
  - Ask about `prefix`: "What if it returned `&'static [u32]`?"
  - Hint for `word_without_checksum`: what is `v.len()` at the `assert!`, and
    what is it at `get_unchecked`?
  - If they write "SAFETY: checked above": does anything between the check and
    the `unsafe` block undo it?
  - If they add a `debug_assert!`: what's left of it in a release build?
  - Hint for `at`: which requirement did the caller promise, and where is it
    written?

</details>
