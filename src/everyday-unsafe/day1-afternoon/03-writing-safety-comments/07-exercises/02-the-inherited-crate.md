---
minutes: 10
---

# Exercise: The Inherited Crate

- The author has been laid off. Add a `SAFETY:` comment to each `unsafe` block.
- Read each callee's `# Safety` first.
- Stuck on one? Find a record that causes UB, then fix the code.

```rust,editable
/// Returns the name in a record: one length byte, then that many bytes of
/// UTF-8 name. Records come from a file on disk.
pub fn record_name(rec: &[u8]) -> Option<&str> {
    if rec.is_empty() {
        return None;
    }
    let len = unsafe { *rec.get_unchecked(0) } as usize;
    if rec.len() < 1 + len {
        return None;
    }
    let name = unsafe { rec.get_unchecked(1..1 + len) };
    Some(unsafe { std::str::from_utf8_unchecked(name) })
}

fn main() {
    println!("{:?}", record_name(b"\x05alice"));
}
```

<details>

- **Goal:** justifying each `unsafe` block from the callee's `# Safety`, and
  spotting a precondition (UTF-8 bytes from a file) that nothing checks.

- Hints:
  - Hint: for each block, what does the callee require, and which line checks
    it?
  - Bigger hint for block 2: can `1 + len` overflow?
  - Hint: one block's requirement isn't checked anywhere in `record_name`.
  - Bigger hint: a record like `[2, 0xFF, 0xFF]` makes a `&str` that isn't
    UTF-8.
  - If they say "The file format says names are UTF-8": is a file a contract, or
    input?
  - If they say "The caller passes a valid record": what does the caller of a
    safe `fn` promise?
  - If they add a doc comment saying "`rec` must hold UTF-8": who has to read a
    safe `fn`'s docs?
  - If they're stuck on the fix: does `from_utf8_unchecked` have a checked
    version?
  - Nothing breaks when the bad `&str` is made. It breaks later, when something
    like `chars()` trusts it. Day 2 calls this a library invariant.

</details>
