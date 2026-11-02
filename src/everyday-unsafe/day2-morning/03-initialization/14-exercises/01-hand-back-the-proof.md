---
minutes: 10
---

# Exercise: Hand Back the Proof

- Fill in `init_filter`: write every field in place.
- Don't zero `coeffs` first, and don't make a `&mut` to uninitialized memory.
- One `SAFETY:` comment per `unsafe` block.

```rust,editable
#![allow(unused_variables)]
use std::mem::MaybeUninit;

const TAPS: usize = 4000;

pub struct Filter {
    gain: f32,
    coeffs: [f32; TAPS],
}

/// Initializes `slot` in place. Coefficient `i` is `(i as f32 * 0.001).sin()`.
pub fn init_filter(slot: &mut MaybeUninit<Filter>, gain: f32) -> &mut Filter {
    let p: *mut Filter = slot.as_mut_ptr();
    todo!()
}

fn main() {
    let mut slot = MaybeUninit::uninit();
    let f: &mut Filter = init_filter(&mut slot, 0.5); // No `unsafe` here.
    println!("{} {}", f.gain, f.coeffs[TAPS - 1]);
}
```

<details>

- **Goal:** initializing in place without a `&mut` to uninitialized memory, with
  a last `SAFETY:` comment that lists every field.

- Hints:
  - Hint: it's the slides' `Foo`, scaled up to the DSP table from the start of
    the section.
  - If they call `slot.assume_init_mut()` first: what type does it return, and
    is the memory initialized yet?
  - If they write `&mut (*p).coeffs`: is that a reference? How do you get a
    pointer to a field without one?
  - Hint for the last `SAFETY:` comment: which fields must be written before
    `assume_init_mut`? Check each one.
  - `slot.write(Filter { gain, coeffs: [0.0; TAPS] })` is sound, but it's the
    zeroing we wanted to skip.

</details>
