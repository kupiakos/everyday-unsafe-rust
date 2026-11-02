---
minutes: 15
---

# Exercise: Catch Layout Drift

- `logparse` v1.1 adds `lp_get_stats`.
- Assert every field's offset, using the header's comments.
- One assert fails. Fix the struct.
- Delete `#[repr(C)]`. Do the asserts still pass? Is it correct now?

```c
// logparse.h (v1.1)
struct lp_stats {
  uint64_t lines;   // offset 0
  uint32_t errors;  // offset 8
  uint16_t version; // offset 12
  uint8_t level;    // offset 14
};                  // sizeof 16

void lp_get_stats(const lp_parser *p, struct lp_stats *out);
```

```rust,editable
#![allow(non_camel_case_types, dead_code)]
use std::mem::{offset_of, size_of};

#[repr(C)]
pub struct lp_parser {
    _private: [u8; 0],
}

#[repr(C)]
pub struct lp_stats {
    pub lines: u64,
    pub errors: u32,
    pub level: u8,
    pub version: u16,
}

// Checked when the crate compiles: no test has to run.
const _: () = {
    assert!(size_of::<lp_stats>() == 16);
    assert!(offset_of!(lp_stats, lines) == 0);
    // TODO: assert the offset of every other field.
};

unsafe extern "C" {
    pub fn lp_get_stats(p: *const lp_parser, out: *mut lp_stats);
}

fn main() {}
```

<details>

- **Goal:** check a struct's layout against C with compile-time `offset_of!`
  asserts whose numbers come from the header, not from Rust.

- Hints:
  - The numbers come from the header (or C's `offsetof`), never from printing
    what Rust chose. An assert copied from today's Rust layout checks nothing.
  - If they only check the size: would it catch two fields swapped?
  - For the last bullet: do the asserts check a guarantee, or one compiler on
    one target?
  - `bindgen` generates layout checks like these for every struct.

</details>
