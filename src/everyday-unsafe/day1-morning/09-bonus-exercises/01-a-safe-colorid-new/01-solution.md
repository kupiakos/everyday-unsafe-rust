
# Solution

- `ColorId::new(200)` made `get` read out of bounds.
- `new` now checks. `new_unchecked` asks the caller to check.

```rust,editable
mod palette {
    pub struct Palette {
        pub colors: [u32; 16],
    }

    /// An index into a `Palette`.
    #[derive(Clone, Copy)]
    pub struct ColorId(u8); // Safety invariant: `self.0 < 16`.

    impl ColorId {
        /// Returns `None` if `i` isn't a valid index.
        pub fn new(i: u8) -> Option<ColorId> {
            (i < 16).then_some(ColorId(i))
        }

        /// # Safety
        ///
        /// The caller must ensure that `i < 16`.
        pub unsafe fn new_unchecked(i: u8) -> ColorId {
            ColorId(i)
        }
    }

    impl Palette {
        pub fn get(&self, id: ColorId) -> u32 {
            // SAFETY: `id.0 < 16`, by the invariant on `ColorId`.
            unsafe { *self.colors.get_unchecked(usize::from(id.0)) }
        }
    }
}

use palette::{ColorId, Palette};

fn main() {
    let p = Palette { colors: [0xFF0000; 16] };
    // With the original `new`, `ColorId::new(200)` read out of bounds: UB.
    assert!(ColorId::new(200).is_none());
    for byte in [0x3A_u8, 0xF7] {
        // SAFETY: `byte >> 4` is at most 15.
        let id = unsafe { ColorId::new_unchecked(byte >> 4) };
        println!("{:06x}", p.get(id));
    }
}
```

<details>

- **Answer:** `ColorId::new(200)` reads out of bounds; `new` returns `Option`,
  and `new_unchecked` requires the caller to ensure `i < 16`.

- the high nibble of a byte is always below 16, so the `SAFETY:` comment needs
  no check. That's the case `new_unchecked` exists for.
- `palette::ColorId(200)` doesn't compile outside the module: the field is
  private. That's what makes the invariant checkable.
- Usual wrong answer: "make `get` `unsafe`". Then every caller proves what the
  type was supposed to prove.
- What isn't a fix: `debug_assert!(i < 16)` in `new` (gone in release).

</details>
