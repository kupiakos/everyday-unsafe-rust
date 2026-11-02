---
minutes: 15
---

# Exercise: Write the Fourth Test

- All three tests pass. Replace the `todo!` in `causes_ub`.
- Who's at fault: your test, or `payload`?
- Fix the bug - there are two main ways

```rust,editable
/// Returns the payload of a message: one length byte, then the payload.
pub fn payload(msg: &[u8]) -> &[u8] {
    let len = usize::from(msg[0]);
    // SAFETY: The length byte says how long the payload is.
    unsafe { msg.get_unchecked(1..1 + len) }
}

#[test]
fn hello() {
    assert_eq!(payload(b"\x05hello"), b"hello");
}

#[test]
fn empty_payload() {
    assert_eq!(payload(&[0]), b"");
}

#[test]
#[should_panic]
fn empty_message() {
    payload(&[]);
}

#[test]
fn causes_ub() {
    todo!("call `payload` so that it causes UB");
}
```

<details>

- **Goal:** green tests don't prove soundness: a safe `fn` that trusts a length
  from its input is unsound, and it has two fixes: stay safe, or make it an
  `unsafe fn`.

- Hints:
  - Hint: the length comes from the message. Who checks it? Think Heartbleed.
  - Bigger hint: `payload(b"\x05hi")`.
  - Ask: does your new test fail? In a debug build, `std`'s optional checks may
    abort with "unsafe precondition(s) violated". In a release build, it can
    return `hi` plus 3 bytes of whatever comes next, and pass. Green tests don't
    prove there's no UB. `cargo miri test` reports it.
  - If they say "the test sent a bad message": what does a safe `fn` promise
    about its inputs?
  - Hint for the fixes: either `payload` checks the length byte, or its caller
    does. How would the signature say which?
  - If they add `assert!(!msg.is_empty())`: what does `msg[0]` already do on an
    empty message? What does `get_unchecked` actually require?
  - If this runs before the logger, keep the two fixes short: the logger covers
    them next.

</details>
