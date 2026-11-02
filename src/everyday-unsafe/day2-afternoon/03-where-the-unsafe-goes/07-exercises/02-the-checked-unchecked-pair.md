---
minutes: 15
---

# Exercise: The Checked/Unchecked Pair

- Write `parse_header_unchecked`. Its `# Safety` section lists exactly what
  `parse_header` checks.
- Rewrite `parse_header` as checks plus one call to `parse_header_unchecked`.
- Add one `debug_assert!` per `# Safety` bullet.

```rust,editable
#![allow(dead_code, unused_variables)]

#[repr(u8)]
#[derive(Clone, Copy, Debug, PartialEq)]
pub enum Kind {
    Ping = 0,
    Data = 1,
    Close = 2,
}

#[derive(Debug)]
pub struct Header<'a> {
    pub kind: Kind,
    pub payload: &'a [u8],
}

/// Byte 0 is the kind, byte 1 the payload length, then the payload.
pub fn parse_header(buf: &[u8]) -> Option<Header<'_>> {
    let (&kind, rest) = buf.split_first()?;
    let (&len, rest) = rest.split_first()?;
    let kind = match kind {
        0 => Kind::Ping,
        1 => Kind::Data,
        2 => Kind::Close,
        _ => return None,
    };
    let payload = rest.get(..usize::from(len))?;
    Some(Header { kind, payload })
}

/// # Safety
///
/// TODO: exactly what `parse_header` checks.
pub unsafe fn parse_header_unchecked(buf: &[u8]) -> Header<'_> {
    todo!("`get_unchecked` for the bytes, `transmute` for `kind`")
}

fn main() {
    let h = parse_header(&[1, 3, b'a', b'b', b'c', 0xff]).unwrap();
    assert_eq!((h.kind, h.payload), (Kind::Data, &b"abc"[..]));
    assert!(parse_header(&[3, 0]).is_none());
    assert!(parse_header(&[1, 4, b'a']).is_none());
}
```

<details>

- **Goal:** write a `# Safety` section that lists exactly what the checked function checks, as expressions a reviewer could put in an `assert!`.

- Hints:
  - Hint: one `# Safety` bullet per way `parse_header` can return `None`.
  - If stuck on the length bullet: how many bytes come before the payload?
  - If they write "`buf` must be a valid header": could a reviewer put that in
    an `assert!`, or compare it with `parse_header`?
  - Ask: is `transmute::<u8, Kind>(3)` UB at the `transmute`, or only when
    someone `match`es on it?
  - If they make `parse_header_unchecked` safe because it has
    `debug_assert!`s: what happens in release builds?

</details>
