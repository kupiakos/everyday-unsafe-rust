
# Solution

- Fails: aligned (almost always), in bounds (short files), valid value
  (`compressed` not 0 or 1).
- Parse field by field from a checked byte range. No `unsafe` left.

```rust,editable
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct Header {
    pub len: u32,
    pub version: u16,
    pub compressed: bool,
    pub reserved: u8,
}

pub fn header(buf: &[u8]) -> Option<Header> {
    let b: &[u8; 8] = buf.get(3..11)?.try_into().ok()?; // In bounds.
    Some(Header {
        // Native-endian, like the C overlay. A file format should pick one.
        len: u32::from_ne_bytes([b[0], b[1], b[2], b[3]]),
        version: u16::from_ne_bytes([b[4], b[5]]),
        compressed: match b[6] {
            0 => false,
            1 => true,
            _ => return None, // Valid value.
        },
        reserved: b[7],
    })
}

fn main() {
    let file = b"SAV\x10\0\0\0\x01\0\0\0".to_vec();
    println!("{:?}", header(&file));
    println!("{:?}", header(b"SAV")); // `None` instead of UB.
}
```

<details>

- **Answer:** it fails aligned, in bounds, and a valid `bool`; parse from a checked byte range, with no `unsafe`.

- non-null and live hold for every `buf`, because it's a `&[u8]`.
  Initialized holds too: `u8`s, and `Header` has no padding.
  - Usual wrong answer: "fine on x86." The misaligned *reference* is UB on
    every target.
  - What isn't a fix: `read_unaligned`, or `#[repr(packed)]`. Both fix
    alignment, but not the length or the `bool`.
- crates like `zerocopy` derive these checks for you, including
  the `bool` (its `TryFromBytes` trait).
- if students reach for `read_unaligned`, ask what it returns for
  `compressed == 2`. It returns an invalid `Header`, which is UB.

</details>
