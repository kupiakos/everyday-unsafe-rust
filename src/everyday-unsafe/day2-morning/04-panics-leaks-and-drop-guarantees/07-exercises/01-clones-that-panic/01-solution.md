
# Solution

- With `n = 5`, the third clone panics, and the `Vec` drops three uninitialized
  slots.
- Fix: bump the length after each write.

```rust,editable
use std::sync::atomic::{AtomicU32, Ordering};

/// Appends `n` clones of `value` to `v`.
pub fn extend_n<T: Clone>(v: &mut Vec<T>, value: &T, n: usize) {
    v.reserve(n);
    for _ in 0..n {
        let len = v.len();
        // SAFETY: `len < capacity` because of `reserve(n)`, so slot `len` is
        // valid for writes. If `clone` panics, nothing was written.
        unsafe { v.as_mut_ptr().add(len).write(value.clone()) };
        // SAFETY: Slot `len` was just initialized, and `len + 1 <= capacity`.
        unsafe { v.set_len(len + 1) };
    }
}

static CLONES: AtomicU32 = AtomicU32::new(0);

#[derive(Debug)]
struct Fragile(String);

impl Clone for Fragile {
    fn clone(&self) -> Self {
        if CLONES.fetch_add(1, Ordering::Relaxed) == 2 {
            panic!("third clone");
        }
        Fragile(self.0.clone())
    }
}

fn main() {
    let mut v = vec![Fragile("a".to_string())];
    // Still panics. Before the fix, unwinding dropped uninitialized slots.
    // Now it drops "a", "x", "x": the only initialized ones.
    extend_n(&mut v, &Fragile("x".to_string()), 5);
    println!("{v:?}");
}
```

<details>

- **Answer:** `set_len` before the writes lets unwinding drop uninitialized
  slots; bump the length after each write, or use `extend`.

- Unwinding drops all `len + n` slots, but only slots up to the panicking clone
  hold values. The rest are uninitialized, so `Drop` frees garbage pointers.
  - Usual wrong answer: "the `set_len` is fine because we write those slots
    next." The `# Safety` section of `set_len` says the slots must _already_ be
    initialized.
  - Moving `set_len(len + n)` after the loop _is_ a fix: a panic leaks the
    clones. Bumping the length after each write is better.
  - What isn't a fix: requiring a `Clone` that doesn't panic. `Clone` is a safe
    trait.
  - With no `unsafe`: `v.extend(std::iter::repeat_n(value, n).cloned())`.
- This is `std`'s own pattern: `Vec::extend_with` uses a local `SetLenOnDrop`
  guard that bumps the length as it goes.
- The `SAFETY:` comment on the line before the panic point should say what state
  a panic leaves behind.

</details>
