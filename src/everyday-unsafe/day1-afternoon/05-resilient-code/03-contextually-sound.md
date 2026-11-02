---
minutes: 4
---

# Contextually Sound

- Sound where `usize` is 64 bits.
- Unsound where it's 32 bits.
- Soundness can depend on the platform.
- And on the compiler version.

```rust
pub struct Image {
    w: u16,
    h: u16,
    // Safety invariant: `rgba.len() == w * h * 4`.
    rgba: Vec<u8>,
}

impl Image {
    pub fn new(w: u16, h: u16) -> Image {
        // Can't overflow where `usize` is 64 bits: at most about 2^34.
        let len = w as usize * h as usize * 4;
        Image { w, h, rgba: vec![0; len] }
    }

    pub fn red(&self, x: u16, y: u16) -> u8 {
        assert!(x < self.w && y < self.h);
        let i = (y as usize * self.w as usize + x as usize) * 4;
        // SAFETY: `i < w * h * 4 == rgba.len()`, by the invariant.
        unsafe { *self.rgba.get_unchecked(i) }
    }
}
```

<details>

- **Point:** code can be sound where `usize` is 64 bits and unsound where it's 32 (or with another compiler), and debug-build tests may never see it.

- On a 32-bit target, `Image::new(32768, 32768)` computes 2^32, which wraps to
  0 in a release build. `red(0, 0)` then reads past an empty buffer.
- Debug builds check for overflow and panic instead, so the tests may never
  see it.
- Code that's sound only in some contexts is *contextually sound*. That
  includes code that relies on today's compiler, such as an unsettled rule or
  the current layout of a `repr(Rust)` type.
- Ask: how would you make the 32-bit build safe? Hold the answers for the next
  slide.

</details>
