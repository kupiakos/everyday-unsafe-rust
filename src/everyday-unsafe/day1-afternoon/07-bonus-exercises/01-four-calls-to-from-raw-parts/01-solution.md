
# Solution

- 1 breaks bullet 1. 2 is fine.
- 3 breaks bullet 3. 4 breaks bullets 2 and 4.

```rust,editable
use std::slice;

fn main() {
    // 1. Breaks bullet 1. Fix: treat null as "no items".
    let (ptr, len): (*const u32, usize) = (std::ptr::null(), 0);
    let a: &[u32] = if ptr.is_null() {
        &[]
    } else {
        // SAFETY: Non-null: checked. The rest: the C library's contract.
        unsafe { slice::from_raw_parts(ptr, len) }
    };

    // 2. Fine. (A real `SAFETY:` comment answers all five bullets.)
    let v = vec![1, 2, 3];
    let b: &[u32] = unsafe { slice::from_raw_parts(v.as_ptr(), v.len()) };

    // 3. Breaks bullet 3. Fix: `len()`, not `capacity()`.
    let mut w: Vec<u32> = Vec::with_capacity(8);
    w.push(1);
    let c: &[u32] = &w[..];

    // 4. Breaks bullets 2 and 4. Fix: borrow `x`, so the borrow checker
    // rejects the `push` while `d` is alive.
    let mut x = vec![1, 2, 3];
    let d: &[u32] = &x[..];
    println!("{a:?} {b:?} {c:?} {d:?}");
    x.push(4);
}
```

<details>

- **Answer:** 1 breaks non-null, 2 is fine, 3 breaks "initialized", and 4 breaks
  bullets 2 and 4 once `push` reallocates.

- three of the four fixes need no `unsafe`. A slice made from a
  `Vec` should just borrow it. Then the borrow checker enforces bullet 4.
- `NonNull::dangling()` with length 0 is the other fix for 1.
- 1 breaks bullet 1: non-null even when `len == 0`. Usual wrong answer:
  "Length 0 reads nothing." The next section has a slide on exactly this.
  If someone runs it, a debug build's precondition check stops at 1.
- 2 is fine.
- 3 breaks bullet 3. The memory is in the allocation (bullet 2 holds), but
  only one `u32` is initialized. The C habit: "I allocated it, so I can read
  it."
- 4 breaks bullets 2 and 4. `push` reallocates (the capacity was 3), so `d`
  points at freed memory. Bullets 2 and 4 must hold for all of `'a`, not
  just at the call.
- Not proof: "It printed the right numbers." Freed memory often still holds
  the old values. Miri reports both 3 and 4.

</details>
