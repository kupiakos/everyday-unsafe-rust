---
minutes: 3
---

# The Sibling Chip

- A related chip: also `xtensa`.
- Different memory map.
- Same code reads the wrong register.
- Gate on the exact fact you rely on.

```rust,editable
/// Returns 32 bits from the hardware random number generator.
// `target_arch = "xtensa"` alone also matches chips with other memory maps.
#[cfg(all(target_arch = "xtensa", feature = "esp32"))]
pub fn hw_random_u32() -> u32 {
    // ESP32 hardware RNG data register. Other chips put it elsewhere.
    const RNG_DATA_REG: *const u32 = 0x3FF7_5144 as *const u32;

    // SAFETY: The `esp32` feature is only enabled for ESP32 builds, so this is
    // an ESP32, where `RNG_DATA_REG` is an always-mapped memory-mapped register. It
    // may be read with an aligned 32-bit read at any time from any core.
    //
    // Volatile because the hardware changes the value outside the compiler's view.
    unsafe { RNG_DATA_REG.read_volatile() }
}
```

<details>

- **Point:** gate on the exact fact the `SAFETY:` comment relies on:
  `target_arch = "xtensa"` alone also matches chips with other memory maps.

- Someone reuses the ESP32 code on a sibling chip with the same `target_arch`.
  It builds, and silently reads some unrelated register.
- The `SAFETY:` comment relied on "this is an ESP32", but the `cfg` only checked
  "this is Xtensa". The check didn't match the claim.
- There's no built-in `cfg` for the exact chip, so the build has to provide one,
  here a Cargo feature. Now the wrong build fails to compile.
- The feature is now the claim to review. Nothing in Rust stops someone from
  enabling `esp32` for another chip, so the `SAFETY:` comment says what it
  trusts: "only enabled for ESP32 builds". A reviewer checks that in the build
  configuration, not in this file.

</details>
