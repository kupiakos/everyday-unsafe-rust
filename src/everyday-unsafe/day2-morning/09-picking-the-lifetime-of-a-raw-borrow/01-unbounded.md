---
minutes: 1
---

# The Unbounded Lifetime

- `from_raw` returns `&'a u32`. Who picks `'a`?
- Look at where `'a` appears in the signature.
- Is `main` sound? Who's at fault?

```rust
/// # Safety
///
/// `p` must point to a live `u32` for all of `'a`.
unsafe fn from_raw<'a>(p: *const u32) -> &'a u32 {
    // SAFETY: The caller guarantees `p` points to a live `u32` for `'a`.
    unsafe { &*p }
}

fn main() {
    let r: &'static u32;
    {
        let x = 5;
        // SAFETY: `&x` points to a live `u32`.
        r = unsafe { from_raw(&x) };
    }
    // println!("{r}");
}
```

<details>

- **Question:** students work out that the caller picks `'a` (here `'static`), so `r` dangles and the caller's `SAFETY:` comment is at fault. The answer is on the next slide.

- Ask: "Who picks `'a`? Is `main` sound, and who's at fault?" The next slide
  has the answer.
- Expected: the caller picks `'a`, and here it's `'static`. `x` dies at the
  `}`, so `r` dangles. The caller's `SAFETY:` comment is at fault: it never
  checked how long `'a` would be.
- Usual wrong answer: "the compiler checks lifetimes, so it's fine." Not
  across a raw pointer.
- Uncommenting the `println!` would be a use after the end of `x`'s scope.

</details>
