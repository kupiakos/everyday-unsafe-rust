---
minutes: 3
---

# Time Travel

- The check runs first.
- The compiler deletes it anyway.
- UB affects code before it, too.

```rust
pub fn digit_value(c: u8) -> u8 {
    if c.is_ascii_digit() {
        c - b'0'
    } else {
        // SAFETY: (wrong) "callers only ever pass digits".
        unsafe { std::hint::unreachable_unchecked() }
    }
}
// The compiler may delete the `is_ascii_digit` check entirely, so
// `digit_value(b'x')` silently returns garbage instead of reaching the
// "impossible" branch.
```

<details>

- **Point:** UB affects code before it too: an `unreachable_unchecked` branch
  lets the compiler delete the check that guards it.

- The compiler's reasoning: the `else` branch is UB, so it never runs, so the
  `if` is always true, so the check is dead code.
- C++ developers may know this from Raymond Chen's "Undefined behavior can
  result in time travel".
- Usual wrong answer: "at least it hits the `unreachable` and crashes". There's
  nothing to hit: the branch may not exist in the binary.
- `digit_value` is also unsound: it's a safe `fn`, and `digit_value(b'x')` is
  safe code. More on that in "Unsafe vs Unsound".

</details>
