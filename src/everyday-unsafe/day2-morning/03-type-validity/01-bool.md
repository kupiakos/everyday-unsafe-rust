---
minutes: 3
---

# A Byte Labeled `bool`

- One byte, but only `0` and `1` are valid.

- It's
  [**immediate undefined behavior**](https://doc.rust-lang.org/reference/behavior-considered-undefined.html#invalid-values)
  to produce a value of `T` with an invalid bit pattern.

<!-- mdbook-xgettext: skip -->

```bob
 "b: bool"
+------+
| 0x00 |  "false"
+------+
| 0x01 |  "true"
+------+
| 0x39 |  "57: not a bool. UB the moment it exists."
+------+
```

<details>

- **Point:** `bool` allows only 0 and 1, and an invalid value is UB the moment
  it exists, not when it's used.

- Undefined Behavior to produce invalid `T`.

- `bool` takes a whole byte, but 254 of its 256 bit patterns are invalid.
- Ask: "When does 57-as-a-`bool` become a problem?" The usual wrong answer:
  "when you branch on it." It's UB as soon as the value exists, because the
  compiler may rely on "0 or 1" anywhere, for example to index a two-entry
  table.
- No runtime check can test whether a `bool` is valid: by the time you have one,
  the compiler already assumes it is.

</details>
