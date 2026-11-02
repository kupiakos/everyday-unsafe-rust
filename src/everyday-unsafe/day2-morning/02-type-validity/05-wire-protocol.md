---
minutes: 3
---

# Parsing a Wire Protocol

- In C, `(enum kind)buf[0]` accepts any byte.
- What about in Rust?
- A newer peer sends kind 3. Who's at fault?

```rust
#[derive(Debug)]
#[repr(u8)]
enum Kind {
    Hello = 0,
    Data = 1,
    Bye = 2,
}

// The C port: `return (enum kind)buf[0];`
fn parse_kind(buf: &[u8]) -> Kind {
    unsafe { std::mem::transmute::<u8, Kind>(buf[0]) }
}

fn handle(buf: &[u8]) -> &'static str {
    match parse_kind(buf) {
        Kind::Hello => "hello",
        Kind::Data => "data",
        Kind::Bye => "bye",
    }
}
```

<details>

- **Question:** students find who's at fault when kind 3 arrives: `parse_kind`, a safe function that `transmute`s any byte. The answer is on the next slide.

- `#[repr(u8)]` fixes the size and the values of the variants. It doesn't make
  other bytes valid.
- The `match` may compile to a jump table with three entries. Kind 3 jumps past
  its end.
- Ask: "Who's at fault: the peer, `handle`, or `parse_kind`?" Expected:
  `parse_kind`. It's a safe function, and a safe caller passing `[3]` gets UB.
  In Rust, only the listed variants are valid, so kind 3 is an invalid value.
- Usual wrong answers: "the peer sent bad data" (input is never trusted), and
  "`handle` needs a `_ =>` arm". That arm isn't a fix: the compiler warns it's
  unreachable, and it may remove it.
- The next slide opens with the answer.

</details>
