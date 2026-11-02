---
minutes: 0
---

# Exercise: Four Calls to `from_raw_parts`

- Use the table from "A Long List".
- For each call: which bullet does it break, if any?

```rust,editable,no_run
use std::slice;

fn main() {
    // 1. A C library returned `(NULL, 0)` to communicate an empty list.
    let (ptr, len): (*const u32, usize) = (std::ptr::null(), 0);
    let a: &[u32] = unsafe { slice::from_raw_parts(ptr, len) };

    // 2. A live `Vec`.
    let v = vec![1, 2, 3];
    let b: &[u32] = unsafe { slice::from_raw_parts(v.as_ptr(), v.len()) };

    // 3. The whole buffer, like C's `malloc(cap)`.
    let mut w: Vec<u32> = Vec::with_capacity(8);
    w.push(1);
    let c: &[u32] = unsafe { slice::from_raw_parts(w.as_ptr(), w.capacity()) };

    // 4. Keep the slice, then add to the `Vec`.
    let mut x = vec![1, 2, 3];
    let d: &[u32] = unsafe { slice::from_raw_parts(x.as_ptr(), x.len()) };
    x.push(4);

    // Running this is UB.
    println!("{a:?} {b:?} {c:?} {d:?}");
}
```

<details>

- **Goal:** answering every bullet of `from_raw_parts` for each call, including
  how long bullets 2 and 4 must hold.

- Hints:
  - Hint: answer every bullet of the table for every call, even the ones that
    look obviously fine.
  - If they say "Length 0 reads nothing": does bullet 1 make an exception for
    `len == 0`?
  - If they say "I allocated it, so I can read it": how many `u32`s were
    written?
  - Hint for 4: what does `push` do when the `Vec` is full? How long must the
    bullets hold: at the call, or for all of `'a`?
  - If someone runs it: a debug build's precondition check stops at the first
    call it catches. That doesn't mean the later calls are fine.
  - If they say "It printed the right numbers": does freeing memory erase it?
    Try Miri.

</details>
