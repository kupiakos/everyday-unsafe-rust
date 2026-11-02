---
minutes: 3
---

# A Closure That Panics

- The caller's closure can panic.
- Unwinding leaves your state half-done.

```rust,no_run
/// Replaces each element `x` with `f(x)`.
pub fn map_in_place<T>(v: &mut [T], mut f: impl FnMut(T) -> T) {
    for x in v.iter_mut() {
        let p: *mut T = x;
        // SAFETY: `p` comes from a `&mut T`, so it's valid for reads and writes.
        unsafe { p.write(f(p.read())) }
    }
}

fn main() {
    let mut v = vec![String::from("a")];
    // `f` owns the `String` and drops it while unwinding. Then `v` drops the
    // same `String` again: a double free, from safe code.
    map_in_place(&mut v, |_| panic!("oops"));
}
```

<details>

- **Point:** the caller's closure can panic mid-function. Unwinding then drops a
  bitwise-copied `String` twice, so a true `SAFETY:` comment still leaves the
  function unsound.

- `p.read()` makes a bitwise copy. Until `p.write` runs, two places think they
  own the same `String`.
- If `f` returns, `p.write` overwrites the old copy without dropping it, and all
  is well. If `f` panics, `p.write` never runs.
- The `SAFETY:` comment is true, and the function is still unsound. The proof
  forgot that `f` might not return.
- Fixes need Day 2's Panics, Leaks, and Drop Guarantees: for example, abort on
  panic, or require `T: Default` and use `mem::take`.

</details>
