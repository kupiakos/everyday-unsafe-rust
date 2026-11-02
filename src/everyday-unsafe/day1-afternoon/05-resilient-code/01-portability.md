---
minutes: 5
---

# Portability

Platform-specific code may be sound on one platform and unsound on another.

Soundness may be platform-specific: try to avoid it where you can!

```rust
/// Returns 32 bits from the hardware random number generator.
#[cfg(target_arch = "xtensa")]
pub fn hw_random_u32() -> u32 {
    // ESP32 hardware RNG data register.
    const RNG_DATA_REG: *const u32 = 0x3FF7_5144 as *const u32;

    // SAFETY: On ESP32, `RNG_DATA_REG` is an always-mapped memory-mapped register.
    // It may be read with an aligned 32-bit read at any time from any core.
    // The `cfg` check ensures that we are running on a supported platform.
    //
    // Volatile because the hardware changes the value outside the compiler's view.
    unsafe { RNG_DATA_REG.read_volatile() }
}
```

<details>

- **Point:** soundness can be platform-specific, so make non-portable code fail
  to compile on other platforms, with a `cfg`.

- Memory safety soundness often comes with the implication that it works the
  same on all platforms. There are some real-world exceptions to this.
- Generally you should try to make non-portable code fail to compile: add a
  `cfg` to `hw_random_u32` so it only compiles on systems where that's valid.
- Casting a constant integer to a raw pointer is a supported way to access a
  platform's MMIO register.

</details>
