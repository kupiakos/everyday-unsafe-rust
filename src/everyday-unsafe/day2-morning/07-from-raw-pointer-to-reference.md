---
minutes: 5
---

# From Raw Pointer to Reference

Convertibility to a reference:

- Aligned
- Dereferencable (non-null, in one allocation).

- A reference makes every pointer promise, from creation on.
- Plus: aliasing, mutability, and a lifetime.

|              | `*const T`, `*mut T`  | `&T`, `&mut T`                        |
| ------------ | --------------------- | ------------------------------------- |
| Pointer list | Needed only when used | Always, from creation                 |
| Aliasing     | No rule               | `&mut T`: nothing else accesses it    |
| Mutation     | Any                   | None behind `&T`, except `UnsafeCell` |
| Lifetime     | None                  | Must stay valid for it                |

<details>

- **Goal:** students can say what turning a raw pointer into `&T` or `&mut T` promises: validity from creation, no aliasing with `&mut`, and no mutation behind `&` except through `UnsafeCell`. **Arc:** a reference makes every pointer promise, and more → `void* user_data`: list the promises → what that line promises → `offsetof`: sound? → valid at creation → aliasing → the plugin calls back → mutability → `Cell`/`RefCell` → `UnsafeCell` → exercises.

- "Pointer list" is the Pointers in Full checklist: non-null, live, aligned,
  initialized, in bounds.
- A raw pointer may be invalid while nobody uses it. A reference may not, even
  for a moment.
- A raw pointer promises nothing at all, until you use it.
- Ask: "Which C feature is closest to the aliasing row?" Expected: `restrict`.
  Aliasing, two slides ahead, makes the comparison.
- The next slide puts all of this in one line of FFI code.

</details>
