---
minutes: 3
---

# Niches

- An invalid bit pattern for a type is called a "niche".
- Rust uses niches for optimization (like `Option<&T>`).

<!-- mdbook-xgettext: skip -->

```bob
 "Option<bool>: one byte, using bool's niches (today; not promised)"
+-------------+-------------+--------+---------------+
|    0x00     |    0x01     |  0x02  |  0x03 ..0xFF  |
| Some(false) | Some(true)  |  None  | still invalid |
+-------------+-------------+--------+---------------+

 "Option<NonZero<u8>> to u8: guaranteed"
+--------+                   +--------+
|  0x00  | ---transmute----> |  0x00  |  "None is all zeros"
+--------+                   +--------+
```

```rust
# use std::{mem, num::NonZero};
let zero: Option<NonZero<u8>> = NonZero::new(0);
let nonzero: Option<NonZero<u8>> = NonZero::new(10);

// SAFETY:
// - `NonZero`'s docs (under "Layout") promise `Option<NonZero<u8>>` is compatible with `u8`.
// - So `zero` is one initialized byte, and every such byte is a valid `u8`.
assert_eq!(unsafe { mem::transmute::<_, u8>(zero) }, 0u8);
assert_eq!(size_of::<Option<NonZero<u8>>>(), size_of::<NonZero<u8>>());

#[repr(u8)]
enum Foo {
    X = 0,
    Y = 2,
    Z = 3,
}

// Immediate UB!
// unsafe { mem::transmute::<u8, bool>(2) }
// unsafe { mem::transmute::<u8, Foo>(1) }

// Immediate UB for even more reasons!
// unsafe { mem::transmute::<*const u8, &u8>(ptr::null()) }
```

<details>

- **Point:** the compiler reuses invalid values (niches) to store other data,
  like `None`, which is why an invalid value is UB.

- Invalid bit patterns are niches.
- Niches are used for optimization to represent other data.
- Most types have zero or one niche. The most common niche is zero / null.

- Calls back to
  [Why UB Exists: `&mut`](../../day1-morning/03-undefined-behavior/07-mut-references.md):
  `Option<&T>` is pointer-sized because null is never a valid `&T`, so null
  means `None`.
- `NonZero::new(0)` returns `None`, and `None` is stored as the byte 0. The
  code's `SAFETY:` comment cites
  [`NonZero`'s layout guarantee](https://doc.rust-lang.org/std/num/struct.NonZero.html#layout-1).
- This is why invalid values are UB: the optimizer has already given those bit
  patterns another meaning.
- In the diagram, `Option<bool>` reuses byte 2 for `None`. That's rustc's choice
  today, not a promise: don't transmute into `Option<bool>`. The
  [`Option` docs](https://doc.rust-lang.org/std/option/index.html#representation)
  list the types whose `None` is guaranteed to be all zeros, like `&T`,
  `NonZero*`, and `NonNull<T>`.

</details>
