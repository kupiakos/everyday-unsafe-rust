---
minutes: 1
---

# Calling the LZO Function

- The LZO function from this morning.
- Its `# Safety` is precise: who, what, until when.
- Write the `SAFETY:` comment for this call.

```rust
/// # Safety
///
/// The caller must ensure that `dst` is valid for writes of at least as many
/// bytes as `src` decompresses to.
pub unsafe fn decompress_unchecked(src: &[u8], dst: *mut u8) -> usize {
    todo!()
}

pub fn load(src: &[u8]) -> Vec<u8> {
    let mut dst = vec![0; 4096];
    // SAFETY: ?
    let n = unsafe { decompress_unchecked(src, dst.as_mut_ptr()) };
    dst.truncate(n);
    dst
}
```

<details>

- **Question:** students try to write the `SAFETY:` comment and find that
  nothing in `load` can show `dst` is big enough. The answer is on the next
  slide.

- Ask: "What evidence would your `SAFETY:` comment point at?" Give the class a
  minute to try.
- Expected answer: nothing in `load` can show it. The caller would need the
  decompressed size, and nothing in the arguments tells them.
- Usual wrong answers: "4096 is enough for our data." That's a guess, not
  evidence. "The data comes from us." A file is input, not a contract.
- The next slide says why this is a design problem.

</details>
