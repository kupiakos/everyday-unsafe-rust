
# Solution

- `midpoint`: safe, unsound. `wrapping_get`: safe, sound.
- `pair_at`: `unsafe`, unsound. `last_unchecked`: `unsafe`, sound.
- UB from callers: `midpoint(&[])`, and `pair_at(&[7], 0)` that follows the
  `# Safety` section.

```rust,editable,no_run
#![allow(dead_code)]

// Safe and unsound: `midpoint(&[])` reads index 0 of an empty slice.
pub fn midpoint(v: &[u32]) -> u32 {
    // SAFETY: `v.len() / 2` is less than `v.len()`.
    unsafe { *v.get_unchecked(v.len() / 2) }
}

// Safe and sound: on an empty slice, `i % 0` panics before the read.
pub fn wrapping_get(v: &[u32], i: usize) -> u32 {
    // SAFETY: `i % v.len()` is less than `v.len()`.
    unsafe { *v.get_unchecked(i % v.len()) }
}

// `unsafe` and unsound: the `# Safety` section forgot `i + 1`.
pub unsafe fn pair_at(v: &[u32], i: usize) -> (u32, u32) {
    // SAFETY: The caller guarantees that `i` is in bounds.
    unsafe { (*v.get_unchecked(i), *v.get_unchecked(i + 1)) }
}

// `unsafe` and sound: the caller promised `v` isn't empty.
pub unsafe fn last_unchecked(v: &[u32]) -> u32 {
    // SAFETY: The caller guarantees `v.len() >= 1`, so `v.len() - 1` is in
    // bounds.
    unsafe { *v.get_unchecked(v.len() - 1) }
}

fn main() {
    // UB: no `unsafe` here, and `midpoint` reads out of bounds.
    println!("{}", midpoint(&[]));

    // SAFETY: `0 < 1`, which is all that `pair_at`'s `# Safety` section asks.
    // UB anyway: `pair_at` reads index 1 of a one-element slice.
    println!("{:?}", unsafe { pair_at(&[7], 0) });
}
```

<details>

- **Answer:** `midpoint` and `pair_at` are unsound (`midpoint(&[])`,
  `pair_at(&[7], 0)`); `midpoint` panics or becomes `unsafe fn`, and `pair_at`
  requires `i + 1 < v.len()`.

- Fixes: `midpoint` can index with `v[v.len() / 2]` and panic, or become an
  `unsafe fn` that requires a non-empty `v`. `pair_at`'s `# Safety` section
  should say `i + 1 < v.len()`.
- running the solution is UB. In one debug build, `std`'s optional check aborted
  at `midpoint`. In one release build, it hit an illegal instruction. Neither is
  promised.
- Usual wrong answer: "`wrapping_get` is unsound, try an empty slice". `i % 0`
  panics in every build, before the read. A panic is a bug, not UB.
- Usual wrong answer: "`pair_at` is sound, it's `unsafe`". A caller that follows
  its `# Safety` section still gets UB, so the section is wrong.
- Usual wrong answer: "`last_unchecked` underflows on `&[]`". The caller
  promised it won't pass that.
- Read each `SAFETY:` comment as a claim to check. `midpoint`'s is false for an
  empty slice. `pair_at`'s covers `i` and forgets `i + 1`.
- What isn't a fix: a "must be non-empty" doc comment on `midpoint` (it's still
  safe, so nobody has to read it); a `debug_assert!` (gone in release);
  rewording `pair_at`'s `SAFETY:` comment (the bug is in its `# Safety`
  section).

</details>
