---
minutes: 5
---

# Mutability

- Behind `&T`, the bytes don't change.
- Casting away `const` to write: UB.
- Like writing to a string literal in C.

```rust,compile_fail
pub struct BadCounter {
    n: u32,
}

impl BadCounter {
    pub fn incr(&self) {
        let p = &self.n as *const u32 as *mut u32; // C++: `const_cast`.
        // UB: mutation through a shared reference. This is common enough that
        // the deny-by-default `invalid_reference_casting` lint rejects it.
        unsafe { *p += 1 }
    }
}
```

<details>

- **Point:** behind `&T` nothing changes; casting away `const` to write is UB.

- C++ instinct: `const_cast` is fine if the object wasn't defined `const`. In
  Rust, writing through a pointer that came from a `&T` is UB, wherever the
  object came from.
- The lint only catches obvious cases. Most of these compile.
- The compiler may keep `n` in a register, or assume it didn't change across
  a call, just like with `&mut` aliasing.
- The one exception is `UnsafeCell`, two slides ahead. First, the safe tools.

</details>
