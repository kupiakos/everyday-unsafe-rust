---
minutes: 3
---

# How Big Should an `unsafe` Block Be?

- Last slide: the proof rests on `*b -= 32`, a safe line.
- Narrow: just the operation (previous slide).
- Wide: everything the proof depends on.
- Both schools exist. The proof is what matters.

```rust
/// Uppercases the ASCII letters in `s`, in place.
pub fn make_ascii_upper(s: &mut str) {
    // SAFETY: Only turns ASCII bytes into ASCII bytes, so `s` is still valid
    // UTF-8 when the borrow ends.
    unsafe {
        for b in s.as_bytes_mut() {
            if b.is_ascii_lowercase() {
                *b -= 32;
            }
        }
    }
}
```

<details>

- **Answer:** `*b -= 32`, safe code outside the narrow block, then the takeaway:
  narrow or wide is fine, as long as the `SAFETY:` comment names everything the
  proof depends on.

- Wide: a reviewer sees everything the proof relies on inside one block. The
  risk is that a second `unsafe` operation added to the loop later hides under
  the same comment.
- Narrow: each `unsafe` operation gets its own comment. The risk is that the
  safe code the proof relies on sits outside the block, where nobody rereads it.
- Either way, the `SAFETY:` comment must name what it depends on. Clippy's
  `undocumented_unsafe_blocks` and `multiple_unsafe_ops_per_block` lints help a
  team enforce whichever style it picks.
- Ask the class which one they'd rather review. There's no wrong answer, only an
  incomplete proof.

</details>
