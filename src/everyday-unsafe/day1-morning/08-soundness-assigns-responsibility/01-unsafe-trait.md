---
minutes: 3
---

# Traits Can Carry Promises

- Most traits promise only signatures.
- An `unsafe trait` promises more.
- Each `unsafe impl` signs that promise.

```rust,editable
/// # Safety
///
/// Implementors must ensure that the all-zero bit pattern is a valid `Self`.
pub unsafe trait Zeroable {}

// SAFETY: Every bit pattern, including all zeros, is a valid `u32`.
unsafe impl Zeroable for u32 {}

pub fn zeroed<T: Zeroable>() -> T {
    // SAFETY: `T: Zeroable`, so all zeros is a valid `T`.
    unsafe { std::mem::zeroed() }
}
```

<details>

- **Point:** an `unsafe trait` carries a safety contract and each `unsafe impl`
  signs it, so generic `unsafe` code can rely on the trait bound.

- `Zeroable` from
  [Two Roles of `unsafe`](../01-purpose-of-unsafe/03-two-roles.md), now with
  generic code that relies on it.
- `zeroed` is safe: its `unsafe` block is justified by the trait bound alone.
  Its callers never write `unsafe`.
- Ask: what would `unsafe impl Zeroable for &u32` do? `zeroed::<&u32>()` would
  make a null reference, and the `unsafe impl` would be at fault.
- The best-known unsafe traits are `Send` and `Sync`. They come in
  [`Send`, `Sync`, and Data Races](../../day2-morning/09-send-sync-and-data-races.md).

</details>
