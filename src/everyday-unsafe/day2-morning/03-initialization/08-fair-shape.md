---
minutes: 3
---

# Fair: Takes a Raw Pointer

**Fair** (and common in FFI): `fn(*mut Foo)`. `unsafe` to call, `unsafe` to get
an init `Foo`. The API user must trust the implementation.

```rust
unsafe fn fill_in(val: *mut Foo) { /* ... */ }

let mut x: MaybeUninit<Foo> = MaybeUninit::uninit();
unsafe { fill_in(x.as_mut_ptr()); }

// SAFETY: `fill_in` always initializes its input
let x = x.assume_init_mut();  // or `assume_init` but that moves `x`
```

<details>

- **Point:** a `*mut Foo` API is `unsafe` to call and `unsafe` to trust
  afterward: two `unsafe` blocks at every call site.

- Something you'll see often is a function which just takes a mut raw pointer,
  and it doesn't have to be init.

- This is `unsafe fn fill_in(*mut Table)` from the first slide: the shape C
  gives you.
- Unsafe to call: the caller must pass a pointer valid for writes. Unsafe to
  trust afterward: nothing in the type says `fill_in` initialized everything.
- Ask: "How many `unsafe` blocks does each caller need?" Two, at every call
  site.

</details>
