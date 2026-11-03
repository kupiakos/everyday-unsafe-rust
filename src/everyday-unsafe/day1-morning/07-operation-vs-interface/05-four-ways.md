---
minutes: 4
---

# Four Ways to Read `x[0]`

- The same operation each time.
- Which are sound?
- Which are `unsafe` to call?

```rust,editable
fn foo(x: &[i8]) -> i8 {
    x[0]
}
```

```rust,editable
pub fn first_checked(x: &[i8]) -> i8 {
    assert!(!x.is_empty());
    // SAFETY: The `assert!` above guarantees `0 < x.len()`.
    unsafe { *x.get_unchecked(0) }
}

/// The caller must pass a non-empty slice.
pub fn first(x: &[i8]) -> i8 {
    // SAFETY: The docs say `x` must be non-empty.
    unsafe { *x.get_unchecked(0) }
}

/// # Safety
///
/// The caller must ensure that `x` is non-empty.
pub unsafe fn first_unchecked(x: &[i8]) -> i8 {
    // SAFETY: The caller guarantees `0 < x.len()`.
    unsafe { *x.get_unchecked(0) }
}
```

<details>

- **Question:** students place four reads of `x[0]` in the safe/`unsafe` ×
  sound/unsound grid (only `first` is unsound). The answer is on
  [Three Shapes of Sound Code](06-three-shapes.md).

- Place each function in the grid:

  | Interface | Sound                  | Unsound |
  | --------- | ---------------------- | ------- |
  | Safe      | `foo`, `first_checked` | `first` |
  | `unsafe`  | `first_unchecked`      |         |

- `foo` and `first_checked` both panic on an empty slice. A panic is a bug, not
  UB.
- Usual wrong answer: "`first` is sound, its docs say non-empty". `first(&[])`
  is safe to call, and reads out of bounds. Its doc comment isn't a `# Safety`
  section on an `unsafe fn`, so the compiler can't make callers read it.
- [Three Shapes of Sound Code](06-three-shapes.md) opens with the answer.
- Usual question: "can an `unsafe fn` be unsound?" Yes, if its `# Safety`
  section misses a requirement. That's the empty cell.

</details>
