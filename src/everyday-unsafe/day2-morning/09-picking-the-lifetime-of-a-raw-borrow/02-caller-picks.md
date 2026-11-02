---
minutes: 2
---

# The Caller Picks `'a`

- `'a` is only in the output, so nothing limits it.
- Here, `'a` is `'static`. `x` isn't.
- At fault: the caller's `SAFETY:` comment.
- Better API: tie `'a` to something real.

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
        // SAFETY: (wrong) `x` is live, but `'a` is `'static` here, and `x`
        // doesn't live that long.
        r = unsafe { from_raw(&x) };
    }
    // println!("{r}"); // Use after the end of `x`'s scope.
}
```

<details>

- **Answer:** the caller picks `'a`, here `'static`, so its `SAFETY:` comment is
  at fault, then: tie `'a` to an input.

- Answer to the last slide's question: the caller picks `'a`. The compiler
  accepts any lifetime the caller's code needs, here `'static`.
- Who's at fault? The caller's `SAFETY:` comment, which never checked how long
  `'a` would be.
- `ptr.as_ref()` and `CStr::from_ptr` return unbounded lifetimes too.
- Fix: take the lifetime from an input. For example, a method on an owner,
  `fn get(&self) -> &u32`, ties the result to the borrow of `self`.

</details>
