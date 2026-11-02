
# Solution

- A panicking `f` causes a double drop. With `n > len`, `set_len` also breaks
  its contract on every call.
- Fix: `set_len(0)` first, and the real length last. A panic now leaks.

```rust,editable
use std::ptr;

/// Inserts `n` new elements, made by calling `f`, at the front of `v`.
pub fn prepend_with<T>(v: &mut Vec<T>, n: usize, mut f: impl FnMut() -> T) {
    let len = v.len();
    v.reserve(n);
    // SAFETY: `0 <= capacity`, and there are no elements in `0..0`. From here
    // on, a panic in `f` leaks the elements instead of dropping them twice.
    unsafe { v.set_len(0) };
    let p = v.as_mut_ptr();
    // SAFETY: The capacity is at least `len + n`, so both ranges fit.
    unsafe { ptr::copy(p, p.add(n), len) };
    for i in 0..n {
        // SAFETY: `i < n <= capacity`.
        unsafe { p.add(i).write(f()) };
    }
    // SAFETY: `len + n <= capacity`. Slots `0..n` were written by the loop,
    // and slots `n..len + n` hold the old elements.
    unsafe { v.set_len(len + n) };
}

/// The same, with no `unsafe`. `splice` handles a panicking `f`.
pub fn prepend_with_splice<T>(v: &mut Vec<T>, n: usize, f: impl FnMut() -> T) {
    v.splice(0..0, std::iter::repeat_with(f).take(n));
}

fn main() {
    let mut w = vec![1, 2];
    prepend_with(&mut w, 2, || 0);
    prepend_with_splice(&mut w, 1, || 9);
    assert_eq!(w, [9, 0, 0, 1, 2]);
}
```

<details>

- **Answer:** a panicking `f` causes a double drop, and with `n > len` `set_len`
  breaks its contract anyway. Fix: `set_len(0)` first and the real length last,
  or use `splice`.

- with the fix, a panic in `f` leaks every element. Leaking is safe; Day 2's
  Panics, Leaks, and Drop section shows a guard that drops them instead.
- Miri reports the double drop in the original, and the leak in the fix. It
  doesn't report the early `set_len` when nothing panics. The contract still
  says it's wrong.
- Empty `v`, `n = 0`, and `T = ()` are fine. `n = usize::MAX` panics in
  `reserve` ("capacity overflow") before any `unsafe` runs. A panic is not UB.
- The false comment: "Slots `0..n` are filled below." It cites a later write as
  evidence. With `n > len`, some of the new elements `len..len + n` are
  uninitialized at the call: the `read()` buffer bug again, even if nothing
  panics.
- With `n <= len`, `set_len`'s bullets hold, but slots `0..n` are copies of
  elements that also live further along. A panic exposes it: with
  `["a", "b", "c"]` and `n = 1`, the slots are `[a, a, b, c]` when `f` panics,
  and unwinding drops `a` twice.
- Not a fix: moving `set_len(len + n)` after the loop. A panic then leaves
  length 3 and slots `[a, a, b]`: still a double drop.
- Not a fix: "`f` must not panic" in the docs. `f` is the caller's safe code.

</details>
