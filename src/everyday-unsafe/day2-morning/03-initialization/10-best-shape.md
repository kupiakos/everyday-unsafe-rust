---
minutes: 3
---

# Best: Hand Back the Proof

**Best**: `fn(&mut MaybeUninit<Foo>) -> &mut Foo`. The returned ref is the
initialized input. Entirely safe to use.

```rust
fn fill_in(val: &mut MaybeUninit<Foo>) -> &mut Foo { /* ... */ }

let mut x: MaybeUninit<Foo> = MaybeUninit::uninit();
let x = fill_in(&mut x);
```

<details>

- **Point:** returning `&mut Foo` hands back the proof of initialization, so the
  caller needs no `unsafe`.

- The best takes a `MaybeUninit` mut ref and returns a mut ref to the init
  object. No unsafe required!

- One change from the last slide: the return type. A `&mut Foo` can only exist
  if `fill_in` initialized `val`, so the type is the proof.
- The `unsafe`, if any, moves inside `fill_in`, next to the code that does the
  initializing. The next slide shows two ways to write the body.
- Thread: _hand back the proof_. It returns on Day 2 afternoon.

</details>
