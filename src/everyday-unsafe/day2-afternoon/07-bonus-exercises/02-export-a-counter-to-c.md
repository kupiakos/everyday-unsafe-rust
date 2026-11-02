---
minutes: 0
---

# Exercise: Export a Counter to C

- Fill in the four functions with `Box::into_raw` and `Box::from_raw`.
- Write each `# Safety` section for a C caller, and the `SAFETY:` comment in
  `main`.
- What if C passes NULL? Frees twice? Adds past `u32::MAX`? Uses two threads?
- Could any of them be a safe `extern "C" fn`?

```rust,editable
#![allow(dead_code, unused_variables)]

/// Opaque to C: the header only declares `typedef struct Counter Counter;`.
pub struct Counter {
    total: u32,
}

// SAFETY: `counter_new` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub extern "C" fn counter_new() -> *mut Counter {
    todo!("`Box::into_raw`")
}

/// # Safety
///
/// TODO
// SAFETY: `counter_add` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn counter_add(c: *mut Counter, n: u32) {
    todo!()
}

/// # Safety
///
/// TODO
// SAFETY: `counter_total` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn counter_total(c: *const Counter) -> u32 {
    todo!()
}

/// # Safety
///
/// TODO
// SAFETY: `counter_free` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn counter_free(c: *mut Counter) {
    todo!("`Box::from_raw`")
}

// Plays the C caller.
fn main() {
    let c = counter_new();
    // SAFETY: TODO
    unsafe {
        counter_add(c, 2);
        counter_add(c, 3);
        assert_eq!(counter_total(c), 5);
        counter_free(c);
    }
}
```

<details>

- **Goal:** write the contract for a C caller of exported Rust functions: NULL, double free, overflow, and threads.

- Hints:
  - Hint for NULL: what does `free(NULL)` do? Is there a Rust type that means
    "NULL or a valid pointer"?
  - If they add a "freed" flag inside `Counter`: where does that flag live
    after the free?
  - Ask: what does `+=` do on overflow, in debug and in release builds? What
    does a panic do at an `extern "C"` boundary?
  - Hint for threads: is it something Rust can check here, or does it go in
    the docs?
  - For the last question: recall `stats_get`. Does C ever see inside
    `Counter`?

</details>
