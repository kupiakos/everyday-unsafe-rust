
# Solution

- The `NaN` comparator aborts the process: safe, but a crash.
- C's contract binds the comparator, so `sort_by` must be `unsafe`.
- Or skip C: `slice::sort_by` is never UB, even with a bad comparator.

```rust,editable
use std::cmp::Ordering;
use std::ffi::{c_int, c_void};

type Compar =
    unsafe extern "C" fn(*const c_void, *const c_void, *mut c_void) -> c_int;

# #[cfg(not(miri))]
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
# // Miri can't call C, so it gets a Rust insertion sort in place of glibc's.
# #[cfg(miri)]
# unsafe fn qsort_r(base: *mut c_void, nmemb: usize, size: usize, compar: Compar, arg: *mut c_void) {
#     let at = |i: usize| unsafe { base.cast::<u8>().add(i * size) };
#     for i in 1..nmemb {
#         let mut j = i;
#         while j > 0 && unsafe { compar(at(j - 1).cast(), at(j).cast(), arg) } > 0 {
#             unsafe { std::ptr::swap_nonoverlapping(at(j - 1), at(j), size) };
#             j -= 1;
#         }
#     }
# }

/// # Safety
///
/// The caller must ensure that `a` and `b` each point to a live, aligned,
/// valid `T` that nothing mutates during the call, and that `arg` points to a
/// live `F` that nothing else accesses during the call.
unsafe extern "C" fn trampoline<T, F: FnMut(&T, &T) -> Ordering>(
    a: *const c_void,
    b: *const c_void,
    arg: *mut c_void,
) -> c_int {
    // SAFETY: By this function's `# Safety` preconditions.
    let (a, b, cmp) =
        unsafe { (&*a.cast::<T>(), &*b.cast::<T>(), &mut *arg.cast::<F>()) };
    // A panic in `cmp` can't unwind out of an `extern "C"` fn: it aborts.
    cmp(a, b) as c_int // `Ordering` is -1, 0, or 1.
}

/// Sorts `v` with C's `qsort_r`.
///
/// # Safety
///
/// The caller must ensure that `cmp` defines a total order on the elements of
/// `v`, and doesn't change them (for example through a `Cell`).
pub unsafe fn sort_by<T, F: FnMut(&T, &T) -> Ordering>(v: &mut [T], mut cmp: F) {
    if v.len() < 2 || size_of::<T>() == 0 {
        return;
    }
    // SAFETY: `v` is valid for reads and writes of `v.len()` `T`s, and Rust
    // doesn't use it during the call. C passes `trampoline` pointers to
    // elements of `v` (C11 7.22.5p2), and nothing else uses `cmp`. The
    // caller guarantees that `cmp` follows C's rules for comparators.
    unsafe {
        qsort_r(
            v.as_mut_ptr().cast(),
            v.len(),
            size_of::<T>(),
            trampoline::<T, F>,
            (&raw mut cmp).cast(),
        )
    };
}

fn main() {
    let mut v = vec![3, 1, 2];
    // SAFETY: `Ord for i32` is a total order, and `cmp` changes nothing.
    unsafe { sort_by(&mut v, |a, b| a.cmp(b)) };
    assert_eq!(v, [1, 2, 3]);

    let mut f = vec![1.0, f64::NAN, 0.5];
    f.sort_by(f64::total_cmp); // Or skip C: std's sort is never UB.
}
```

<details>

- **Answer:** the `NaN` panic aborts (not UB), but C's total-order rule binds
  the closure, so `sort_by` must be `unsafe`. Or use `slice::sort_by`.

- The `NaN` comparator panics, and the panic can't leave the `extern "C"`
  trampoline, so the process aborts. That's not UB.
- Usual wrong fix: `catch_unwind`, then return 0. `qsort_r` keeps calling the
  comparator, and the answers no longer agree with the earlier ones, which
  breaks C's rule. `extern "C-unwind"` needs C code that's built to be unwound
  through, and glibc doesn't document that for `qsort_r`. Here the abort is the
  sound answer.
- Usual wrong answer: "A comparator that isn't a total order gives a garbage
  order, but no UB." That's true of Rust's
  [`slice::sort_by`](https://doc.rust-lang.org/std/primitive.slice.html#method.sort_by),
  whose docs say it may panic or leave an unspecified order. For C's `qsort`,
  it's UB. glibc up to 2.38 had a real out-of-bounds write in that case (Qualys,
  2024).
- So a safe `sort_by` that takes any closure is unsound: the closure is
  caller-provided code, and it may lie. Fixes: make it an `unsafe fn` with that
  `# Safety` bullet, or call `slice::sort_by` instead.
- "Shall not alter the contents": a `T` with a `Cell` lets `cmp` mutate through
  `&T`. That's another `# Safety` bullet.
- a `# Safety` bullet the caller can't check (is this closure a total order?) is
  a sign to avoid the API. Here std has a sort with no such bullet.
- the early return skips C for the edge cases: empty slices and zero-sized `T`.

</details>
