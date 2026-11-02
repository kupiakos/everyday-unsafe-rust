---
minutes: 3
---

# Better: Safe to Call

**OK**: `fn(&mut MaybeUninit<Foo>)`. Safe to call, `unsafe` to get an init `Foo`. The API user must trust the implementation.

```rust
fn fill_in(val: &mut MaybeUninit<Foo>) { /* ... */ }

let mut x: MaybeUninit<Foo> = MaybeUninit::uninit();
fill_in(&mut x);

// SAFETY: `fill_in` always initializes its input
let x = x.assume_init_mut();  // or `assume_init` but that moves `x`
```

<details>

- **Point:** `&mut MaybeUninit<Foo>` makes the call safe, but the caller still needs `unsafe` to trust the result.

- There's the OK option which still uses a safe reference as its input, but doesn't give the caller static assurance that the input is fully init.

- One change from the fragile API: `*mut Foo` became `&mut MaybeUninit<Foo>`.
  The type now guarantees a valid place to write, so calling is safe.
- The caller still needs `unsafe` for `assume_init_mut`, and its `SAFETY:`
  comment rests on reading `fill_in`'s body.
- Ask: "What would let the caller drop that `unsafe`?" Next slide.

</details>
