---
minutes: 5
---

# Zero-Cost Wrapper Trick

## Zero-cost wrapper trick

Zero-cost wrapper to turn an `unsafe` deferred init API into a safe one:

<!-- Claude Draft: the `# Safety` doc on `fill_in_inner`, and the second `SAFETY:` comment now cites it instead of the function's body. -->

```rust
# use std::mem::MaybeUninit;
# struct Foo { x: u8, y: u16 }
#[inline(always)] // ensures the no-op `assume_init_mut` inlines
fn fill_in(val: &mut MaybeUninit<Foo>) -> &mut Foo {
    // Could be defined here or perhaps be an `extern fn`.
    /// # Safety
    ///
    /// `p` must be valid for aligned writes of a `Foo`. If it is,
    /// `fill_in_inner` initializes every field of `*p`.
#   #[cfg(any())] // Swap the stub for a body that Run and Miri can execute.
    unsafe fn fill_in_inner(p: *mut Foo) { /* ... */
    }
#   unsafe fn fill_in_inner(p: *mut Foo) {
#       unsafe { p.write(Foo { x: 10, y: 20 }) }
#   }

    // SAFETY: `val.as_mut_ptr()` is valid for aligned writes
    unsafe { fill_in_inner(val.as_mut_ptr()) }
    // SAFETY: `fill_in_inner`'s `# Safety` promises it initialized every
    // field of `Foo`.
    unsafe { val.assume_init_mut() }
}
# let mut v = MaybeUninit::uninit();
# let foo = fill_in(&mut v);
# assert_eq!((foo.x, foo.y), (10, 20));
```

<details>

- **Point:** wrap the fragile raw-pointer API in the best shape, so one function
  holds the `unsafe` and every caller is safe.

- Now, if you're given an implementation that requires `unsafe` to use properly,
  you can actually wrap it in the preferred form.
- This means there's a single `unsafe` location that must review the impl of
  `fill_in_inner` to ensure it actually does the init.

- `fill_in_inner` is the fragile `fill_in(*mut Foo)` from
  [Fair: Takes a Raw Pointer](08-fair-shape.md). Every call site used to repeat
  the same two `unsafe` blocks; now one function does.
- Stacking: the [Best shape](10-best-shape.md)'s `&mut MaybeUninit` discharges
  the inner function's "valid for writes", and its documented promise to
  initialize discharges `assume_init_mut`.
- Ask: "Where does a reviewer look now?" At this one function, and at
  `fill_in_inner`'s documentation.

</details>
