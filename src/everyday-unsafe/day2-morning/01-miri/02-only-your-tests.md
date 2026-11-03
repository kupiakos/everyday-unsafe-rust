---
minutes: 4
---

# Miri Only Checks Your Tests

- No: `third(&[10, 20])` reads past the end.
- Miri checks the run it sees: these inputs, these paths.
- It can't run C, though [BorrowSanitizer](https://borrowsanitizer.com) can!
- A clean run isn't a proof. The `SAFETY:` comment is.

```rust,editable
/// Returns the third element of `v`.
pub fn third(v: &[u32]) -> u32 {
    // SAFETY: The tests pass under Miri.
    unsafe { v.as_ptr().add(2).read() }
}

fn main() {
    println!("{}", third(&[10, 20]));
}
```

<details>

- **Answer:** no, `third(&[10, 20])` reads past the end, then the takeaway: Miri
  finds UB in the runs you give it. A clean run doesn't prove soundness. The
  `SAFETY:` comment has to.

- Press Run: it prints whatever is after the two elements. A local debug build
  printed `655808`. Then press Miri: "memory access failed: attempting to access
  4 bytes, but got ... which is at or beyond the end of the allocation of size 8
  bytes".
- A safe `fn` must be
  [sound for every safe caller](../../day1-afternoon/06-sound-for-every-safe-caller.md).
  The test tried one.
- Miri's README says it directly: "When Miri finds UB, your code is definitely
  unsound, but when Miri does not find UB, then you may just have to test more
  inputs or more possible non-deterministic choices."
  ([Miri README](https://github.com/rust-lang/miri#miri))
- What Miri can't see: inputs nobody tried, paths that didn't run, thread orders
  it didn't pick, and C code. A call into C stops Miri with "can't call foreign
  function". The
  [`qsort_r` solution](../../day2-afternoon/05-ffi/06-exercises/01-wrap-qsort-r/01-solution.md)
  swaps in a Rust sort under `cfg(miri)` for that reason.
- So "the tests pass under Miri" is never a proof. A proof names the contract
  and why it holds: `read()` needs a third element, `v.len() >= 3`, and nothing
  checks it.
- Fixes: check the length (`v.get(2).copied()`, returning `Option<u32>`), or
  make `third` an `unsafe fn` with a `# Safety` section. Same two fixes as
  [Write the Fourth Test](../../day1-morning/05-unsafe-vs-unsound/08-exercises/02-write-the-fourth-test/01-solution.md).
- Use both: write the proof, then run the tests under Miri to find where it's
  wrong.

</details>
