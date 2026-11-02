---
minutes: 5
---

# Type Validity

- Types have *valid bit patterns*: representations in memory.

- A `u32` is 4 bytes.
- Every one of its bit patterns is a valid `u32`.

<!-- mdbook-xgettext: skip -->

```bob
 "x: u32"
+------+------+------+------+
| 0x00 | 0x39 | 0xFF | 0x07 |
+------+------+------+------+
 "any byte values: still a valid u32"
```

<details>

- **Goal:** students can say which values a type allows, and know that producing an invalid value is UB right away. **Arc:** a `u32` takes any bytes → a `bool` doesn't → `transmute` relabels bytes → any output → niches → wire protocol: who's at fault? → `TryFrom` fix → exercises.

- Every type has a set of *valid bit patterns*.
- These are the allowed representations of objects of that type in memory.
- NOT the same thing as validity for pointer reads or writes.

- Start from afar, as Dmytro suggested: four bytes in memory, any values. Read
  as a `u32`, it's always some number.
- Ask: "Which `u32` bit patterns are invalid?" None.
- Next slide: a type where that isn't true.

</details>
