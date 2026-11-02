
# Solution

- UB: 1, 2, 4, 6. Fine: 3, 5, 7.
- Every UB line has a safe conversion in `std`.

```rust,editable
#![allow(unused_variables)]
use std::num::NonZeroU8;

fn main() {
    let (two, zero, surrogate) = (2u8, 0u8, 0xD800u32);
    let a: bool = two != 0; // 1: UB before. Decide what 2 means.
    let b: Option<char> = char::from_u32(surrogate); // 2: UB before. Now `None`.
    let c: u32 = u32::from_ne_bytes([1, 2, 3, 4]); // 3: Fine. Endian-dependent.
    let d: Option<&u8> = None; // 4: UB before. Null is `None`, never `&u8`.
    let e: Option<NonZeroU8> = NonZeroU8::new(zero); // 5: Fine. `None`.
    let f: Option<NonZeroU8> = NonZeroU8::new(zero); // 6: UB before. Now `None`.
    let g: Option<&u8> = None; // 7: Fine. `None`, guaranteed by `Option`'s docs.
}
```

<details>

- **Answer:** UB: 1, 2, 4, 6. Fine: 3, 5, 7. Every UB line has a checked `std`
  conversion.

- 1: UB. 2: UB (surrogates aren't `char`s). 3: fine, but the value depends on
  endianness. 4: UB (a null `&u8`). 5: fine, `None`. 6: UB. 7: fine, `None`.
- 5 and 7 surprise people: the `Option` docs guarantee that all-zero bits are
  `None` for these types. That's the niche, used on purpose.
- Usual wrong answer for 4: "fine, as long as nobody reads it." Creating a null
  reference is UB already. The compiler warns about line 4, and only line 4: a
  lint is a hint, not a review.
- Safe versions: `two != 0`, `char::from_u32`, `u32::from_ne_bytes`,
  `NonZeroU8::new`.
- lines 5 and 7 are the same bits as lines 6 and 4. Only the type changed.
  That's the whole lesson: validity belongs to the type, not to the bits.
- if students ask about 3, point out it's fine on every target, but gives a
  different number on big-endian ones: a bug, not UB.

</details>
