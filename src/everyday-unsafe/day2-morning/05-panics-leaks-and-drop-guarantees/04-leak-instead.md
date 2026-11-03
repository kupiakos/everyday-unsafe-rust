---
minutes: 3
---

# Fix: Leak Instead

- [The Predicate That Panics](03-predicate-panics.md): the `Vec` drops moved-out
  slots again. A double drop.
- At fault: `retain_in_place`. Panicking is safe.
- Fix: set the length to 0 first.
- A panic now leaks, which is safe. Nothing drops twice.

```rust,editable
pub fn retain_in_place<T>(v: &mut Vec<T>, mut keep: impl FnMut(&T) -> bool) {
    let len = v.len();
    // SAFETY: `0 <= capacity`, and there are no elements in `0..0`.
    // From here on, a panic leaks the elements instead of dropping them twice.
    unsafe { v.set_len(0) };
    let p = v.as_mut_ptr();
    let mut kept = 0;
    for i in 0..len {
        // SAFETY: `i < len`, and slot `i` holds an initialized `T` that
        // hasn't been read yet. After this, slot `i` counts as moved out.
        let item = unsafe { p.add(i).read() };
        if keep(&item) {
            // SAFETY: `kept <= i`, and slot `kept` was already moved out.
            unsafe { p.add(kept).write(item) };
            kept += 1;
        }
    }
    // SAFETY: slots `0..kept` are initialized, and `kept <= len <= capacity`.
    unsafe { v.set_len(kept) };
}
```

<details>

- **Answer:** the `Vec` drops moved-out slots again and `retain_in_place` is at
  fault, then: `set_len(0)` first, so a panic leaks instead.

- Answer to the question on [The Predicate That Panics](03-predicate-panics.md):
  unwinding drops `item`, and then the caller's `Vec`, still `len` long, drops
  every slot again, including the moved-out ones. `retain_in_place` is at fault,
  not the closure.
- One change: `set_len(0)` before the loop. If `keep` panics, the `Vec` owns no
  elements, so it drops none.
- The kept elements and the unread tail leak. That wastes memory, but it isn't
  UB.
- The `SAFETY:` comment on `read` now says what state it leaves behind.
- `std`'s `Vec::drain` uses the same trick: it shortens the `Vec` first.
- Ask: "Is leaking OK in a long-running server?" It's a bug, but a safe one.
  [Fix: A Guard](05-guard.md) does better.

</details>
