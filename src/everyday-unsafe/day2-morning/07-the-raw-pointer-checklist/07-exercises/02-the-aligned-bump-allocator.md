---
minutes: 10
---

# Exercise: The Aligned Bump Allocator

- Find the two pointer computations that can leave the arena before the check.
- Write calls to `alloc` that hit each one.
- Rewrite `alloc` to check first, with `usize` arithmetic.

```rust,editable
pub struct Arena {
    // Safety invariant: `next` and `end` point into (or one past the end of)
    // the same live allocation, and `next <= end`.
    next: *mut u8,
    end: *mut u8,
}

impl Arena {
    pub fn new(buf: &'static mut [u8]) -> Self {
        let r = buf.as_mut_ptr_range();
        Arena { next: r.start, end: r.end }
    }

    /// Returns `size` bytes aligned to `align`, or `None` if the arena is
    /// full. Panics if `align` isn't a power of two.
    pub fn alloc(&mut self, size: usize, align: usize) -> Option<*mut u8> {
        // SAFETY: The padding is less than `align`.
        let start = unsafe { self.next.add(self.next.align_offset(align)) };
        // SAFETY: Checked right below.
        let new_next = unsafe { start.add(size) };
        if new_next > self.end {
            return None;
        }
        self.next = new_next;
        Some(start)
    }
}

fn main() {
    let mut arena = Arena::new(Box::leak(Box::new([0u8; 64])));
    println!("{:?}", arena.alloc(16, 8));
    // Your calls here.
}
```

<details>

- **Goal:** check sizes in `usize` before computing a pointer, since an
  out-of-bounds `add` is UB before any check runs.

- Hints:
  - Bigger hint: the padding `add` fails for a big `align` when the arena is
    nearly full, for example `alloc(60, 1)` then `alloc(1, 4096)`. The `size`
    `add` fails for any big `size`.
  - If they say "the `if` catches it": what may the compiler assume about the
    result of `add`?
  - Hint: read the docs of
    [`align_offset`](https://doc.rust-lang.org/std/primitive.pointer.html#method.align_offset).
    What may it return?
  - If they switch both computations to `wrapping_add` and keep the `if`: what
    does a huge `size` do?

</details>
