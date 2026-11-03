---
minutes: 4
---

# Why UB Exists: `&mut`

Undefined Behavior lets C, C++, and Rust optimize code for efficiency.

Because it's UB for `&mut` to alias with anything else, this function can assume
that `src` and `dst` don't overlap and always do a more efficient copy:

```rust,editable
pub fn add_assign(dst: &mut [u32], src: &[u32]) {
    for (d, s) in dst.iter_mut().zip(src) {
        *d += *s;
    }
}
```

Because it's UB for a reference to be null, `Option<&T>` can take advantage of
that invalid value and
[represent `None` _as_ null](https://doc.rust-lang.org/std/option/index.html#representation):

```rust
# use std::mem;
# type T = u32;
assert!(size_of::<&T>() == size_of::<Option<&T>>());

// Rust defines null as all zeroes.
assert_eq!(
    unsafe { mem::transmute::<Option<&T>, [u8; size_of::<&T>()]>(None) },
    [0u8; size_of::<&T>()]
);
```

<details>

- **Point:** because an aliased `&mut` and a null reference are UB, the compiler
  can assume `dst` and `src` don't overlap, and `Option<&T>` can use null for
  `None`.

- In C, `dst` and `src` might overlap, so the compiler has to allow for a write
  to `dst` changing `src`. In Rust they can't overlap.
- The same rule lets the compiler keep a `&mut`'s value in a register across a
  call to a function that never saw the reference. C++ can't assume that.
- `Option<&T>` costs nothing because a null `&T` is UB. Invalid values are what
  the optimizer gets to use. These are called niches, and come back in
  [Niches](../../day2-morning/03-type-validity/04-niches.md).

</details>
