---
minutes: 3
---

# The Sound `parse_kind`

- At fault: `parse_kind`. Kind 3 isn't a valid `Kind`.
- Not a fix: a `_ =>` arm in `handle`.
- Check the byte, then build the value.
- An unknown kind is an error, not UB.
- No `unsafe` left.

```rust
#[derive(Debug)]
#[repr(u8)]
enum Kind {
    Hello = 0,
    Data = 1,
    Bye = 2,
}

// Sound: an unknown kind is an error, not UB.
impl TryFrom<u8> for Kind {
    type Error = u8;

    fn try_from(b: u8) -> Result<Self, u8> {
        match b {
            0 => Ok(Kind::Hello),
            1 => Ok(Kind::Data),
            2 => Ok(Kind::Bye),
            _ => Err(b),
        }
    }
}

fn parse_kind(buf: &[u8]) -> Result<Kind, u8> {
    Kind::try_from(buf[0])
}
```

<details>

- **Answer:** `parse_kind` is at fault, then check the byte with `TryFrom` so an
  unknown kind is an error, not UB.

- Answer to the last slide's question: `parse_kind`, a safe function that a safe
  caller can make UB. The peer can send anything, and a `_ =>` arm after the
  `transmute` is too late.
- The check usually compiles to one comparison, about the cost of C's bounds
  check.
- The caller now decides what an unknown kind means: skip the message, or reject
  the connection.
- Crates can derive this conversion, so you don't write the `match` by hand.
- Thread: _compile error > panic > UB_. An error value is as early as this can
  fail.

</details>
