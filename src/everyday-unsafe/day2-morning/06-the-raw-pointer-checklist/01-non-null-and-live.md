---
minutes: 3
---

# Non-Null and Live

- Null is never valid.
- Non-null isn't enough: the memory must be live.
- Freed or out of scope means dangling.

```rust
fn main() {
    let p: *const String;
    {
        let s = String::from("hi");
        p = &raw const s; // Safe: creating a raw pointer.
    } // `s` is dropped here, and `p` now dangles.
    assert!(!p.is_null()); // Passes, and proves nothing.
    // let len = unsafe { (*p).len() }; // UB: use after free.
}
```

<details>

- **Point:** a non-null pointer can still dangle, and no runtime check tells
  live from dangling.

- Day 1's UB slides already showed use-after-free. This is the same rule, with a
  name.
- "Live" has an end: when the value goes out of scope, is dropped, or its
  allocation is freed. Thread: _until when?_
- C++ parallel: returning the address of a local.
- No runtime check can tell live from dangling. That's why "valid" goes in a
  `# Safety` section instead of an `assert!`.

</details>
