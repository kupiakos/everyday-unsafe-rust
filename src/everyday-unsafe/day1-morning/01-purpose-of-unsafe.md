---
minutes: 5
---

# Purpose of `unsafe`

So, why does `unsafe` code exist? Unsafe exists to highlight: hey this line can
hurt!

- Safe Rust never causes memory-safety bugs on its own, but assumes that all
  `unsafe` code is sound.
- Sound code with respect to memory safety always ensures preconditions and
  invariants are upheld.
- Some checks are compile time, like the borrow checker.
- Some checks are run time, like slice indices.

```rust,compile_fail
fn main() {
    let mut v = vec![1, 2, 3];
    let first = &v[0];
    v.push(4); // Error: `push` may reallocate while `first` points into `v`.
    println!("{first}");
}
```

<details>

- **Goal:** students can say what `unsafe` marks (where a person, not the
  compiler, proves memory safety) and tell its two roles apart: asking for a
  proof, and providing one. **Arc:** safe Rust's promise → what the compiler
  can't check → `unsafe` is paperwork → two roles → `unsafe` in a trait → who
  has the homework → what `unsafe` doesn't do.

As developers of resilient software, we have a responsibility to design it
efficiently.

- Start from something students already trust. In C++ this is iterator
  invalidation: `push_back` may reallocate, and `first` dangles.
- Ask: what does C++ do here? (Compiles, and maybe works.) Rust rejects it.
- `v[10]` would panic instead of reading past the end. A panic is a bug, but not
  a memory-safety bug.
- The "but": safe Rust trusts every `unsafe` block under it. Unsound code breaks
  safe Rust's contract, the way UB breaks the language's. The rest of the
  morning is about that contract.
- Next: the code the compiler can't check this way.

</details>
