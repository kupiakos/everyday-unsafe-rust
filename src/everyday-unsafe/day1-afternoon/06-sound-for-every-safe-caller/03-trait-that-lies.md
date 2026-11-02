---
minutes: 3
---

# A Trait That Lies

- Safe traits can be implemented wrong.
- Unsafe code can't trust them for memory safety.

```rust,no_run
/// UNSOUND: trusts a caller-provided `ExactSizeIterator::len`.
pub fn collect_bad<T>(iter: impl ExactSizeIterator<Item = T>) -> Vec<T> {
    let n = iter.len();
    let mut v: Vec<T> = Vec::with_capacity(n);
    let p = v.as_mut_ptr();
    for (i, item) in iter.enumerate() {
        unsafe { p.add(i).write(item) } // Writes past the capacity if `len()` lied.
    }
    unsafe { v.set_len(n) } // Exposes uninitialized `T`s if `len()` lied.
    v
}

/// Safe code that lies.
struct Liar(u32);

impl Iterator for Liar {
    type Item = u32;

    fn next(&mut self) -> Option<u32> {
        self.0 += 1;
        (self.0 <= 10).then_some(self.0)
    }
}

impl ExactSizeIterator for Liar {
    fn len(&self) -> usize {
        1
    }
}

fn main() {
    let _v = collect_bad(Liar(0)); // UB, with only safe code at the call site.
}
```

<details>

- **Point:** unsafe code can't trust a safe trait like `ExactSizeIterator` for
  memory safety. A lying `len()` is a logic bug in the impl, but the UB, and the
  fault, is in `collect_bad`.

- This is the morning's `Eq` that lies, with an iterator. `ExactSizeIterator`
  is a safe trait, so a wrong `len()` is a logic bug in `Liar`, not UB.
- The UB happens in `collect_bad`, so the fault is in `collect_bad`.
- `Liar` claims 1 item and yields 10. `collect_bad` only asked for room for 1,
  so it writes past the end of its buffer.
- Fixes: use `Vec::push` (it checks capacity), or count the items actually
  written and stop at `n`. A trait that unsafe code may trust has to be an
  `unsafe trait`, like `Size32` this morning.

</details>
