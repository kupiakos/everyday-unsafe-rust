---
minutes: 3
---

# Struct Layout

- C lays out fields in declaration order.
- Rust may reorder them.
- `#[repr(C)]` uses C's rules.
- Needed for every struct C sees by value.

```rust
#[repr(C)] // Without this, Rust may reorder the fields: no layout is guaranteed.
pub struct Point {
    pub x: f32,
    pub y: f32,
}

unsafe extern "C" {
    // C: `void draw_point(struct Point p);`
    fn draw_point(p: Point);
}
```

<details>

- **Point:** Rust may reorder fields, so every struct C sees by value, or whose
  fields either side reads, needs `#[repr(C)]`. The compiler can't check it
  against C.

- Story: this works with a C graphics library for months. Then someone adds a
  field, and the Rust layout no longer matches the C one. Nothing fails to
  compile.
- The default layout (`repr(Rust)`) guarantees almost nothing about field order
  or padding, and it may change when you add a field or upgrade the compiler.
- Ask: "Does `lp_parser` need `#[repr(C)]`?" Not really: Rust never reads its
  fields. The usual opaque-type pattern has it anyway. Every struct that crosses
  by value, or whose fields either side reads, needs it.
- `lp_record` from the header will need it too: we read its seven fields in the
  next section.

</details>
