---
minutes: 4
---

# Two Roles of `unsafe`

- `unsafe fn`, `unsafe trait`: ask for a proof. Declare what you require.
- `unsafe {}`, `unsafe impl`: provide one. Show you can give what they require.
- `/// # Safety` requests. `// SAFETY:` responds.

```rust,editable
/// # Safety
///
/// The caller must ensure that `i < v.len()`.
unsafe fn get_fast(v: &[u32], i: usize) -> u32 {
    // SAFETY: The caller guarantees `i < v.len()`, the only precondition of
    // `get_unchecked`.
    unsafe { *v.get_unchecked(i) }
}

/// # Safety
///
/// Implementors must ensure that the all-zero bit pattern is a valid `Self`.
unsafe trait Zeroable {}

// SAFETY: Every bit pattern, including all zeros, is a valid `u32`.
unsafe impl Zeroable for u32 {}

fn main() {
    let v = [10, 20, 30];
    if 2 < v.len() {
        // SAFETY: `2 < v.len()` was checked on the line above.
        println!("{}", unsafe { get_fast(&v, 2) });
    }
}
```

<details>

- **Point:** `unsafe fn` and `unsafe trait` ask for a proof (`# Safety`
  section); `unsafe {}` and `unsafe impl` provide one (`SAFETY:` comment).

- The same keyword does two opposite jobs. `unsafe fn` says "callers have
  homework". `unsafe {}` says "I did the homework".
- `get_fast` does both: it asks its caller for `i < v.len()`, and uses that to
  answer
  [`get_unchecked`'s requirement](https://doc.rust-lang.org/std/primitive.slice.html#method.get_unchecked).
- Ask: who proves `2 < v.len()` here? (`main`, with the `if`.)
- Next: [`unsafe` in a Trait](04-trait-positions.md), the same split inside a
  trait, where `unsafe` can sit in three places.
- `Zeroable` comes back in
  [Traits Can Carry Promises](../08-soundness-assigns-responsibility/01-unsafe-trait.md).

</details>
