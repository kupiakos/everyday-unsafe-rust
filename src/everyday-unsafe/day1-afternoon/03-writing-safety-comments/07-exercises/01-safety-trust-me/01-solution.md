
# Solution

- Three comments only needed rewriting.
- `word_without_checksum` needed a code fix: check after the `pop`.

```rust,editable
#![allow(dead_code)]

const DIGITS: &[u8; 16] = b"0123456789abcdef";

fn hex(bytes: &[u8]) -> String {
    let mut out = Vec::with_capacity(bytes.len() * 2);
    for b in bytes {
        out.push(DIGITS[(b >> 4) as usize]);
        out.push(DIGITS[(b & 0xF) as usize]);
    }
    // SAFETY: `from_utf8_unchecked` requires valid UTF-8. Every byte of `out`
    // comes from `DIGITS`, which is ASCII, and ASCII is valid UTF-8.
    unsafe { String::from_utf8_unchecked(out) }
}

fn prefix(v: &[u32], n: usize) -> &[u32] {
    assert!(n <= v.len());
    // SAFETY: The requirements of `slice::from_raw_parts`:
    // - Non-null and aligned: `v.as_ptr()` of a slice always is.
    // - Valid for reads of `n` `u32`s in one allocation: `n <= v.len()`, by the
    //   `assert!`, and `v`'s elements are one allocation.
    // - Initialized: they are elements of `v`.
    // - Not mutated for `'a`: the result borrows `v`, so the borrow checker forbids
    //   writes for as long as the result lives.
    // - Size at most `isize::MAX`: no bigger than `v`.
    unsafe { std::slice::from_raw_parts(v.as_ptr(), n) }
}

/// Drops the trailing checksum word, then returns word `i`.
fn word_without_checksum(v: &mut Vec<u32>, i: usize) -> u32 {
    v.pop();
    assert!(i < v.len());
    // SAFETY: `get_unchecked` requires `i < v.len()`. Nothing changes
    // `v` or `i` between the `assert!` check and `get_unchecked`.
    unsafe { *v.get_unchecked(i) }
}

/// # Safety
///
/// The caller must ensure that `i < v.len()`.
unsafe fn at(v: &[u32], i: usize) -> u32 {
    // SAFETY: `get_unchecked` requires `i < v.len()`.
    // This is promised by the caller.
    unsafe { *v.get_unchecked(i) }
}
```

<details>

- **Answer:** `hex`, `prefix`, and `at` only needed better comments.
  `word_without_checksum` needed the `assert!` moved after the `pop`.

- `hex` could also use `String::from_utf8(out).unwrap()`. Ask whether skipping
  one UTF-8 check is worth a `SAFETY:` comment to maintain.
- `hex`: the evidence is that every byte comes from `DIGITS`, which is ASCII.
- `prefix`: answer all five bullets. "Not mutated for `'a`" holds because the
  result borrows `v`. Ask: "What if it returned `&'static [u32]`?" Then that
  line is false.
- `word_without_checksum`: `i = v.len() - 1` passes the `assert!`, then `pop`
  removes that word. No true comment exists. Move the `assert!` after the `pop`.
- Usual wrong answer for it: "SAFETY: checked above, before the `pop`." True,
  and still not evidence. A check only counts if nothing since then undoes it.
- Not a fix: `debug_assert!` after the `pop`. It's gone in release builds.
- `at`: which requirement did the caller promise, and where is it written? Here
  it's this function's `# Safety`, word for word. Say so.

</details>
