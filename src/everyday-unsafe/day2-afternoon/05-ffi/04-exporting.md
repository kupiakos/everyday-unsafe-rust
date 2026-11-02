---
minutes: 3
---

# Exporting Rust to C

- `#[unsafe(no_mangle)] pub extern "C" fn`
- `Option<&mut T>` parameter: can stay safe.
- Dereferences a raw pointer: `unsafe extern "C" fn`.
- `MaybeUninit<T>` has `T`'s size, alignment, and ABI.

```rust
use std::mem::MaybeUninit;

#[repr(C)]
pub struct Stats {
    pub count: u64,
}

/// Writes the current stats to `out`. C callers usually point `out` at an
/// uninitialized local, and `MaybeUninit` says so in the type. It has the same
/// layout as `Stats`, so C still sees a `Stats *`.
// SAFETY: `stats_get` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub extern "C" fn stats_get(out: Option<&mut MaybeUninit<Stats>>) -> bool {
    let Some(out) = out else { return false };
    out.write(Stats { count: 42 });
    true
}

/// # Safety
///
/// `out` must be non-null, aligned, and valid for writes of one `Stats`.
// SAFETY: `stats_get_raw` is a unique symbol name in the final linked binary.
#[unsafe(no_mangle)]
pub unsafe extern "C" fn stats_get_raw(out: *mut Stats) {
    // SAFETY: The caller guarantees `out` is valid for an aligned write.
    unsafe { out.write(Stats { count: 42 }) }
}
```

<details>

- **Point:** an exported function that takes `Option<&mut T>` can stay safe. One that dereferences a raw pointer must be an `unsafe extern "C" fn` with a `# Safety` section.

- The other direction: C calls a function Rust exports. In both versions, C
  sees a plain `struct Stats *out` parameter.
- `Option<&mut T>` has the same ABI as a nullable C pointer, so `stats_get`
  handles NULL itself, and no Rust caller can misuse it. It can stay safe.
- A C caller can still pass a dangling pointer. That's on the C side, and the
  header comment should say "NULL, or a valid `struct Stats *`".
- `no_mangle` needs `unsafe(..)` in the 2024 edition: two exported functions
  with the same name are UB at link time, and the `SAFETY:` comment says why
  this one is unique.
- Why `MaybeUninit`: C's `out` usually points at an uninitialized local. Our
  rule from Initialization is to never make a `&mut Stats` to uninitialized
  memory.

</details>
