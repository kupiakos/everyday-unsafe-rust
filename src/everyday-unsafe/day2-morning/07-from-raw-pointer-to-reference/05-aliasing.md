---
minutes: 5
---

# Aliasing

- `&mut T`: nothing else accesses the `T`.
- Not even reads.
- One thread, no race. Why is this UB?

```rust
fn f(x: &i32, y: &mut i32) -> i32 {
    *y = 1;
    *x
}

fn main() {
    let mut n = 0;
    let p: *mut i32 = &raw mut n;
    let r = unsafe { f(&*p, &mut *p) };
    println!("{r}");
}
```

<details>

- **Question:** students explain why single-threaded code is UB: a live `&i32` and `&mut i32` to one `n`, and the compiler assumes no aliasing. The answer is on the next slide.

- C parallel: every `&mut` is like a `restrict` pointer, and the compiler
  doesn't need you to write it.
- Safe code can't call `f(&n, &mut n)`: the borrow checker rejects it. Raw
  pointers skip that check, so the promise is yours.
- Ask: "It's single-threaded. Why is this UB?" Aliasing isn't about threads.
  It's about what the optimizer may assume. The next slide opens with the
  answer.
- Expected: a `&i32` and a `&mut i32` to the same `n` are both live during
  `f`. The compiler may assume they don't alias, and return the old `*x`, so
  it may print 0 or 1.
- Usual wrong answer: "it's fine, it always prints 1."
- Next: how this happens by accident, through a C callback.

</details>
