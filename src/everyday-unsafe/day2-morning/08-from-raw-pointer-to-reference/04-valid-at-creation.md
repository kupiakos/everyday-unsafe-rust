---
minutes: 2
---

# Valid at Creation

- A reference must be
  [valid when it's created](https://doc.rust-lang.org/reference/behavior-considered-undefined.html#invalid-values).
- Even if nothing reads through it.
- `&(*null).field` is UB. Use `offset_of!`.

```rust,editable
#[repr(C)]
struct Packet {
    kind: u8,
    len: u32,
}

fn main() {
    // C: `offsetof(struct packet, len)`, or `&((struct packet *)0)->len`.
    // UB in Rust: creates a reference through a null pointer.
    // let off = unsafe { &(*std::ptr::null::<Packet>()).len as *const u32 as usize
    // };

    let off = std::mem::offset_of!(Packet, len); // Sound, with no `unsafe`.
    assert_eq!(off, 4);
}
```

<details>

- **Answer:** not sound, because a reference must be valid when it's created
  even if unused, then: use `offset_of!`, or `&raw const` for field pointers.

- Answer to the question on [Validity](03-validity.md): not sound. In Rust, the
  `&` alone promises a valid `u32` at that address.
- To get a field pointer from a raw pointer, use `&raw const (*p).len`: no
  reference is created. `p` must still point to a real `Packet`.
- For offsets, `offset_of!` is the answer, with no `unsafe` at all.
- Same rule for `&*p` where `p` is dangling, even if the result is never used.

</details>
