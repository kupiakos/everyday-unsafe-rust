---
minutes: 2
---

# Any Output Is Possible

- 57 isn't a valid `bool`: UB at the `transmute`.
- After UB, the program has no meaning.
- C's `(bool)57` converts. `transmute` only relabels.

```rust,editable
fn main() {
    let bytes: [u8; 4] = [1, 0, 0, 0];
    let n = u32::from_ne_bytes(bytes); // Same as the `transmute`, safe.
    let byte: u8 = 57;
    let b = byte != 0; // C's meaning of `(bool)57`, safe.
    println!("{n} {b}");
}
```

<details>

- **Answer:** anything, because the `transmute` itself is UB, then use safe
  conversions (`from_ne_bytes`, `!= 0`) instead.

- Answer to the question on
  [`transmute` Reinterprets Bit Patterns](02-transmute.md): anything at all.
  `true`, `false`, something that's neither, or a crash.
- The second `SAFETY:` comment only said the sizes match, which `transmute`
  checks for you. A true one would have to say 57 is a valid `bool`, and it
  isn't.
- Prefer safe conversions: `u32::from_ne_bytes(bytes)`, and `byte != 0` for a
  `bool`.

</details>
