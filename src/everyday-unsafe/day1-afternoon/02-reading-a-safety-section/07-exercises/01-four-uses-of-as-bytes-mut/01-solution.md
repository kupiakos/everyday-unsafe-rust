
# Solution

- 1 and 3 are fine.
- 2 breaks for `"€"`, and 4 for `mask_prefix("é", 1)`.
- Both break when the borrow ends: the bytes aren't UTF-8 then.

```rust,editable
#![allow(dead_code)]

// 2. Work on `char`s, not bytes. Safe, but it may change the length.
fn upcase(s: &str) -> String {
    s.to_uppercase()
}

// 4. Stop at a character boundary.
fn mask_prefix(s: &mut str, n: usize) {
    let mut n = n.min(s.len());
    while !s.is_char_boundary(n) {
        n -= 1;
    }
    // SAFETY: `as_bytes_mut` requires valid UTF-8 when the borrow ends.
    // `..n` is whole characters, which all become ASCII `*`. `n` is a
    // character boundary, so `n..` is still whole characters.
    let bytes = unsafe { s.as_bytes_mut() };
    bytes[..n].fill(b'*');
}

fn main() {
    let mut s = String::from("é1");
    mask_prefix(&mut s, 1);
    assert_eq!(s, "é1");
    mask_prefix(&mut s, 2);
    assert_eq!(s, "**1");
    println!("{}", upcase("ÿ"));
}
```

<details>

- **Answer:** 2 breaks for 3- and 4-byte characters like `€`, and 4 when `n`
  cuts a character. 1 and 3 are fine: the bytes only have to be valid when the
  borrow ends.

- `to_uppercase` returns a new `String`, because uppercasing can
  change the length (`ß` becomes `SS`). In-place byte tricks only work for
  ASCII, which `str::make_ascii_uppercase` already does safely.
- the `SAFETY:` comment on `mask_prefix` answers the clock: it says
  why the bytes are valid when the borrow ends.
- 1 is fine: ASCII bytes become ASCII bytes.
- 2 breaks for any 3- or 4-byte character. `€` is `E2 82 AC`; `E2` becomes
  `C2`, which leaves `AC` on its own. ASCII and `é` (`C3 A9`) pass, so tests
  in English or French pass too.
- 3 is fine. The bytes are invalid halfway through, and valid again when the
  borrow ends. The usual wrong answer: "invalid at any point is UB". This
  bullet has a clock.
- 4 breaks when `n` cuts a character: `mask_prefix("é", 1)`.
- Usual wrong answer: "Only some inputs break it, so it's fine." Each of
  these is a safe `fn`, so every input counts. Safe Everywhere comes back to
  this.
- Not a fix: `str::from_utf8(bytes).unwrap()` after the loop. The panic ends
  the borrow while the bytes are still invalid, and whoever catches it sees
  a broken `str`.

</details>
