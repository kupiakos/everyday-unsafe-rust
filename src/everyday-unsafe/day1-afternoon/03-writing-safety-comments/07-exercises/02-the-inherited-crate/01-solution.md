
# Solution

- Blocks 1 and 2: the checks above them.
- Block 3 can't be justified: it's the bug. Use `str::from_utf8`.

```rust,editable
/// Returns the name in a record: one length byte, then that many bytes of
/// UTF-8 name. Records come from a file on disk.
pub fn record_name(rec: &[u8]) -> Option<&str> {
    if rec.is_empty() {
        return None;
    }
    // SAFETY: `get_unchecked` requires `0 < rec.len()`. Checked just above.
    let len = unsafe { *rec.get_unchecked(0) } as usize;
    if rec.len() < 1 + len {
        return None;
    }
    // SAFETY: `get_unchecked` requires `1 + len <= rec.len()`. Checked just
    // above, and `1 + len <= 256` can't overflow.
    let name = unsafe { rec.get_unchecked(1..1 + len) };
    // No `SAFETY:` comment is true here: the bytes come from a file, and
    // nothing checked them. Use the checked version.
    std::str::from_utf8(name).ok()
}

fn main() {
    println!("{:?}", record_name(b"\x05alice"));
    println!("{:?}", record_name(b"\x02\xff\xff"));
}
```

<details>

- **Answer:** blocks 1 and 2 are justified by the checks above them. Block 3 has
  no evidence, so use `str::from_utf8`.

- Blocks 1 and 2 are justified by the checks right above them. Block 2 also
  needs "`1 + len` can't overflow": `len` is at most 255.
- Block 3 has no evidence. A record like `[2, 0xFF, 0xFF]` makes a `&str` that
  isn't UTF-8.
- Usual wrong answer: "The file format says names are UTF-8." A file is input,
  not a contract. Another: "The caller passes a valid record." `record_name` is
  safe, so the caller promised nothing.
- Not a fix: a doc comment saying "`rec` must hold UTF-8" on a safe `fn`. Fix:
  `str::from_utf8(name).ok()`.
- blocks 1 and 2 don't need `unsafe` either: `rec.first()?` and
  `rec.get(1..1 + len)?` do the same checks. Once each block has a proof, ask
  whether the `unsafe` still earns its place.
- the alternative is an `unsafe fn` whose `# Safety` says the name must be
  UTF-8. That moves the check to every caller, who also can't trust the file.

</details>
