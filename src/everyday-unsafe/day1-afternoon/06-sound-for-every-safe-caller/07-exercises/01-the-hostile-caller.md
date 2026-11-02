---
minutes: 15
---

# Exercise: The Hostile Caller

- Try an empty `v`, `n = 0`, `n = usize::MAX`, `T = ()`, and an `f` that panics.
- Which calls cause UB? Which `SAFETY:` comment is false?
- Fix `prepend_with` so that no safe call can cause UB.

```rust,editable
use std::ptr;

/// Inserts `n` new elements, made by calling `f`, at the front of `v`.
pub fn prepend_with<T>(v: &mut Vec<T>, n: usize, mut f: impl FnMut() -> T) {
    let len = v.len();
    v.reserve(n);
    let p = v.as_mut_ptr();
    // SAFETY: The capacity is at least `len + n`, so both ranges fit.
    unsafe { ptr::copy(p, p.add(n), len) };
    // SAFETY: `len + n <= capacity`. Slots `0..n` are filled below.
    unsafe { v.set_len(len + n) };
    for i in 0..n {
        // SAFETY: `i < n <= capacity`.
        unsafe { p.add(i).write(f()) };
    }
}

fn main() {
    let mut v = vec![String::from("a")];
    prepend_with(&mut v, 2, || String::from("new"));
    println!("{v:?}");
    // Your hostile calls here. Some of them are UB if you run them.
}
```

<details>

- **Goal:** trying hostile inputs, including a panicking `f`, against a safe
  function, and spotting a `SAFETY:` comment that cites code that hasn't run
  yet.

- Hints:
  - If they say `n = usize::MAX` is UB: where does it panic, and does any
    `unsafe` run before that?
  - Hint for the false comment: a `SAFETY:` comment must be true when its
    `unsafe` block runs. Does any of them cite code that hasn't run yet?
  - Hint: what's in slots `0..n` while `f` runs? What happens if `f` panics
    there?
  - Bigger hint: with `["a", "b", "c"]` and `n = 1`, the slots are
    `[a, a, b, c]` when `f` panics, and unwinding drops `a` twice.
  - If they move `set_len(len + n)` after the loop: what length does `v` have
    when `f` panics, and what's in those slots?
  - If they document "`f` must not panic": whose code is `f`?
  - The borrow checker helps here: `f` can't reach `v`, so it can't re-enter.

</details>
