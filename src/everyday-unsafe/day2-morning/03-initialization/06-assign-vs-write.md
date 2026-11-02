---
minutes: 3
---

# Assignment vs `write`

- `*p = v` drops the old value first.
- No old value: it drops garbage. UB.
- `p.write(v)` only stores.

```rust
use std::mem::MaybeUninit;

struct Loud(&'static str);

impl Drop for Loud {
    fn drop(&mut self) {
        println!("dropping {}", self.0);
    }
}

fn main() {
    let mut c = MaybeUninit::<Loud>::uninit();
    let p: *mut Loud = c.as_mut_ptr();

    // UB: assignment drops the old value first, and there isn't one.
    // unsafe { *p = Loud("c1") };

    // SAFETY: `p` is valid for an aligned write of one `Loud`.
    unsafe { p.write(Loud("c1")) }; // Stores without dropping anything.

    // SAFETY: `*p` is initialized now, so assignment may drop "c1".
    unsafe { *p = Loud("c2") }; // Prints "dropping c1".

    // SAFETY: `c` holds "c2".
    unsafe { c.assume_init_drop() }; // Prints "dropping c2".
}
```

<details>

- **Point:** `*p = v` drops the old value first, which is UB on uninitialized
  memory; `write` only stores.

- Same `Loud` as the last slide; one change: a raw pointer and `*p =`.
- C++ parallel: `*p = value` on raw storage calls `operator=` on garbage. You
  wanted placement `new`, which is what `write` is.
- The commented-out line would run `Loud::drop` on uninitialized bytes, and
  print from a garbage `&str`.
- For types with no drop glue, like `u32`, assignment through a raw pointer
  drops nothing. `write` is right for every type, so prefer it.

</details>
