---
minutes: 3
---

# Implementing APIs Using `MaybeUninit`

## Implementing APIs using `MaybeUninit`

Two common implementations of deferred initialization.

```rust,editable
struct Foo {
    x: u8,
    y: u16,
}
```

**Initialize elementwise**. Usually the point of deferred init. Requires
internal `unsafe`.

<!-- Claude Draft: the two field-pointer `SAFETY:` comments (`x` and `y`) in the block below replace her `// SAFETY: TODO`s. -->

```rust
# use std::{mem::MaybeUninit, ptr};
# struct Foo { x: u8, y: u16 }
fn fill_in(val: &mut MaybeUninit<Foo>) -> &mut Foo {
    let p = val.as_mut_ptr();

    // SAFETY:
    // - `(*p).x` is in bounds: `p` is from `val`, a live
    //   `&mut MaybeUninit<Foo>`, so it points to all of a `Foo`'s bytes, and
    //   field `x` lies inside them.
    // - `addr_of_mut!` doesn't read the uninitialized `x` or make a `&mut u8`.
    // - So `x` is valid for aligned writes of a `u8`.
    let x = unsafe { ptr::addr_of_mut!((*p).x) };
    // SAFETY:
    // - `(*p).y` is in bounds, and isn't read, for the same reasons as `x`.
    // - So `y` is valid for aligned writes of a `u16`, and doesn't overlap `x`.
    let y = unsafe { ptr::addr_of_mut!((*p).y) };

    // SAFETY:
    // - `x` and `y` are both valid for aligned writes.
    // - We initialize all fields of `Foo`, letting us treat it as init.
    unsafe {
        *x = 10;
        *y = 20;
        val.assume_init_mut()
    }
}
# let mut v = MaybeUninit::uninit();
# let foo = fill_in(&mut v);
# assert_eq!((foo.x, foo.y), (10, 20));
```

<details>

- **Point:** initializing field by field takes `unsafe`, raw field pointers, and
  a `SAFETY:` comment that lists every field.

- Field by field: `&raw mut (*p).x` is the newer spelling of `addr_of_mut!`.
  Either one makes a field pointer without making a `&mut Foo` to uninitialized
  memory.
- `*x = 10` is fine here only because `u8` has no drop glue. For a `String`
  field, use `x.write(...)`, as in
  [Assignment vs `write`](06-assign-vs-write.md).
- Forget one field, and `assume_init_mut` is UB. The `SAFETY:` comment is where
  you list every field.

</details>
