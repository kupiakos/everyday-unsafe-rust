
# Solution

- Project to each field with `&raw mut`, and `write` each value.
- Call `assume_init_mut` once, after the last write.
- The caller needs no `unsafe`.

```rust,editable
use std::mem::MaybeUninit;

const TAPS: usize = 4000;

pub struct Filter {
    gain: f32,
    coeffs: [f32; TAPS],
}

/// Initializes `slot` in place. Coefficient `i` is `(i as f32 * 0.001).sin()`.
pub fn init_filter(slot: &mut MaybeUninit<Filter>, gain: f32) -> &mut Filter {
    let p: *mut Filter = slot.as_mut_ptr();
    // SAFETY: `p` points to `slot`, so both field projections stay inside it.
    // `&raw mut` creates no reference to the uninitialized fields.
    let (g, c) = unsafe { (&raw mut (*p).gain, (&raw mut (*p).coeffs).cast::<f32>()) };
    // SAFETY: `g` is valid for an aligned write of one `f32`.
    unsafe { g.write(gain) };
    for i in 0..TAPS {
        // SAFETY: `i < TAPS`, so `c.add(i)` is an aligned `f32` slot inside
        // `coeffs`.
        unsafe { c.add(i).write((i as f32 * 0.001).sin()) };
    }
    // SAFETY: `gain` and all `TAPS` coefficients are written above, so every
    // field of `Filter` is initialized.
    unsafe { slot.assume_init_mut() }
}

fn main() {
    let mut slot = MaybeUninit::uninit();
    let f: &mut Filter = init_filter(&mut slot, 0.5);
    println!("{} {}", f.gain, f.coeffs[TAPS - 1]);
}
```

<details>

- **Answer:** `&raw mut` to each field, `write` every value, then `assume_init_mut` once at the end.

- Usual wrong answer: `slot.assume_init_mut()` first, then fill in the
  fields. That's a `&mut Filter` to uninitialized memory.
- Another: `&mut (*p).coeffs`. Same problem: use `&raw mut`.
- Another: forgetting `gain`. Then `assume_init_mut` is UB, and the
  `SAFETY:` comment is where a reviewer should notice.
- the last `SAFETY:` comment lists every field. Ask: "What has to
  change here if someone adds a field to `Filter`?" That's the comment that
  goes stale.
- if `sin` could panic halfway, nothing leaks or double-drops here,
  because `f32` has no drop glue. For a `String` field, that's the next
  section.

</details>
