
# Solution

- `parse_header_c_style` is UB for 252 command bytes and 254 flag bytes.
- Check each byte before building the value.
- An unknown byte becomes an error, not UB.

```rust,editable
#[derive(Debug, PartialEq)]
#[repr(u8)]
enum Command {
    Ping = 0x01,
    Read = 0x10,
    Write = 0x11,
    Reset = 0xFF,
}

#[derive(Debug, PartialEq)]
struct Header {
    command: Command,
    urgent: bool,
}

#[derive(Debug, PartialEq)]
enum ParseError {
    UnknownCommand(u8),
    BadFlag(u8),
}

impl TryFrom<u8> for Command {
    type Error = ParseError;

    fn try_from(b: u8) -> Result<Self, ParseError> {
        match b {
            0x01 => Ok(Command::Ping),
            0x10 => Ok(Command::Read),
            0x11 => Ok(Command::Write),
            0xFF => Ok(Command::Reset),
            _ => Err(ParseError::UnknownCommand(b)),
        }
    }
}

fn parse_header(buf: &[u8; 2]) -> Result<Header, ParseError> {
    let urgent = match buf[1] {
        0 => false,
        1 => true,
        b => return Err(ParseError::BadFlag(b)),
    };
    Ok(Header { command: Command::try_from(buf[0])?, urgent })
}

fn main() {
    let read = Header { command: Command::Read, urgent: true };
    assert_eq!(parse_header(&[0x10, 1]), Ok(read));
    assert_eq!(parse_header(&[0x02, 0]), Err(ParseError::UnknownCommand(0x02)));
    assert_eq!(parse_header(&[0x01, 7]), Err(ParseError::BadFlag(7)));
}
```

<details>

- **Answer:** any command byte outside the four, or a flag byte other than 0 or 1, is UB; check each one and return an error.

- the `match` usually compiles to one or two comparisons. Crates
  can derive `TryFrom<u8>` so you don't write it by hand.
- `Err(b)` keeps the bad byte, so the caller can log it or skip the
  message.
- Any `buf[0]` other than the four listed values, and any `buf[1]`
  other than 0 or 1, is UB, at the `transmute`.
  - Usual wrong answer: "only unknown commands." The `bool` is the same bug,
    and it's easier to miss because "C would treat 7 as true".
  - What isn't a fix: `debug_assert!` before the `transmute` (release builds
    still have UB), or a `_ =>` arm in a later `match` on `Command`.

</details>
