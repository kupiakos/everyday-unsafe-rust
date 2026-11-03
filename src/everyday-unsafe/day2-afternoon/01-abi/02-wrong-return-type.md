---
minutes: 3
---

# The Wrong Return Type

- C's `size_t` is Rust's `usize`, not `i32`.
- C's `int` is `c_int`, not `bool`.
- Both mistakes pass tests on x86-64.
- Both are UB.

```rust,editable
use std::ffi::{c_char, c_int};

unsafe extern "C" {
    // Wrong: C's `strlen` returns `size_t`. Nothing checks this declaration.
    // fn strlen(s: *const c_char) -> i32;
    fn strlen(s: *const c_char) -> usize;

    // C: `int lib_has_data(void);` returns 1, 0, or -1 on error.
    // fn lib_has_data() -> bool; // UB when it returns -1.
    fn lib_has_data() -> c_int;
}

fn has_data() -> Result<bool, c_int> {
    // SAFETY: `lib_has_data` has no preconditions, per its C documentation.
    match unsafe { lib_has_data() } {
        0 => Ok(false),
        1 => Ok(true),
        err => Err(err),
    }
}
```

<details>

- **Point:** a wrong return type in an `extern` declaration compiles and passes
  tests, but it's UB: bind `size_t` as `usize` and `int` as `c_int`, never
  `bool`.

- `strlen` as `i32`: on x86-64 the result comes back in a 64-bit register, and
  `i32` reads the low half. Every test with a short string passes. It's still
  UB, and it gives wrong answers for long strings and on other targets.
- `bool` has exactly two valid values, 0 and 1. The day C returns -1, the
  program holds an invalid `bool`, which is UB immediately, not when it's used.
- The fix for `int` results: bind `c_int` and convert with a `match`, like
  `has_data`. Ask: "What should `lp_feed` return?" (`c_int`, which it does.)
- [Compile error > panic > UB](../../day1-afternoon/05-resilient-code/06-ladder.md):
  none of these mistakes is a compile error, which is the argument for
  [generating the bindings](05-generate-them.md).

</details>
