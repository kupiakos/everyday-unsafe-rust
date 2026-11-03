---
minutes: 4
---

# Shorthands for "Valid"

- The whole list is arduous to handwrite every time.
- [`std` gives some shorthands](https://doc.rust-lang.org/std/ptr/index.html#safety)
  to use that expand to a set of bullets.
- Don't forget the time span for preconditions! Like "for all of `'a`" or "until
  `free`" or "for the duration of the call".

| Shorthand                       | Expands to                                                                              |
| ------------------------------- | --------------------------------------------------------------------------------------- |
| "valid"                         | Nothing yet. Valid for which access?                                                    |
| "dereferenceable" for `n` bytes | All `n` bytes in one live allocation the pointer may access                             |
| "valid for reads"               | Non-null, dereferenceable, no data race. Likely need to add "aligned" and "initialized" |
| "valid for writes"              | Same, for writes. Likely need to add aligned. The old bytes may be uninitialized.       |
| "dangling"                      | Not valid for any non-zero-size access: null, freed, out of bounds                      |
| "convertible to a reference"    | Non-null, aligned, dereferenceable, a valid `T`, and the aliasing rules                 |

```rust,editable
/// # Safety
///
/// For all of `'a`, `ptr` must be convertible to a `&'a T`.
pub unsafe fn as_ref<'a, T>(ptr: *const T) -> &'a T {
    // SAFETY: Caller promises that `ptr` is convertible to a `&'a T` for all
    // of `'a`.
    unsafe { &*ptr }
}
```

<details>

- **Point:** `std` defines short names for parts of the "valid" list. Use them,
  expand anything else, and always add how long it holds.

- The definitions are in the `std::ptr` module docs, under
  [Safety](https://doc.rust-lang.org/std/ptr/index.html#safety) and
  [Pointer to reference conversion](https://doc.rust-lang.org/std/ptr/index.html#pointer-to-reference-conversion).
  `std` itself says "it makes no sense to ask 'is this pointer valid'; one has
  to ask 'is this pointer valid for a given access'".
- The surprise row: "valid for reads" doesn't include aligned or initialized.
  That's why
  [`ptr::read`'s `# Safety`](https://doc.rust-lang.org/std/ptr/fn.read.html#safety)
  lists three bullets: valid for reads, properly aligned, and points to a
  properly initialized `T`.
- [`ptr::write`'s `# Safety`](https://doc.rust-lang.org/std/ptr/fn.write.html#safety)
  lists only two: valid for writes, and properly aligned. A write doesn't care
  what was there before.
- It does include non-null, even for a zero-size access. Functions that accept
  null for size zero say so explicitly.
- "Dereferenceable" is the in-bounds and provenance row: the pointer must be
  allowed to access all `n` bytes. For `n > 0` it implies non-null and live.
- `std`
  [calls dereferenceable](https://doc.rust-lang.org/std/ptr/index.html#safety)
  "necessary, but not always sufficient" for "valid for reads": the access also
  can't race with another thread, or interleave with a reference to the same
  memory. The exact rules aren't final.
- "Dangling" covers null, freed, out of bounds, and `NonNull::dangling()`.
- "Convertible to a reference" is the whole of
  [From Raw Pointer to Reference](../08-from-raw-pointer-to-reference.md) in one
  phrase.
  [`pointer::as_ref_unchecked`](https://doc.rust-lang.org/std/primitive.pointer.html#method.as_ref_unchecked)'s
  `# Safety` section is just that phrase.
- None of these says how long. With an unbounded `'a`, as here, "for all of
  `'a`" is the part the caller has to read twice.
- Other words in the wild: "valid pointer", "owned", "live". If your crate uses
  one, define it once in the crate docs, or spell it out.
- Ask: "Read `init_logger`'s `# Safety` from
  [the threaded logger](../09-send-sync-and-data-races/07-logger-threads.md).
  Using these definitions, what's missing?" Expected: aligned. "Valid for reads
  and writes" doesn't include it, and the function makes a `&mut` through the
  pointer.

</details>
