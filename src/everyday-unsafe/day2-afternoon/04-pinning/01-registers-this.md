---
minutes: 3
---

# Registering `this`

- The object stores its own address.
- A Rust move copies the bytes.
- Nothing updates the stored address.
- It now points at the old location.

```rust
struct SelfRef {
    data: [u8; 4],
    // Points into `data`. C++ would fix this up in a move constructor.
    ptr: *const u8,
}

fn main() {
    let mut a = SelfRef { data: *b"abcd", ptr: std::ptr::null() };
    a.ptr = a.data.as_ptr();

    let b = a; // A `memcpy`. `b.ptr` still points to where `a.data` was.
    println!("{:p} vs {:p}", b.ptr, b.data.as_ptr());
}
```

<details>

- **Point:** a Rust move copies the bytes and runs no code, so an address the object stored of itself now points at the old location.

- Run it. In a debug build the two addresses differ: `b.ptr` points at `a`'s
  old location, which the compiler may reuse for something else. An optimized
  build may happen to keep them equal. Don't count on either.
- `SelfRef` is the smallest version of `Widget`: instead of a registry holding
  `this`, the object holds a pointer to itself. Same failure.
- Dereferencing `b.ptr` now would be a use of a stale pointer. Nothing here is
  UB yet, because nobody reads through it.
- Story: a C++ object registers `this` with an observer list. Rust moves it,
  and the observer list calls into the old address.

</details>
