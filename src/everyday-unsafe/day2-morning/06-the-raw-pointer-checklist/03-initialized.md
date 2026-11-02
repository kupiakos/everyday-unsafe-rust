---
minutes: 3
---

# Initialized

- "Valid for reads" needs initialized memory.
- "Valid for writes" doesn't.
- On uninitialized memory, `write`, not `=`.

```rust
use std::mem::MaybeUninit;

fn main() {
    let mut s = MaybeUninit::<String>::uninit();
    let sp: *mut String = s.as_mut_ptr();
    // let n = unsafe { (*sp).len() }; // UB: `*sp` isn't initialized yet.
    // unsafe { *sp = String::from("hi") }; // UB: drops the uninitialized old value.
    // SAFETY: `sp` is valid for an aligned write of one `String`.
    unsafe { sp.write(String::from("hi")) }; // Writes without dropping.
    // SAFETY: `s` was initialized by the `write` above.
    let s = unsafe { s.assume_init() };
    println!("{s}");
}
```

<details>

- **Point:** "valid for reads" needs initialized memory and "valid for writes" doesn't, so use `write` on uninitialized memory.

- The Initialization lifecycle, applied to what a pointer points at.
- A pointer can be valid for writes and not for reads at the same moment, like
  `sp` before the `write`.
- `*sp = ...` drops the old `String` first, so it needs initialized memory,
  just like a read.
- When a `# Safety` section says "valid for reads", "initialized" is on the
  list.

</details>
