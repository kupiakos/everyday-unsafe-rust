---
minutes: 1
---

# `transmute` Reinterprets Bit Patterns

- `transmute` keeps the bits and changes the type.
- The compiler believes the new type.
- It checks sizes. Validity is on you.
- `bool` is either 0 or 1. What does the last line print?

<!-- mdbook-xgettext: skip -->

```bob
 "transmute: same bytes, new type"

 "[u8; 4]"                          "u32"
+------+------+------+------+      +------+------+------+------+
| 0x01 | 0x00 | 0x00 | 0x00 | ---> | 0x01 | 0x00 | 0x00 | 0x00 |  "= 1"
+------+------+------+------+      +------+------+------+------+

 "u8"            "bool"
+------+        +------+
| 0x39 | -----> | 0x39 |  "= ?"
+------+        +------+
```

```rust
use std::mem::transmute;

fn main() {
    let bytes: [u8; 4] = [1, 0, 0, 0];
    // SAFETY: Same size, and every bit pattern is a valid `u32`.
    let n: u32 = unsafe { transmute(bytes) };
    println!("{n}"); // 1 on little-endian targets.

    let byte: u8 = 57;
    // SAFETY: Same size: a `bool` is one byte.
    let b: bool = unsafe { transmute(byte) };
    println!("{b}");
}
```

<details>

- **Question:** students predict what printing 57 `transmute`d to `bool` shows (anything: it's UB). The answer is on the next slide.

- Dmytro's picture: `transmute` takes a bit pattern and a destination type and
  smushes one into the other.
- Ask: "What does the last line print?" Collect guesses before the next slide.
- Expected answer: anything. 57 isn't a valid `bool`, so the `transmute` is
  UB, and the program has no meaning after it.
- Usual wrong answer: `true`, from C, where `(bool)57` converts the value.
- The second `SAFETY:` comment only repeats what `transmute` already checks.

</details>
