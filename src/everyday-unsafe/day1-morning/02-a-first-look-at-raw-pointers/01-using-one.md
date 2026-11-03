---
minutes: 3
---

# Dereferencing Needs `unsafe`

- A raw pointer is just a value until you use it.
- Reading through it needs an `unsafe` block.
- The pointer must be
  ["valid for reads"](https://doc.rust-lang.org/std/ptr/index.html#safety).
- For today: points at a live value.
- ... of the right type.

```rust,editable
fn main() {
    let x = 42;
    let p = &x as *const i32;
    // let y = *p; // Error: dereference of raw pointer is unsafe.
    // SAFETY: `p` points at `x`, a live `i32`.
    let y = unsafe { *p };
    println!("{y}");
}
```

<details>

- **Answer:** making a pointer reads nothing, so it's safe even when null, then
  the takeaway: the precondition ("valid for reads") applies at the dereference,
  inside `unsafe`.

- Answer to the question on
  [A First Look at Raw Pointers](../02-a-first-look-at-raw-pointers.md): making
  a pointer reads nothing, so there's nothing to go wrong yet.
- Uncomment the first line to show the compile error.
- The same requirement is written down in
  [`ptr::read`'s `# Safety` section](https://doc.rust-lang.org/std/ptr/fn.read.html#safety):
  "`src` must be valid for reads".
- The `SAFETY:` comment says why the requirement holds at this line.
- In [Fixing an Unsound Logger](../06-fixing-an-unsound-logger.md), the logger
  gets this wrong: `Handler::new` dereferences a raw pointer it can't vouch for.
  Making the pointer is never the problem.

</details>
