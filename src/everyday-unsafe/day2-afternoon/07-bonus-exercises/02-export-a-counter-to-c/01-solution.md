
# Solution

- `counter_add` and `counter_total` take `Option<&..>`, so they can be safe.
- `counter_free` must be `unsafe`: it takes ownership back from a raw pointer.
- NULL is a no-op, overflow wraps, and threads are in the docs.

```rust,editable
/// Opaque to C: the header only declares `typedef struct Counter Counter;`.
pub struct Counter {
    total: u32,
}

/// Returns a new counter. Free it with `counter_free`.
// SAFETY: `counter_new` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub extern "C" fn counter_new() -> *mut Counter {
    Box::into_raw(Box::new(Counter { total: 0 })) // Never null.
}

/// Adds `n`, wrapping on overflow. Does nothing if `c` is NULL.
///
/// C callers must pass NULL or a live counter that no other thread is using.
// SAFETY: `counter_add` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub extern "C" fn counter_add(c: Option<&mut Counter>, n: u32) {
    if let Some(c) = c {
        c.total = c.total.wrapping_add(n); // `+=` would panic in debug builds.
    }
}

/// Returns the total, or 0 if `c` is NULL.
///
/// C callers must pass NULL or a live counter that no thread is changing.
// SAFETY: `counter_total` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub extern "C" fn counter_total(c: Option<&Counter>) -> u32 {
    c.map_or(0, |c| c.total)
}

/// Frees `c`. Does nothing if `c` is NULL, like `free`.
///
/// # Safety
///
/// The caller must ensure that `c` is NULL, or was returned by `counter_new`
/// and not passed to `counter_free` since. No thread may use `c` during or
/// after the call.
// SAFETY: `counter_free` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn counter_free(c: *mut Counter) {
    if !c.is_null() {
        // SAFETY: By the preconditions, `c` came from `Box::into_raw` in
        // `counter_new`, and nothing else owns or uses it now.
        drop(unsafe { Box::from_raw(c) });
    }
}

// Plays the C caller.
fn main() {
    let c = counter_new();
    // SAFETY: `c` is a live counter, used only by this thread.
    counter_add(unsafe { c.as_mut() }, 2);
    // SAFETY: As above.
    counter_add(unsafe { c.as_mut() }, 3);
    // SAFETY: As above.
    assert_eq!(counter_total(unsafe { c.as_ref() }), 5);
    // SAFETY: `c` came from `counter_new`, and isn't used after this.
    unsafe { counter_free(c) };
}
```

<details>

- **Answer:** `counter_add` and `counter_total` take `Option<&..>` and stay safe, and `counter_free` stays `unsafe`. NULL is a no-op, overflow wraps, and threads go in the docs.

- NULL: `Box::from_raw(null)` is UB. Follow `free(NULL)` and check
  for it. `Option<&mut Counter>` makes the compiler do the check.
  - Double free: Rust can't detect it, so it goes in `# Safety`. Not a fix: a
    "freed" flag inside `Counter`. Reading it after the free is itself a
    use-after-free.
  - Overflow: `+=` panics in debug builds, which aborts at the `extern "C"`
    boundary (a crash, not UB). Release builds wrap. Choose `wrapping_add` or
    `saturating_add`, and document it.
  - Threads: two C threads calling `counter_add` on one counter are a data
    race. Either say "not concurrently" in the docs, or use `AtomicU32`.
  - `counter_add` and `counter_total` can be safe with `Option<&mut Counter>`
    and `Option<&Counter>`, like `stats_get`. `Counter` needs no `#[repr(C)]`:
    C never sees inside it.
- `Option<Box<Counter>>` is also FFI-safe (`Box`'s docs, "Memory
  layout"), so `counter_free` could be a safe `extern "C" fn` too. The C
  caller's contract then lives only in the header comment.
- in Rust, `main` now needs `unsafe` to turn `c` into a reference.
  In C, there's no `unsafe` to write, so the header comment is the contract.

</details>
