
# Solution

- `payload(b"\x05hi")` reads 3 bytes past the end.
- At fault: `payload`. Its safe signature accepts any message.
- Fix 1 returns `None` for a bad length. Fix 2 hands the check to the caller.

```rust,editable
/// Fix 1: stay safe. A wrong length byte is an error, not UB.
pub fn payload(msg: &[u8]) -> Option<&[u8]> {
    let (&len, rest) = msg.split_first()?;
    rest.get(..usize::from(len))
}

/// Fix 2: an `unsafe fn`, for callers who already checked the message.
///
/// # Safety
///
/// The caller must ensure that the length byte `msg[0]` is less than
/// `msg.len()`.
pub unsafe fn payload_unchecked(msg: &[u8]) -> &[u8] {
    let len = usize::from(msg[0]); // Panics if `msg` is empty: not UB.
    // SAFETY: The caller guarantees `len < msg.len()`, so `1..1 + len` is in
    // bounds.
    unsafe { msg.get_unchecked(1..1 + len) }
}

#[test]
fn lying_length() {
    // With the original `payload`, this was UB: it read 3 bytes past the end.
    // Now it's an error.
    assert_eq!(payload(b"\x05hi"), None);
}
```

<details>

- **Answer:** `payload(b"\x05hi")` reads past the end and `payload` is at fault; fix it by returning `Option`, or with an `unsafe fn` and a `# Safety` section.

- the answer is `payload(b"\x05hi")`. A length from the message is
  trusted, just like Heartbleed.
  - Usual wrong answer: "the test sent a bad message". A safe `fn` promises any
    input is fine, so `payload` is at fault.
  - The two fixes: keep `payload` safe, or make it an `unsafe fn` with a
    `# Safety` section.
  - What isn't a fix: `assert!(!msg.is_empty())`. `msg[0]` already panics on an
    empty message. It's this example's null check: it checks the easy thing,
    not the requirement.
  - An `assert!` that checks the requirement, `1 + len <= msg.len()`, is a fix:
    it turns UB into a panic.
- for bytes from the network, use Fix 1. Fix 2 only makes sense when
  callers have already validated the message, and can say how in their
  `SAFETY:` comment.
- Fix 2 doesn't need "non-empty" in its `# Safety` section, because
  `msg[0]` panics first.

</details>
