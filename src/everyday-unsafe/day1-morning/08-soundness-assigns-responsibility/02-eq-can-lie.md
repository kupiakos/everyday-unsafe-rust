---
minutes: 3
---

# `Eq` Can Lie

- `Eq` promises `x == x`.
- A safe trait: anyone can break that promise.
- Can a lying `eq` make `find` read out of bounds?

```rust
pub fn find<T: Eq>(haystack: &[T], needle: &T) -> Option<usize> {
    let mut i = 0;
    while i < haystack.len() {
        // SAFETY: `i < haystack.len()`, by the loop condition.
        if unsafe { haystack.get_unchecked(i) } == needle {
            return Some(i);
        }
        i += 1;
    }
    None
}

pub struct Liar;

impl PartialEq for Liar {
    fn eq(&self, _: &Liar) -> bool {
        false // Breaks `Eq`'s promise that `x == x`.
    }
}

impl Eq for Liar {}
```

<details>

- **Question:** students work out whether a lying `Eq` impl can make `find` read
  out of bounds (no: its `SAFETY:` comment relies only on the loop condition).
  The answer is on the next slide.

- Story 1.8. A caller's `eq` can return anything. `find` may give a wrong
  answer, and that's the caller's logic bug.
- But `find` must still be memory-safe. Ask: can a lying `eq` make it read out
  of bounds? Usual wrong answer: "yes, `find` trusts `==`". Expected answer: no.
  The `SAFETY:` comment only relies on the loop condition, not on what `==`
  returns. The next slide opens with that.
- The standard library docs say this: a logic error in these traits must not
  result in undefined behavior, so `unsafe` code must not rely on their
  correctness.
- This is the hostile safe caller: safe code can lie in a trait impl.

</details>
