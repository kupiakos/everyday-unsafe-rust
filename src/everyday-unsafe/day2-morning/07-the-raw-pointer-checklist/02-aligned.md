---
minutes: 3
---

# Aligned

- A `u32` belongs at a multiple of 4.
- `packed` breaks that: `&h.len` won't compile.
- `&raw const` and
  [`read_unaligned`](https://doc.rust-lang.org/std/ptr/fn.read_unaligned.html)
  do the job.

```rust,editable
#[repr(C, packed)]
struct Header {
    tag: u8,
    len: u32, // At offset 1: not a multiple of 4.
}

fn main() {
    let h = Header { tag: 1, len: 512 };
    // let r: &u32 = &h.len; // Error: a reference to a packed field may be
    // misaligned.
    let p: *const u32 = &raw const h.len; // Safe: creating a raw pointer.
    // SAFETY: `p` points to the initialized `len` field of the live `h`, which
    // may be misaligned, so this uses `read_unaligned` instead of `read`.
    let len = unsafe { p.read_unaligned() };
    println!("tag {}, len {len}", h.tag);
}
```

<details>

- **Point:** a reference must be aligned when it's created; for a packed field,
  use `&raw const` and `read_unaligned`.

- Story: porting a packed C file-format header (`#pragma pack(1)` or
  `__attribute__((packed))`).
- `&h.len` is a compile error because a reference must be aligned the moment it
  exists, not just when it's read.
- `p.read()` would be UB here:
  [`read` requires an aligned pointer](https://doc.rust-lang.org/std/ptr/fn.read.html#safety).
  `read_unaligned` doesn't.
- C instinct: "x86 handles misaligned loads." The rule is in the language, not
  the CPU, and the compiler may emit instructions that do require alignment.

</details>
