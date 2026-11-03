---
minutes: 0
---

# Exercise: A Safe `ColorId::new`

1. **Demonstrate the unsoundness**: `ColorId::new` just stores an integer. From
   `main`, make `get` read out of bounds without writing `unsafe`.
1. **Fix the unsound interface**: Change `new` to return `Option<ColorId>`.
1. **Add `unsafe fn new_unchecked(i: u8) -> ColorId`** to `ColorId` and its
   `# Safety` section.
1. Why can't `main` write `palette::ColorId(200)`?

```rust,editable
#![allow(dead_code, unused_variables)]

mod palette {
    pub struct Palette {
        pub colors: [u32; 16],
    }

    /// An index into a `Palette`.
    #[derive(Clone, Copy)]
    pub struct ColorId(u8); // Safety invariant: `self.0 < 16`.

    impl ColorId {
        // TODO: Return `Option<ColorId>`.
        pub fn new(i: u8) -> ColorId {
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
    // TODO: Make `get` read out of bounds, without writing `unsafe`.
    println!("{:06x}", p.get(ColorId::new(3)));
}
```

<details>

- **Goal:** a constructor is where a type's safety invariant is set up, so a
  safe `new` must check, and an `unsafe fn new_unchecked` hands that check to
  the caller.

- Hints:
  - Hint: what does `new` check before it builds a `ColorId`?
  - Bigger hint: `ColorId::new(200)` makes `get` read out of bounds. The UB is
    in `get`; the fault is in `new`.
  - The same lesson as [`set_len`](../07-operation-vs-interface/02-set-len.md):
    building a struct is a safe operation, but other code trusts the value. The
    constructor is where the promise is made.
  - Hint for the last question: try it. What does the compiler say about the
    field?
  - If they say "make `get` `unsafe`": then who has to prove `id.0 < 16`?
  - If they reach for `debug_assert!(i < 16)` in `new`: what's left of it in a
    release build?
  - Real-world version:
    [`File::from_raw_fd`](https://doc.rust-lang.org/std/os/fd/trait.FromRawFd.html#tymethod.from_raw_fd)
    just stores an integer, but it's `unsafe`. The `File` will `close()` that fd
    when dropped, so a safe version could close another component's fd: the C
    double-close bug. `std` calls this
    [I/O safety](https://doc.rust-lang.org/std/io/index.html#io-safety)
    (`OwnedFd`, `BorrowedFd`).
  - Other pairs like `new`/`new_unchecked`:
    [`NonZeroU32::new`](https://doc.rust-lang.org/std/num/struct.NonZero.html#method.new)
    and
    [`char::from_u32`](https://doc.rust-lang.org/std/primitive.char.html#method.from_u32).

</details>
