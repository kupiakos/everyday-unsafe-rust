---
minutes: 10
---

# Exercise: The C Struct Overlay

- Write out a `SAFETY` comment in `header` to find the bugs that make `header` unsound.
- Find inputs that violate three different requirements of the `unsafe` block.
- Rewrite `header` to be sound, with one of these options:
  - Copy the `Header` and return `Option<Header>`.
  - Return `Option<&Header>`, rejecting some input.
  - Make it `unsafe` with a `# Safety` section.

```rust,editable
/// A save file: 3 magic bytes `b"SAV"`, then this header.
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct Header {
    pub len: u32,
    pub version: u16,
    pub compressed: bool,
    pub reserved: u8,
}

// Ported from C: `return (const struct header *)(buf + 3);`
pub fn header(buf: &[u8]) -> &Header {
    unsafe { &*(buf.as_ptr().add(3) as *const Header) }
}

fn main() {
    let file = b"SAV\x10\0\0\0\x01\0\0\0".to_vec();
    println!("{:?}", header(&file)); // UB, almost surely: see the checklist.
}
```

<details>

- **Goal:** a C struct cast fails several checklist items at once (aligned, in bounds, valid value), and parsing field by field needs no `unsafe`.

- Hints:
  - Hint: go down the checklist one requirement at a time. Which ones does a
    `&[u8]` already guarantee?
  - Bigger hints, one per failing requirement:
    - Aligned fails for almost every `buf`: allocations are usually 8- or
      16-aligned, so `+ 3` isn't a multiple of 4.
    - In bounds fails for `buf.len() < 11`. Below 3 bytes, even the `add(3)`
      is UB.
    - Valid value fails when byte 9 isn't 0 or 1: `compressed` is a `bool`.
  - If they say "fine on x86": is the problem the read, or making the
    reference?
  - If they reach for `read_unaligned` or `#[repr(packed)]`: what do those do
    about the length, or the `bool`?

</details>
