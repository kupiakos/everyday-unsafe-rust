---
minutes: 10
---

# Exercise: Parse the Header

- Which input bytes make `parse_header_c_style` UB?
- Implement `TryFrom<u8>` for `Command`.
- Implement `parse_header` with no `unsafe`.

```rust,editable
#![allow(dead_code, unused_variables)]

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

fn parse_header_c_style(buf: &[u8; 2]) -> Header {
    // The C port: `cmd = (enum command)buf[0]; urgent = (bool)buf[1];`
    Header {
        command: unsafe { std::mem::transmute::<u8, Command>(buf[0]) },
        urgent: unsafe { std::mem::transmute::<u8, bool>(buf[1]) },
    }
}

#[derive(Debug, PartialEq)]
enum ParseError {
    UnknownCommand(u8),
    BadFlag(u8),
}

impl TryFrom<u8> for Command {
    type Error = ParseError;

    fn try_from(b: u8) -> Result<Self, ParseError> {
        todo!()
    }
}

fn parse_header(buf: &[u8; 2]) -> Result<Header, ParseError> {
    todo!()
}

fn main() {
    let read = Header { command: Command::Read, urgent: true };
    assert_eq!(parse_header(&[0x10, 1]), Ok(read));
    assert_eq!(parse_header(&[0x02, 0]), Err(ParseError::UnknownCommand(0x02)));
    assert_eq!(parse_header(&[0x01, 7]), Err(ParseError::BadFlag(7)));
}
```

<details>

- **Goal:** porting a C cast soundly: both the enum byte and the `bool` byte need a check before the value exists.

- Hints:
  - Hint: each `transmute` makes a value of a type. Which `u8` values are valid
    for that type?
  - If they say "only unknown commands": what type is `buf[1]` transmuted
    into? Would C treat 7 as true?
  - Non-contiguous values (`0x01`, `0x10`, `0x11`, `0xFF`) rule out a range
    check like `b <= 3`.
  - If they add a `debug_assert!` before the `transmute`: what's left of it in
    a release build?
  - If they add a `_ =>` arm to a later `match` on `Command`: when did the UB
    happen?
  - Discussion: should `urgent` reject 7, or treat it as `true` with `!= 0`?
    Either is sound. It's a protocol decision, not a safety one.

</details>
