---
minutes: 3
---

# A Long List

- `slice::from_raw_parts` has five requirements.
- Don't memorize them. Answer them one by one.

| # | `std::slice::from_raw_parts(data, len)` requires                             |
| - | ---------------------------------------------------------------------------- |
| 1 | `data` is non-null and aligned, even if `len == 0`                           |
| 2 | `data` is valid for reads of `len * size_of::<T>()` bytes, in one allocation |
| 3 | `data` points to `len` initialized values of type `T`                        |
| 4 | The memory isn't mutated for `'a` (except inside an `UnsafeCell`)            |
| 5 | `len * size_of::<T>()` is at most `isize::MAX`, with no address wraparound   |

<details>

- **Point:** `from_raw_parts` has five preconditions. Don't memorize them;
  answer them one by one (non-null applies even for `len == 0`).

- This is a summary of the `std` docs. Open the real page and compare.
- Bullet 1 surprises C programmers: a null pointer is not OK even for an empty
  slice. Keep that in mind for the next section.
- Bullet 4 has a clock again: "for `'a`", the lifetime the caller picks.
- The next section writes a `SAFETY:` comment that answers each row.

</details>
