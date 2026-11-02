---
minutes: 3
---

# Implementing APIs Using `MaybeUninit`

## Implementing APIs using `MaybeUninit`

Two common implementations of deferred initialization.

```rust
struct Foo {
    x: u8,
    y: u16,
}
```

**Initialize elementwise**. Usually the point of deferred init. Requires internal `unsafe`.

```rust
fn fill_in(val: &mut MaybeUninit<Foo>) -> &mut Foo {
    let p = val.as_mut_ptr();

    // needs `unsafe` and `SAFETY`
    let x = ptr::addr_of_mut!((*p).x);
    let y = ptr::addr_of_mut!((*p).y);

    // SAFETY:
    // - `x` and `y` are both valid for aligned writes.
    // - We initialize all fields of `Foo`, letting us treat it as init.
    unsafe {
        *x = 10;
        *y = 20;
        val.assume_init_mut()
    }
}
```

<details>

- **Point:** initializing field by field takes `unsafe`, raw field pointers, and a `SAFETY:` comment that lists every field.

- Field by field: `&raw mut (*p).x` is the newer spelling of `addr_of_mut!`.
  Either one makes a field pointer without making a `&mut Foo` to uninitialized
  memory.
- `*x = 10` is fine here only because `u8` has no drop glue. For a `String`
  field, use `x.write(...)`, as in Assignment vs `write`.
- Forget one field, and `assume_init_mut` is UB. The `SAFETY:` comment is where
  you list every field.

</details>
