
# Solution

- `level` and `version` were swapped. The size is 16 either way.
- Without `#[repr(C)]`, today's rustc happens to pass the asserts. Keep it
  anyway.

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
    pub version: u16, // Was after `level`: same size, wrong offsets.
    pub level: u8,
}

// Each number comes from a comment in `logparse.h`, not from the Rust struct.
const _: () = {
    assert!(size_of::<lp_stats>() == 16);
    assert!(offset_of!(lp_stats, lines) == 0);
    assert!(offset_of!(lp_stats, errors) == 8);
    assert!(offset_of!(lp_stats, version) == 12);
    assert!(offset_of!(lp_stats, level) == 14);
};

unsafe extern "C" {
    pub fn lp_get_stats(p: *const lp_parser, out: *mut lp_stats);
}

fn main() {}
```

<details>

- **Answer:** `level` and `version` were swapped (same size, wrong offsets).
  Keep `#[repr(C)]`, even though today's rustc passes without it.

- The swapped `level` and `version` keep the size at 16. Only the offset asserts
  catch it: size alone isn't enough.
- Without `#[repr(C)]`, the asserts still pass with today's rustc. Not a fix:
  they check one compiler on one target, not a guarantee. Keep both.
- the asserts are only as good as their source. Generate them, as `bindgen`
  does, or copy them from the C side's `offsetof`.

</details>
