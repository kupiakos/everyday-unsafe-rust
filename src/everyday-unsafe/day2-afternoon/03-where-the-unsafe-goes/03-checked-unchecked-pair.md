---
minutes: 3
---

# A Checked/Unchecked Pair

- Safe `new` checks; `unsafe new_unchecked` doesn't.
- `# Safety` requires what `new` checks.
- `debug_assert!` catches mistakes in tests.
- Same as [`from_utf8`](https://doc.rust-lang.org/std/str/fn.from_utf8.html) /
  [`from_utf8_unchecked`](https://doc.rust-lang.org/std/str/fn.from_utf8_unchecked.html#safety).

```rust,editable
pub struct Ascii<'a>(
    // Safety invariant: every byte is ASCII.
    &'a [u8],
);

impl<'a> Ascii<'a> {
    pub fn new(bytes: &'a [u8]) -> Option<Self> {
        bytes.is_ascii().then_some(Ascii(bytes))
    }

    /// # Safety
    ///
    /// The caller must ensure that every byte of `bytes` is ASCII.
    pub unsafe fn new_unchecked(bytes: &'a [u8]) -> Self {
        debug_assert!(bytes.is_ascii(), "`new_unchecked` precondition violated");
        Ascii(bytes)
    }

    pub fn as_str(&self) -> &'a str {
        // SAFETY: ASCII is valid UTF-8, by the invariant on the field.
        unsafe { std::str::from_utf8_unchecked(self.0) }
    }
}
```

<details>

- **Point:** keep a safe checked constructor next to an `unsafe` unchecked one
  whose `# Safety` section is exactly the check, with a `debug_assert!` for
  tests.

- Most callers use `new`. `new_unchecked` exists for callers who already know,
  for example because the bytes came out of another `Ascii`, and can't afford to
  check twice.
- `new_unchecked`'s `# Safety` section is `new`'s check, written as a sentence.
  That makes it easy to review: compare the two.
- `debug_assert!` costs nothing in release builds and turns a caller's broken
  promise into a test failure. It's not a fix: release builds still have UB.
- Ask: "Could [`Record`](01-one-unsafe-constructor.md) have a checked/unchecked
  pair?" Only partly. It could check for null, but not for NUL termination or
  lifetime. Not every precondition can be checked.

</details>
