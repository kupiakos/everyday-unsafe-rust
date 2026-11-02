---
minutes: 10
---

# Exercise: A Record That Lies

- Write a safe `impl Record` that makes `write_record` cause UB.
- Who's at fault: your impl, or `write_record`?
- Fix it so that no safe impl can cause UB. Find two ways.

```rust,editable
pub trait Record {
    /// How many bytes `write` produces. At most 64.
    fn size(&self) -> usize;
    /// Writes the record into `out`, which is exactly `size()` bytes long.
    fn write(&self, out: &mut [u8]);
}

/// Writes `r` into `buf`, and returns the bytes written.
pub fn write_record<'a, R: Record>(r: &R, buf: &'a mut [u8; 64]) -> &'a [u8] {
    let n = r.size();
    // SAFETY: `n <= 64`, by the docs on `Record::size`.
    let out = unsafe { buf.get_unchecked_mut(..n) };
    r.write(out);
    out
}

impl Record for u32 {
    fn size(&self) -> usize {
        4
    }
    fn write(&self, out: &mut [u8]) {
        out.copy_from_slice(&self.to_le_bytes());
    }
}

// TODO: A safe `impl Record` that makes `write_record` cause UB.

fn main() {
    let mut buf = [0; 64];
    println!("{:?}", write_record(&42u32, &mut buf));
}
```

<details>

- **Goal:** `unsafe` code can't rely on a safe trait's docs: a lying safe impl
  leads to UB, and the code that trusted it is at fault.

- Hints:
  - Hint: `write_record` trusts one number from the impl. What does it do with
    that number?
  - Bigger hint: `fn size(&self) -> usize { 100 }` makes `write_record` write 36
    bytes past `buf`. That's a stack buffer overflow, from safe code.
  - Hint for "who's at fault": can safe code break a safe trait's documented
    rules? Recall `Eq`.
  - If they say "the impl broke the documented rule": is breaking a doc rule in
    safe code UB, or a logic bug?
  - Hint for the fixes: one changes `write_record`. The other changes what
    implementing `Record` promises.
  - Bigger hint: `std` has the same problem. `ExactSizeIterator::len` is safe
    and can lie. How does `TrustedLen` (unstable) solve it?
  - If they put "at most 64" in bold in the docs, or add a `debug_assert!`: does
    either one stop UB in a release build?
  - Ask: if `size` returns 100 but `write` does nothing, is it still UB? Yes:
    `get_unchecked_mut(..n)` with `n > 64` is UB the moment the slice is made.
    Nothing has to be written through it.

</details>
