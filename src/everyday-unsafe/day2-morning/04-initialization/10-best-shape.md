---
minutes: 3
---

# Best: Hand Back the Proof

**Best**: `fn(&mut MaybeUninit<Foo>) -> &mut Foo`. The returned ref is the
initialized input. Entirely safe to use.

```rust,editable
# use std::mem::MaybeUninit;
# struct Foo { x: u8, y: u16 }
# #[cfg(any())] // Swap the stub for a body that Run and Miri can execute.
fn fill_in(val: &mut MaybeUninit<Foo>) -> &mut Foo { /* ... */ }
# fn fill_in(val: &mut MaybeUninit<Foo>) -> &mut Foo { val.write(Foo { x: 10, y: 20 }) }

let mut x: MaybeUninit<Foo> = MaybeUninit::uninit();
let x = fill_in(&mut x);
```

<details>

- **Point:** returning `&mut Foo` hands back the proof of initialization, so the
  caller needs no `unsafe`.

- The best takes a `MaybeUninit` mut ref and returns a mut ref to the init
  object. No unsafe required!

- One change from [Better: Safe to Call](09-ok-shape.md): the return type. A
  `&mut Foo` can only exist if `fill_in` initialized `val`, so the type is the
  proof.
- The `unsafe`, if any, moves inside `fill_in`, next to the code that does the
  initializing.
  [Implementing APIs Using `MaybeUninit`](11-implementing-apis-using-maybeuninit.md)
  and [Initialize the Whole Struct](12-initialize-the-whole-struct.md) show two
  ways to write the body.
- Thread: _hand back the proof_. It returns on
  [Day 2 afternoon](../../day2-afternoon/00-welcome.md).

</details>
