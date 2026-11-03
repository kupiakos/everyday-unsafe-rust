---
minutes: 3
---

# `Send`, `Sync`, and Data Races

- [`T: Send`](https://doc.rust-lang.org/std/marker/trait.Send.html): a `T` may
  move to another thread.
- [`T: Sync`](https://doc.rust-lang.org/std/marker/trait.Sync.html): a `&T` may
  be shared between threads.
- The compiler derives both from a type's fields.

```rust,editable
use std::cell::Cell;
use std::rc::Rc;
use std::sync::Arc;

fn assert_send<T: Send>() {}
fn assert_sync<T: Sync>() {}

fn main() {
    assert_send::<Vec<u8>>();
    assert_sync::<Arc<u8>>();
    assert_send::<Cell<u8>>(); // `Send`, but not `Sync`.
    // assert_sync::<Cell<u8>>(); // Error: `Cell<u8>` isn't `Sync`.
    // assert_send::<Rc<u8>>(); // Error: `Rc<u8>` is neither.
}
```

<details>

- **Goal:** students can say what `Send` and `Sync` promise, and that an
  `unsafe impl` must hold for every method and every `T`. **Arc:** `Send` and
  `Sync` → C++ thread-safety words → raw pointers opt out → both `unsafe impl`s
  compile: which is true? → only `Send` → an `unsafe impl` for every `T`: which
  `T` breaks it? → add the bound → the logger with threads → atomics → exercise.

- Threads appear for the first time in the course. "Who else may access?" now
  includes other threads.
- `T: Sync` means
  [exactly that `&T: Send`](https://doc.rust-lang.org/std/marker/trait.Sync.html).
- Both are
  [auto traits](https://doc.rust-lang.org/reference/special-types-and-traits.html#auto-traits):
  a struct is `Send` if all its fields are, and the same for `Sync`. You opt in
  by hand only with `unsafe impl`.
- `Cell` is the tool from
  [`Cell` and `RefCell`](08-from-raw-pointer-to-reference/06-mutability/01-cell-refcell.md):
  fine to move to another thread, not fine to share, because two threads could
  `set` at once.

</details>
