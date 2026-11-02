---
minutes: 5
---

# Reference Validity

- C's `offsetof` trick: `&((struct packet *)0)->len`.
- It never reads memory.
- Is the Rust port sound?

```rust
#[repr(C)]
pub struct Packet {
    kind: u8,
    len: u32,
}

// C: `offsetof(struct packet, len)`, or `&((struct packet *)0)->len`.
pub fn len_offset() -> usize {
    let base: *const Packet = std::ptr::null();
    unsafe { &(*base).len as *const u32 as usize }
}
```

<details>

- **Question:** students decide whether the `offsetof` port is sound (no: the
  `&` makes a reference through null). The answer is on the next slide.

- Ask: "Is this port sound?" The next slide has the answer.
- Expected: no. The `&` creates a reference through a null pointer, which is UB
  even though nothing reads through it.
- Usual wrong answer: "fine, it never touches memory." The C trick never reads
  memory, so C developers expect it to be harmless.
- With `ptr::null()` written inline, the compiler rejects it outright
  (`deref_nullptr`). Through a variable, it compiles.

</details>
