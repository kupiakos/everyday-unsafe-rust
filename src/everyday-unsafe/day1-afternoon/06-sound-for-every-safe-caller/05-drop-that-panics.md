---
minutes: 2
---

# A `Drop` That Panics

- `T`'s `Drop` runs inside `clear_bad`.
- It panics before `set_len(0)`.
- Unwinding drops `"a"` a second time.

```rust,no_run
/// Drops every element of `v`, keeping its buffer.
pub fn clear_bad<T>(v: &mut Vec<T>) {
    for x in v.iter_mut() {
        // SAFETY: `x` is a live `T`, and `set_len(0)` below stops anyone
        // from dropping it again.
        unsafe { std::ptr::drop_in_place(x) }
    }
    // SAFETY: `0 <= capacity()`, and there are no elements in `0..0`.
    unsafe { v.set_len(0) }
}

struct Bomb(String);

impl Drop for Bomb {
    fn drop(&mut self) {
        if self.0 == "boom" {
            panic!("surprise");
        }
    }
}

fn main() {
    let mut v = vec![Bomb("a".into()), Bomb("boom".into())];
    // Dropping "boom" panics before `set_len(0)` runs. `v` still has length 2,
    // so unwinding drops "a" a second time: a double free.
    clear_bad(&mut v);
}
```

<details>

- **Answer:** a panicking `Drop` stops `set_len(0)` from running, so unwinding
  drops earlier elements twice, then the takeaway: set the length first, because
  leaking is safe.

- Answer to the last slide's question.
- `T` is the caller's code. Its `Drop` runs in the middle of your function,
  and can do anything safe code can, including panic.
- The second `SAFETY:` comment is fine. The first one assumed `set_len(0)`
  always runs.
- Fix: call `v.set_len(0)` first. A panic then leaks the remaining elements,
  and leaking is safe. `Vec::truncate` and `Vec::clear` set the length first,
  for this reason.
- Zero-sized types break code that divides by `size_of::<T>()` or expects a
  pointer to move after `add(1)`. Day 2's Pointers in Full covers them.

</details>
