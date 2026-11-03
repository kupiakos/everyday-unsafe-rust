---
minutes: 3
---

# `Cell` and `RefCell`

- `Cell<T>`: get and set through `&self`.
- `RefCell<T>`: borrows checked at run time.
- No `unsafe`. C++ calls this `mutable`.

```rust,editable
use std::cell::Cell;

pub struct Name {
    text: String,
    hash: Cell<Option<u64>>, // Filled in on first use.
}

impl Name {
    pub fn hash(&self) -> u64 {
        if let Some(h) = self.hash.get() {
            return h;
        }
        let h = self.text.bytes().fold(0, |h: u64, b| h.wrapping_mul(31) ^ b as u64);
        self.hash.set(Some(h)); // Mutation through `&self`, with no `unsafe`.
        h
    }
}
```

<details>

- **Point:** `Cell` and `RefCell` mutate behind `&self` with no `unsafe`, like
  C++ `mutable`.

- Story: caching a hash inside a `&self` method, the job C++ gives `mutable`.
- `Cell` never hands out a reference to its contents, only copies in and out. So
  nobody can hold a `&u64` while it changes.
- `RefCell` hands out references, and panics if a `borrow_mut` overlaps another
  borrow. Thread:
  [_compile error > panic > UB_](../../../day1-afternoon/05-resilient-code/06-ladder.md).
- Ask: "Can two threads share a `Name`?" No: `Cell` isn't `Sync`. That's
  [`Send`, `Sync`, and Data Races](../../09-send-sync-and-data-races.md).

</details>
