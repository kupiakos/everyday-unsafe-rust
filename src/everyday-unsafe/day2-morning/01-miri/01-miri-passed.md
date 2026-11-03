---
minutes: 2
---

# Miri Passed

- `third` has one test, and it passes under Miri.
- Is `third` sound?

```rust,editable
/// Returns the third element of `v`.
pub fn third(v: &[u32]) -> u32 {
    // SAFETY: The tests pass under Miri.
    unsafe { v.as_ptr().add(2).read() }
}

#[test]
fn three_elements() {
    assert_eq!(third(&[10, 20, 30]), 30);
}
```

<details>

- **Question:** students work out that a clean Miri run doesn't make `third`
  sound. The answer is on [Miri Only Checks Your Tests](02-only-your-tests.md).

- Press Miri: the test passes.
- Ask: "Is `third` sound?" Then: "Is that `SAFETY:` comment a proof?"
- Usual wrong answer: "Miri would have caught it."
- Hint if needed: what does `third` need from `v`? Who checks it?
- Same lesson as
  [Write the Fourth Test](../../day1-morning/05-unsafe-vs-unsound/08-exercises/02-write-the-fourth-test.md)
  (green tests don't prove soundness), now with Miri in the loop.

</details>
