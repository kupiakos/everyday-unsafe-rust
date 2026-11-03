---
minutes: 5
---

# Reading a `# Safety` Section

- Every `unsafe fn` in `std` has `# Safety`.
- It lists what the caller must ensure.
- Running example:
  [`Vec::set_len`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.set_len).

<!-- mdbook-xgettext: skip -->

```bob
+----------------------------------------------+
| unsafe fn set_len(&mut self, new_len: usize) |
|                                              |
| Forces the length of the vector to new_len.  |
|                                              |
| # Safety              <-- the contract       |
|   - ...                                      |
|   - ...                                      |
|                                              |
| # Examples                                   |
+----------------------------------------------+
```

<details>

- **Goal:** students read an `unsafe fn`'s `# Safety` section bullet by bullet,
  including _when_ each bullet must hold. **Arc:** `set_len`'s two bullets → a
  `read()` buffer breaks one → two fixes → `as_bytes_mut`'s bullet with a clock
  → `from_raw_parts`'s five bullets → exercise.

- Open the
  [`Vec::set_len` docs](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.set_len)
  live. Scroll to the `# Safety` heading.
- The section is written for you, the caller. If you call the function, you
  promise everything in it.
- This is the first half of the core loop: find the contract before you write
  `unsafe`.
- Ask: "Where would you look for this in a C library?" Usually a header comment,
  if you're lucky.

</details>
