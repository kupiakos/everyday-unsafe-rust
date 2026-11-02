---
minutes: 2
---

# Padding Bytes Can Be Uninitialized

- Type validity includes "are my bits initialized".
- Padding bytes don't have to be initialized.
- Moving a value may or may not move the padding bytes!

```rust
#[repr(C)]
struct Foo {
    x: u8,
    // 1 padding byte here, so that `y` is aligned.
    y: u16,
}

// UNSOUND: the padding byte is uninitialized, but `&[u8]` lets safe callers
// read every byte as an initialized `u8`.
fn as_bytes(foo: &Foo) -> &[u8] {
    let p = (foo as *const Foo).cast::<u8>();
    unsafe { std::slice::from_raw_parts(p, size_of::<Foo>()) }
}
```

<details>

- **Point:** padding bytes can be uninitialized, so exposing a struct's raw
  bytes as `&[u8]` is unsound.

- `Foo` has a valid `x` and a valid `y`, and still one byte that is
  uninitialized: the padding between them.
- `&[u8]` promises every byte is an initialized `u8`, so `as_bytes` hands safe
  callers the uninit reads from the start of this section.
- C programmers do this with `memcpy` and `fwrite` all the time. In Rust, zero
  the padding (or have none) before exposing the bytes; crates like `zerocopy`
  check this at compile time.

</details>
