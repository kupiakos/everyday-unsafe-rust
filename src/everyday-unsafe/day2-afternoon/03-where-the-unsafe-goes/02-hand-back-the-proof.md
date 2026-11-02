---
minutes: 3
---

# Hand Back the Proof

- Check once, in `new`.
- The type carries the fact from then on.
- Here `new` checks, so it's safe.

```rust
use std::hint::unreachable_unchecked;

#[derive(Clone, Copy)]
pub struct BoundedIdx<const LEN: usize>(
    /// Invariant: less than `LEN`
    usize
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

- **Point:** when the check is possible, do it in a safe `new`, and let the type carry the fact from then on.

- Back from Day 1's Undefined Behavior page. Then the point was what UB lets
  the optimizer do. Now look at the shape: a check in `new`, and a type that
  remembers the check passed.
- `Record` made the caller prove its invariant (`unsafe fn new`). `BoundedIdx`
  proves its own (a safe `new` that checks). Prefer the checking version
  whenever the check is possible.
- Ask: "What would break the `SAFETY:` comment in `get`?" Any second way to
  build a `BoundedIdx` without the check, such as a `pub` field or a derived
  `Default` (0 isn't less than `LEN` when `LEN` is 0).
- Same move as `fill_in` returning `&mut Foo` in Initialization: once a fact is
  established, encode it in a type.

</details>
