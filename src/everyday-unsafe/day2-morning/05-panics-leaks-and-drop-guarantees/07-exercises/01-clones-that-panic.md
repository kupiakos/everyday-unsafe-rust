---
minutes: 10
---

# Exercise: Clones That Panic

- Implement `Clone` for `Fragile` so the third clone panics.
- Which slots does the `Vec` drop during unwinding?
- Fix `extend_n`. Then: can you write it with no `unsafe`?

```rust,editable
#![allow(dead_code)]

/// Appends `n` clones of `value` to `v`.
pub fn extend_n<T: Clone>(v: &mut Vec<T>, value: &T, n: usize) {
    v.reserve(n);
    let len = v.len();
    // SAFETY: We initialize slots `len..len + n` right below.
    unsafe { v.set_len(len + n) };
    let p = v.as_mut_ptr();
    for i in len..len + n {
        // SAFETY: `i < len + n <= capacity`, after `reserve`.
        unsafe { p.add(i).write(value.clone()) };
    }
}

#[derive(Debug)]
struct Fragile(String);

impl Clone for Fragile {
    fn clone(&self) -> Self {
        todo!("panic on the third call")
    }
}

fn main() {
    let mut v = vec![Fragile("a".to_string())];
    extend_n(&mut v, &Fragile("x".to_string()), 5);
    println!("{v:?}");
}
```

<details>

- **Goal:** the length must count only initialized slots at every point where a
  `clone` can panic.

- "A Panicking Predicate" is in Bonus Exercises at the end of the day, for
  students who want more.

- Hints:
  - Hint: while `clone` runs, what does `v.len()` say? Which of those slots hold
    a value yet?
  - Hint for `Fragile`: a `static` counter can count the calls.
  - If they say "the `set_len` is fine because we write those slots next":
    reread the `# Safety` section of
    [`set_len`](https://doc.rust-lang.org/std/vec/struct.Vec.html#method.set_len).
  - If stuck on the fix: when should the length grow?
  - If they require a `Clone` that doesn't panic: is `Clone` a safe trait?
  - For the no-`unsafe` version: which `Vec` method appends from an iterator?

</details>
