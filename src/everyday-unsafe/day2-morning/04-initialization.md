---
minutes: 3
---

# Initialization

- A filter needs 4,000 coefficients.
- A loop computes each one.
- Zeroing them first is wasted work.
- How would you skip it in C? In Rust?

```rust,editable
const TAPS: usize = 4000;

pub struct Table {
    coeffs: [f32; TAPS],
}

// Safe, but writes every coefficient twice: once as 0.0, once for real.
pub fn make_table() -> Box<Table> {
    let mut t = Box::new(Table { coeffs: [0.0; TAPS] });
    for (i, c) in t.coeffs.iter_mut().enumerate() {
        *c = (i as f32 * 0.001).sin();
    }
    t
}
```

<details>

- **Goal:** students initialize memory in stages with `MaybeUninit`, call
  `assume_init` only when done, and give APIs the shape that hands back the
  proof. **Arc:** skip zeroing 4,000 coefficients → uninit isn't "some value" →
  padding → `MaybeUninit` → write it twice → assignment vs `write` → fair,
  better, best API shapes → two bodies → wrap the fragile API → exercise.

- A DSP filter table. The rest of this section builds the Rust answer, from the
  C-shaped API to the best one.
- Ask: "How would you skip the zeroing in C?" `malloc`, then the loop, and
  nothing stops a read before the loop finishes.
  [Uninitialized Isn't "Some Value"](04-initialization/01-uninit-reads.md) opens
  with this.
- The usual wrong answer in Rust:
  [`mem::uninitialized()`](https://doc.rust-lang.org/std/mem/fn.uninitialized.html).
  It's deprecated, and UB for almost every type, including `f32`.
- Be honest about the cost: zeroing 16 KB is cheap. The pattern matters for big
  or hot buffers, and for C APIs that fill memory you hand them.

</details>
