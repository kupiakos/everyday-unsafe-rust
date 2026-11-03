---
minutes: 3
---

# Until Someone Touches It

- Not OK: a caller can pass null.
- Safe code, yet UB.
- Who should fix it?
- Look at what `read_and_double`'s signature promises.

```rust,editable
pub fn read_and_double(x: *mut u32) -> u32 {
    unsafe { *x * 2 }
}

fn main() {
    // "Safe" code, and UB: `read_and_double` reads through a null pointer.
    let n = read_and_double(std::ptr::null_mut());
    println!("{n}");
}
```

<details>

- **Answer:** `read_and_double` is unsound: safe `main` passes null.
  **Question:** who should fix it? The answer is on
  [Green Tests, Unhappy Reviewer](04-green-tests.md).

- Answer to the question on [A Lamp That Works](02-lamp.md): no. The lamp's
  wires are swapped, and this is someone touching it.
- `main` wrote no `unsafe`, and it still caused UB. That breaks the soundness
  property, so `read_and_double` is unsound.
- Ask: who should fix it? Usual wrong answer: `main`, "it shouldn't pass null".
  But the signature said null was fine. Expected answer: `read_and_double`'s
  signature. [Green Tests, Unhappy Reviewer](04-green-tests.md) opens with it.
- Two real fixes: take `&u32` so the compiler checks the caller, or make
  `read_and_double` an `unsafe fn` with a `# Safety` section.
  [Fixing an Unsound Logger](../06-fixing-an-unsound-logger.md) does both.

</details>
