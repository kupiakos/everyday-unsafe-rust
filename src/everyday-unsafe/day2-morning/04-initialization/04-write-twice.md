---
minutes: 1
---

# Write It Twice

- `Loud` prints when it's dropped.
- How many lines print, and in what order?
- Hint: `MaybeUninit<T>` holds a `T`. Does it drop it?

```rust,editable
use std::mem::MaybeUninit;

struct Loud(&'static str);

impl Drop for Loud {
    fn drop(&mut self) {
        println!("dropping {}", self.0);
    }
}

fn main() {
    let _a = Loud("a");
    let _b = MaybeUninit::new(Loud("b"));

    let mut c = MaybeUninit::<Loud>::uninit();
    c.write(Loud("c1"));
    c.write(Loud("c2"));
    // SAFETY: `c` was initialized by the `write` above.
    unsafe { c.assume_init_drop() };
}
```

<details>

- **Question:** students predict how many lines print (two: "c2", then "a"),
  because `MaybeUninit` never drops its contents. The answer is on
  [Two Lines Print](05-two-lines.md).

- Ask before running it: "How many messages print, and in what order?" Take
  guesses, then run it. [Two Lines Print](05-two-lines.md) has the answer.
- Expected: two, "dropping c2" then "dropping a".
- Usual wrong answers: four, or "c1, then c2".

</details>
