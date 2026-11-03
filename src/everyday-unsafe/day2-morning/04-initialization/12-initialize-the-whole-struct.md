---
minutes: 2
---

# Initialize the Whole Struct

**Initialize the whole struct**. Can use safe `MaybeUninit::write`.

```rust,editable
# use std::mem::MaybeUninit;
# struct Foo { x: u8, y: u16 }
fn fill_in(val: &mut MaybeUninit<Foo>) -> &mut Foo {
    val.write(Foo { x: 10, y: 20 })
}
# let mut v = MaybeUninit::uninit();
# let foo = fill_in(&mut v);
# assert_eq!((foo.x, foo.y), (10, 20));
```

<details>

- **Point:** with the whole value at once, safe `MaybeUninit::write` does the
  job, with no `unsafe`.

- Both bodies fit the [Best shape](10-best-shape.md); callers can't tell them
  apart.

- "Both bodies": this one and the field-by-field one on
  [Implementing APIs Using `MaybeUninit`](11-implementing-apis-using-maybeuninit.md).
- No `unsafe` and no `SAFETY:` comment: `write` takes a whole `Foo`, so it can't
  leave a field out.
- Use this when you have the whole value at once. Field by field is for when you
  don't, like the coefficient table.

</details>
