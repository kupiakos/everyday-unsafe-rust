---
minutes: 3
---

# Fair: Takes a Raw Pointer

**Fair** (and common in FFI): `fn(*mut Foo)`. `unsafe` to call, `unsafe` to get
an init `Foo`. The API user must trust the implementation.

```rust
# use std::mem::MaybeUninit;
# struct Foo { x: u8, y: u16 }
# #[cfg(any())] // Swap the stub for a body that Run and Miri can execute.
unsafe fn fill_in(val: *mut Foo) { /* ... */ }
# unsafe fn fill_in(val: *mut Foo) { unsafe { val.write(Foo { x: 10, y: 20 }) } }

let mut x: MaybeUninit<Foo> = MaybeUninit::uninit();
unsafe { fill_in(x.as_mut_ptr()); }

// SAFETY: `fill_in` always initializes its input
let x = unsafe { x.assume_init_mut() };  // or `assume_init` but that moves `x`
```

<details>

- **Point:** a `*mut Foo` API is `unsafe` to call and `unsafe` to trust
  afterward: two `unsafe` blocks at every call site.

- Something you'll see often is a function which just takes a mut raw pointer,
  and it doesn't have to be init.

- `unsafe fn fill_in(*mut Foo)` is the shape C gives you.
- Unsafe to call: the caller must pass a pointer valid for writes. Unsafe to
  trust afterward: nothing in the type says `fill_in` initialized everything.
- Ask: "How many `unsafe` blocks does each caller need?" Two, at every call
  site.

</details>
