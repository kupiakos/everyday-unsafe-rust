---
minutes: 10
---

# Exercise: Which Transmutes Are UB?

- Label each numbered line: fine, or UB.
- For each UB line, write the safe conversion.
- Don't run it: some lines are UB.

```rust,editable
#![allow(unused_variables, unnecessary_transmutes)]
use std::mem::transmute;
use std::num::NonZeroU8;

fn main() {
    // Values a parser might read from a file.
    let (two, zero, surrogate) = (2u8, 0u8, 0xD800u32);
    unsafe {
        let a: bool = transmute(two); // 1
        let b: char = transmute(surrogate); // 2
        let c: u32 = transmute([1u8, 2, 3, 4]); // 3
        let d: &u8 = transmute(zero as usize); // 4
        let e: Option<NonZeroU8> = transmute(zero); // 5
        let f: NonZeroU8 = transmute(zero); // 6
        let g: Option<&u8> = transmute(0usize); // 7
    }
}
```

<details>

- **Goal:** validity belongs to the type, not the bits: the same zero byte is
  fine as `Option<NonZeroU8>` and UB as `NonZeroU8`.

- This exercise is the warm-up; [Parse the Header](02-parse-the-header.md) is
  the one that matters. Short on time: skip this one.

- Hints:
  - Hint: Bad bit patterns are UB the moment the value exists, not when it's
    used.
  - Hint: for each line, which bit patterns are valid for the target type?
  - Hint for 5 and 7: what do the
    [`Option` docs](https://doc.rust-lang.org/std/option/index.html#representation)
    say about the all-zero bit pattern for these types?
  - If they say a line is "fine, as long as nobody reads it": see the first
    hint.
  - Ask: the compiler warns about one line. Does that mean the others are fine?
  - If stuck on the safe conversions: most of the target types have a `std`
    constructor that checks.

</details>
