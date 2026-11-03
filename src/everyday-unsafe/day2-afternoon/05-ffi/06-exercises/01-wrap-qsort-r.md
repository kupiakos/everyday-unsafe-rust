---
minutes: 20
---

# Exercise: Wrap `qsort_r`

- Fill in `trampoline` and `sort_by`, with `SAFETY:` comments.
- Run it. What does the `NaN` comparator do? Is it UB?
- Read C's rules below. Is `sort_by` sound for every closure? Fix it.

> C11 7.22.5: "The comparison function shall not alter the contents of the
> array. \[...\] for `qsort` they shall define a total ordering on the array."
> Breaking a "shall" is UB in C (C11 4p2).

```rust,editable
#![allow(dead_code, unused_variables, unused_mut)]
use std::cmp::Ordering;
use std::ffi::{c_int, c_void};

type Compar =
    unsafe extern "C" fn(*const c_void, *const c_void, *mut c_void) -> c_int;

unsafe extern "C" {
    // glibc: void qsort_r(void *base, size_t nmemb, size_t size,
    //          int (*compar)(const void *, const void *, void *), void *arg);
    fn qsort_r(
        base: *mut c_void,
        nmemb: usize,
        size: usize,
        compar: Compar,
        arg: *mut c_void,
    );
}

/// # Safety
///
/// TODO
unsafe extern "C" fn trampoline<T, F: FnMut(&T, &T) -> Ordering>(
    a: *const c_void,
    b: *const c_void,
    arg: *mut c_void,
) -> c_int {
    todo!("turn `a` and `b` into `&T`, `arg` into `&mut F`, and call it")
}

pub fn sort_by<T, F: FnMut(&T, &T) -> Ordering>(v: &mut [T], mut cmp: F) {
    todo!("call `qsort_r` with `trampoline::<T, F>` and a pointer to `cmp`")
}

fn main() {
    let mut v = vec![3, 1, 2];
    sort_by(&mut v, |a, b| a.cmp(b));
    assert_eq!(v, [1, 2, 3]);

    let mut f = vec![1.0, f64::NAN, 0.5];
    sort_by(&mut f, |a, b| a.partial_cmp(b).unwrap()); // What happens?
}
```

<details>

- **Goal:** write a callback trampoline with `SAFETY:` comments, and see that
  C's rules for the comparator make a safe `sort_by` unsound.

- [Export a Counter to C](../../07-bonus-exercises/02-export-a-counter-to-c.md)
  is in [Bonus Exercises](../../07-bonus-exercises.md), for students who want
  more.

- Hints:
  - Runs on the playground, which is Linux with glibc. Plain `qsort` has no
    `void *` for the closure, so you'd need a global, which breaks with re-entry
    and threads. `qsort_r` is in glibc and POSIX 2024. macOS and older BSDs have
    a `qsort_r` with the arguments in a different order, and Windows has
    `qsort_s`. With hand-written bindings, you check each target.
  - Hint: what does `unwrap` do on `None`? Can a panic leave an `extern "C"` fn?
  - If they reach for `catch_unwind`, then return 0: do the later answers still
    agree with the earlier ones? Reread C's rule.
  - If they reach for `extern "C-unwind"`: does glibc say `qsort_r` can be
    unwound through?
  - If they say "a comparator that isn't a total order gives a garbage order,
    but no UB": is that a promise from Rust's `slice::sort_by`, or from C's
    `qsort`?
  - If stuck on the fix: who writes the closure, and can it lie?
  - Ask: can `cmp` change an element through a `&T`?

</details>
