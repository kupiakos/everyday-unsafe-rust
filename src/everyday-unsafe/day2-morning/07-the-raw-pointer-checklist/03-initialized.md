---
minutes: 3
---

# Initialized

- A read needs initialized memory. "Valid for reads" doesn't promise it.
- A write doesn't need it.
- On uninitialized memory, `write`, not `=`.

```rust,editable
use std::mem::MaybeUninit;

fn main() {
    let mut s = MaybeUninit::<String>::uninit();
    let sp: *mut String = s.as_mut_ptr();
    // let n = unsafe { (*sp).len() }; // UB: `*sp` isn't initialized yet.
    // unsafe { *sp = String::from("hi") }; // UB: drops the uninitialized old
    // value. SAFETY: `sp` is valid for an aligned write of one `String`.
    unsafe { sp.write(String::from("hi")) }; // Writes without dropping.
    // SAFETY: `s` was initialized by the `write` above.
    let s = unsafe { s.assume_init() };
    println!("{s}");
}
```

<details>

- **Point:** a read needs initialized memory and a write doesn't, so use `write`
  on uninitialized memory.

- The lifecycle from [Initialization](../04-initialization.md), applied to what
  a pointer points at.
- A pointer can be valid for writes and not for reads at the same moment, like
  `sp` before the `write`.
- `*sp = ...` drops the old `String` first, so it needs initialized memory, just
  like a read.
- "Valid for reads" doesn't include "initialized", so a `# Safety` section lists
  it separately:
  [`ptr::read`'s `# Safety`](https://doc.rust-lang.org/std/ptr/fn.read.html#safety)
  has "valid for reads" and "properly initialized" as separate bullets. See
  [Shorthands for "Valid"](../10-picking-the-lifetime-of-a-raw-borrow/06-shorthands.md).

</details>
