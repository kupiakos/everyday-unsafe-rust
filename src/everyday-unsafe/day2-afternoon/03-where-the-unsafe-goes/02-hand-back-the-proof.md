---
minutes: 3
---

# Hand Back the Proof

- Check once, in `new`.
- The type carries the fact from then on.
- Here `new` checks, so it's safe.

```rust,editable
use std::hint::unreachable_unchecked;

#[derive(Clone, Copy)]
pub struct BoundedIdx<const LEN: usize>(
    /// Invariant: less than `LEN`
    usize,
);

impl<const LEN: usize> BoundedIdx<LEN> {
    pub fn new(i: usize) -> Option<Self> {
        (i < LEN).then_some(Self(i))
    }

    #[inline(always)]
    pub fn get(self) -> usize {
        if self.0 >= LEN {
            // SAFETY: `new` is the only writer of `.0` and rejects `i >= LEN`.
            unsafe { unreachable_unchecked() }
        }
        self.0
    }
}

pub fn lookup(table: &[u32; 256], i: BoundedIdx<256>) -> u32 {
    table[i.get()] // one load: the compiler optimizes out the bounds check
}
```

<details>

- **Point:** when the check is possible, do it in a safe `new`, and let the type
  carry the fact from then on.

- [Time Travel](../../day1-morning/03-undefined-behavior/03-time-travel.md) used
  `unreachable_unchecked` to show what UB lets the optimizer do. Here it does
  useful work. Look at the shape: a check in `new`, and a type that remembers
  the check passed.
- [`Record`](01-one-unsafe-constructor.md) made the caller prove its invariant
  (`unsafe fn new`). `BoundedIdx` proves its own (a safe `new` that checks).
  Prefer the checking version whenever the check is possible.
- Ask: "What would break the `SAFETY:` comment in `get`?" Any second way to
  build a `BoundedIdx` without the check, such as a `pub` field or a derived
  `Default` (0 isn't less than `LEN` when `LEN` is 0).
- Same move as `fill_in` returning `&mut Foo` in
  [Best: Hand Back the Proof](../../day2-morning/04-initialization/10-best-shape.md):
  once a fact is established, encode it in a type.

</details>
