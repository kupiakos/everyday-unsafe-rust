---
minutes: 2
---

# Two Lines Print

- `MaybeUninit` has no drop glue.
- `write` doesn't drop the old contents.
- You end the lifecycle: `assume_init_drop`.

```rust
use std::mem::MaybeUninit;

struct Loud(&'static str);

impl Drop for Loud {
    fn drop(&mut self) {
        println!("dropping {}", self.0);
    }
}

fn main() {
    let _a = Loud("a"); // Dropped at the end of `main`, as usual.
    let _b = MaybeUninit::new(Loud("b")); // Never dropped: no drop glue.

    let mut c = MaybeUninit::<Loud>::uninit();
    c.write(Loud("c1"));
    c.write(Loud("c2")); // Overwrites "c1" without dropping it.
    // SAFETY: `c` was initialized by the `write` above.
    unsafe { c.assume_init_drop() }; // Prints "dropping c2".
}
// Output: "dropping c2", then "dropping a". "b" and "c1" leaked.
```

<details>

- **Answer:** two lines, "dropping c2" then "dropping a", then: `MaybeUninit`
  has no drop glue, so you end each value's lifecycle by hand.

- Answer to the last slide's question: two lines, "dropping c2" then "dropping
  a".
- `b` and `c1` leaked. Leaking is safe (next section); dropping one value twice
  isn't.
- The lifecycle: uninitialized, then `write`, then initialized, then dropped,
  then uninitialized again. `MaybeUninit` makes you do each step by hand.
- Thread: _one owner, one drop_.

</details>
