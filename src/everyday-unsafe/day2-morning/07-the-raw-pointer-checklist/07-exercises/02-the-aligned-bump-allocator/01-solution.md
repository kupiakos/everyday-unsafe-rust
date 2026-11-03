
# Solution

- Both `add`s can leave the arena: the padding, and the size.
- Check `pad + size` against the free space in `usize`, then `add`.

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
        let free = self.end.addr() - self.next.addr(); // `next <= end`.
        let pad = self.next.align_offset(align); // May be `usize::MAX`.
        if pad.checked_add(size)? > free {
            return None;
        }
        // SAFETY: `pad <= free`, so `next + pad` is in the allocation or one
        // past its end, by the invariant on the fields.
        let start = unsafe { self.next.add(pad) };
        // SAFETY: `pad + size <= free`, so the same holds for `start + size`.
        self.next = unsafe { start.add(size) };
        Some(start)
    }
}

fn main() {
    let mut arena = Arena::new(Box::leak(Box::new([0u8; 64])));
    println!("{:?}", arena.alloc(16, 8));
    println!("{:?}", arena.alloc(1000, 8)); // `None`, and no UB.
}
```

<details>

- **Answer:** both `add`s (padding and size) can leave the arena; check
  `pad + size` against the free space first.

- Usual wrong answer: "the `if` catches it." The compiler may assume `add`
  stayed in bounds, so it may assume `new_next <= end` and delete the check.
- `align_offset` may return `usize::MAX` by
  [its docs](https://doc.rust-lang.org/std/primitive.pointer.html#method.align_offset).
  Then `add` is UB even for `size == 0`.
- What isn't a fix: `wrapping_add` for both computations, then the same `if`.
  The arithmetic is no longer UB, but a huge `size` wraps around, passes the
  check, and hands out memory outside the arena.
- each `add` gets its own `SAFETY:` comment, and each one cites the check and
  the field invariant. That's the shape a reviewer can verify.
- the new `next` keeps the field invariant, so the next call's proof still
  works.

</details>
