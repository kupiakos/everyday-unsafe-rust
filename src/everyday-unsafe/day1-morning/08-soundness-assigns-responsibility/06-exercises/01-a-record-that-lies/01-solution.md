
# Solution

- The liar: `fn size(&self) -> usize { 100 }`. `write_record` writes 36 bytes
  past `buf`.
- At fault: `write_record`. It trusted a safe trait's docs.
- Fix 1 checks. Fix 2 makes implementors promise.

Fix 1, the better one:

```rust,editable
pub trait Record {
    /// How many bytes `write` produces. At most 64.
    fn size(&self) -> usize;
    /// Writes the record into `out`, which is exactly `size()` bytes long.
    fn write(&self, out: &mut [u8]);
}

/// Writes `r` into `buf`, and returns the bytes written.
pub fn write_record<'a, R: Record>(r: &R, buf: &'a mut [u8; 64]) -> &'a [u8] {
    let out = &mut buf[..r.size()]; // Panics if `size()` lies: a bug, not UB.
    r.write(out);
    out
}
```

Fix 2:

```rust,editable
/// # Safety
///
/// Implementors must ensure that `size` returns at most 64.
pub unsafe trait Record {
    /// How many bytes `write` produces.
    fn size(&self) -> usize;
    /// Writes the record into `out`, which is exactly `size()` bytes long.
    fn write(&self, out: &mut [u8]);
}

/// Writes `r` into `buf`, and returns the bytes written.
pub fn write_record<'a, R: Record>(r: &R, buf: &'a mut [u8; 64]) -> &'a [u8] {
    let n = r.size();
    // SAFETY: `n <= 64`, by the `# Safety` section of `Record`.
    let out = unsafe { buf.get_unchecked_mut(..n) };
    r.write(out);
    out
}

// SAFETY: `size` always returns 4.
unsafe impl Record for u32 {
    fn size(&self) -> usize {
        4
    }
    fn write(&self, out: &mut [u8]) {
        out.copy_from_slice(&self.to_le_bytes());
    }
}
```

<details>

- **Answer:** `size` returning 100 overflows `buf`, and `write_record` is at
  fault; fix it with a checked slice, or make `Record` an `unsafe trait`.

- with Fix 2, the liar has to write `unsafe impl`, and its `SAFETY:` comment
  can't be true. Blame moves to the impl.
- Fix 2 is crying wolf here. It's worth it only when the check is expensive, or
  impossible, like [`Size32`](../../03-size32.md).
- At fault: `write_record`. Its `SAFETY:` comment cites a safe trait's docs.
  Like [`Eq`](../../02-eq-can-lie.md), a safe trait's rules can be broken by
  safe code.
- Usual wrong answer: "the impl broke the documented rule". That's a logic bug.
  A safe impl can't be at fault for UB.
- Hint if needed: one fix is a check, the other makes `Record` an
  `unsafe trait`, with a `# Safety` section and a `SAFETY:` comment on the impl.
- Fix 1: `&mut buf[..n]`. One comparison. Prefer it.
- Fix 2: an `unsafe trait`, like [`Size32`](../../03-size32.md). Now the liar
  must write `unsafe impl`, and its `SAFETY:` comment is false, so the fault
  moves to it. The cost: every implementor writes `unsafe` to save one
  comparison.
- What isn't a fix: "at most 64" in bold in the docs, or a `debug_assert!`.
- In `std`:
  [`ExactSizeIterator::len`](https://doc.rust-lang.org/std/iter/trait.ExactSizeIterator.html)
  is safe and can lie, so `unsafe` code can't trust it.
  [`TrustedLen`](https://doc.rust-lang.org/std/iter/trait.TrustedLen.html#safety)
  (unstable) is the `unsafe trait` version.

</details>
