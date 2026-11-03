---
minutes: 3
---

# Provenance

- `*r` is UB: `r` has the address, but no permission to access `b`.
- A pointer is an address plus
  [_provenance_](https://doc.rust-lang.org/std/ptr/index.html#provenance): which
  allocation it may access.
- "In bounds" means in bounds of the allocation its provenance covers.
- To change an address,
  [keep the provenance](https://doc.rust-lang.org/std/ptr/index.html#strict-provenance):
  `map_addr`, `with_addr`.

```rust,editable
fn main() {
    let b = [3u32, 4];
    let q: *const u32 = b.as_ptr(); // Aligned to 4, so the low bit is free.
    let tagged = q.map_addr(|a| a | 1);
    let untagged = tagged.map_addr(|a| a & !1);
    // SAFETY: `untagged` keeps `q`'s provenance, and has `q`'s address, which
    // points to `b[0]`.
    println!("{}", unsafe { *untagged });
}
```

<details>

- **Answer:** an address alone doesn't let you access memory: `r` has no
  provenance, so `*r` is UB even though `r == q`. Keep provenance when you
  change an address.
- `ptr::without_provenance` makes a pointer with no provenance on purpose. Here
  it stands in for every way to lose it, like turning a `usize` back into a
  pointer.
- Comparing pointers only compares addresses. `p == q` doesn't mean `p` may
  access what `q` points to. Two arrays side by side are the classic case: a
  pointer one past the end of `a` can have the same address as `b`, and still
  may only access `a`.
- Tagged pointers are where this comes up in practice.
  [Resilient Code](../../../day1-afternoon/05-resilient-code.md)'s notes
  mentioned them: pointer signing on iOS took bits that tagged pointers assumed
  were free. `map_addr` changes the address and keeps the provenance. Low-bit
  tags only work if alignment guarantees the bit is free: with `u8`, they
  wouldn't.
- If code really needs an integer round trip, `expose_provenance` and
  `with_exposed_provenance` are the
  [explicit APIs](https://doc.rust-lang.org/std/ptr/index.html#exposed-provenance).
  The rules there are less settled, so prefer `map_addr`.
- In the
  [unsafe Rust review skill](https://github.com/google/rust-skills/blob/main/unsafe_rust_review/SKILL.md)'s
  terms, this is `[hazard.provenance]`.

</details>
