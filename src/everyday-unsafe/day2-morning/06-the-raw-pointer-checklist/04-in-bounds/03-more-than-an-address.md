---
minutes: 2
---

# More Than an Address

- `q` and `r` hold the same address.
- `*q` is fine. Is `*r`?

```rust,no_run
fn main() {
    let b = [3u8, 4];
    let q: *const u8 = b.as_ptr();
    let addr: usize = q.addr();
    let r: *const u8 = std::ptr::without_provenance(addr);
    assert_eq!(q, r); // Same address.
    // SAFETY: `r` has the address of `b[0]`.
    println!("{}", unsafe { *r });
}
```

<details>

- **Question:** students decide whether a pointer with the right address is
  enough to read through. It isn't. The answer is on the next slide.
- Ask: "The `assert_eq!` passes. Is the `SAFETY:` comment true?"
- Usual wrong answer: "Same address, same pointer." That's how C programmers
  usually think about pointers, and it's what the comment assumes.
- Hint if stuck: where did `r` come from? Did it ever point into `b`?

</details>
