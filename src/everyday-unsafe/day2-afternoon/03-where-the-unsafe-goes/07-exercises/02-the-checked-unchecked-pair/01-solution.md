
# Solution

- Three bullets, one per check in `parse_header`.
- `parse_header` checks them, then calls `parse_header_unchecked` once.
- Each `SAFETY:` comment cites one bullet.

```rust,editable
#![allow(dead_code)]
use std::mem::transmute;

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
    if buf.len() < 2 || buf[0] > 2 || buf.len() - 2 < usize::from(buf[1]) {
        return None;
    }
    // SAFETY: The `if` above checked each `# Safety` bullet.
    Some(unsafe { parse_header_unchecked(buf) })
}

/// # Safety
///
/// The caller must ensure that:
/// - `buf.len() >= 2`,
/// - `buf[0] <= 2`, and
/// - `buf.len() >= 2 + buf[1]`.
pub unsafe fn parse_header_unchecked(buf: &[u8]) -> Header<'_> {
    debug_assert!(buf.len() >= 2, "too short");
    debug_assert!(buf[0] <= 2, "bad kind");
    debug_assert!(buf.len() - 2 >= usize::from(buf[1]), "bad length");
    // SAFETY: Indices 0 and 1 are in bounds: `buf.len() >= 2`.
    let (kind, len) =
        unsafe { (*buf.get_unchecked(0), *buf.get_unchecked(1)) };
    // SAFETY: `kind <= 2`, a discriminant of the `repr(u8)` enum `Kind`.
    let kind = unsafe { transmute::<u8, Kind>(kind) };
    // SAFETY: `2 + len <= buf.len()`. Can't overflow: `len` is a `u8`.
    let payload = unsafe { buf.get_unchecked(2..2 + usize::from(len)) };
    Header { kind, payload }
}

fn main() {
    let h = parse_header(&[1, 3, b'a', b'b', b'c', 0xff]).unwrap();
    assert_eq!((h.kind, h.payload), (Kind::Data, &b"abc"[..]));
    assert!(parse_header(&[3, 0]).is_none());
    assert!(parse_header(&[1, 4, b'a']).is_none());
}
```

<details>

- **Answer:** three bullets, `buf.len() >= 2`, `buf[0] <= 2`, and `buf.len() >= 2 + buf[1]`, each mirrored by a `debug_assert!`.

- three bullets: `buf.len() >= 2`, `buf[0] <= 2`, and
  `buf.len() >= 2 + buf[1]`. The usual miss is the third, or getting it off by
  two (`buf.len() >= buf[1]`).
  - Usual wrong `# Safety`: "`buf` must be a valid header." A reviewer can't
    compare that with `parse_header`. Each bullet should be an expression you
    could put in an `assert!`.
  - `transmute::<u8, Kind>` with a 3 is an invalid enum value: UB at once, not
    when someone `match`es on it.
  - Not a fix: making `parse_header_unchecked` safe because it has
    `debug_assert!`s. Release builds skip them.
- the `debug_assert!`s use the same expressions as the `# Safety`
  bullets. Reviewers can check one against the other at a glance.
- in `parse_header`, `buf.len() - 2` can't underflow, because `||`
  stops at `buf.len() < 2`.

</details>
