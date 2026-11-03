---
minutes: 1
---

# The Empty Array from C

- C returns `(NULL, 0)` for "no items".
- Is this `SAFETY:` comment true for `(NULL, 0)`?
- Answer `as_slice`'s bullets one by one.

```rust,no_run,editable
# /// # Safety
# ///
# /// The `slice::from_raw_parts` requirements: `data` is non-null and aligned
# /// (even if `len == 0`) and points to `len` initialized `u16`s in one
# /// allocation, nothing mutates them for `'a`, and `len * 2 <= isize::MAX`.
# unsafe fn as_slice<'a>(data: *const u16, len: usize) -> &'a [u16] {
#     unsafe { std::slice::from_raw_parts(data, len) }
# }
# /// Stands in for the C function.
# unsafe fn get_items(len: &mut usize) -> *const u16 {
#     *len = 0;
#     std::ptr::null()
# }
// C: `const uint16_t *get_items(size_t *len);`
//    "Returns NULL and sets *len to 0 if there are no items."
let mut len = 0;
// SAFETY: `len` is a live `usize`, valid for writes.
let ptr = unsafe { get_items(&mut len) };
// SAFETY: `get_items` returns `len` initialized `u16`s that never change.
let items: &[u16] = unsafe { as_slice(ptr, len) };
```

<details>

- **Question:** students find which of `as_slice`'s bullets `(NULL, 0)` breaks:
  non-null, even for `len == 0`. The answer is on
  [Non-Null, Even for Zero](03-non-null-even-for-zero.md).

- `as_slice` is the function from
  [Answer Every Bullet](01-answer-every-bullet.md). Its `# Safety` passes the
  five bullets of
  [`slice::from_raw_parts`](https://doc.rust-lang.org/std/slice/fn.from_raw_parts.html#safety)
  up to its caller.
- Ask: "Which of `as_slice`'s requirements does `(NULL, 0)` break?" Give the
  class a minute.
- Expected answer: non-null. `from_raw_parts` needs a non-null, aligned pointer
  even when `len == 0`.
- The usual wrong answer: "Length zero means nothing is read, so the pointer
  doesn't matter."
- The one-line comment hid the question.
  [Non-Null, Even for Zero](03-non-null-even-for-zero.md) answers it, one line
  per bullet.

</details>
