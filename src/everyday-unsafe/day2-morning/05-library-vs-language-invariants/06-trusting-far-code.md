---
minutes: 3
---

# Trusting a Dependency

- Rely only on what an interface documents.
- Write such promises under `# Safety-usable invariant`.
- Undocumented behavior can change in a patch release.

```rust
use std::alloc::Layout;

const PAGE: usize = 4096;

/// Rounds `n` up to a multiple of `PAGE`.
///
/// # Safety-usable invariant
///
/// If this returns `Some(r)`, then `r % PAGE == 0` and `r >= n`.
fn round_up_to_page(n: usize) -> Option<usize> {
    n.checked_next_multiple_of(PAGE)
}

fn page_layout(n: usize) -> Option<Layout> {
    let size = round_up_to_page(n)?;
    if size > isize::MAX as usize {
        return None;
    }
    // SAFETY: `PAGE` is a nonzero power of two. `size <= isize::MAX` was
    // checked above, and the safety-usable invariant of `round_up_to_page`
    // says `size` is already a multiple of `PAGE`, so rounding it up to
    // `PAGE` doesn't change it.
    Some(unsafe { Layout::from_size_align_unchecked(size, PAGE) })
}
```

<details>

- **Point:** `unsafe` code may rely only on what a dependency documents; write
  such promises under `# Safety-usable invariant`.

- The story: your `unsafe` block relied on a dependency's function always
  returning a non-empty `Vec`. Its docs never promised that, and a patch release
  changed it. Your code, not theirs, was unsound.
- `round_up_to_page` is safe, but `unsafe` code relies on its result. The
  `# Safety-usable invariant` section makes that a promise its maintainers know
  they must keep.
- It's a convention for doc comments, not a rustdoc feature.
- Closes the lying `Ord` branch from Day 1 afternoon: `unsafe` code can't rely
  on a safe trait impl being correct, because nothing promised it.

</details>
