
# Solution

- A closure that removes one element and then panics causes a double drop.
- Fix: `set_len(0)` before the loop. A panic now leaks.

```rust,editable
use std::ptr;

/// Removes every element for which `remove` returns `true`, keeping order.
pub fn remove_where<T>(v: &mut Vec<T>, mut remove: impl FnMut(&T) -> bool) {
    let len = v.len();
    // SAFETY: There are no elements in `0..0`. From here on, a panic in
    // `remove` leaks the elements instead of dropping any of them twice.
    unsafe { v.set_len(0) };
    let p = v.as_mut_ptr();
    let mut kept = 0;
    for i in 0..len {
        // SAFETY: `i < len`, and slot `i` holds an initialized `T` that
        // hasn't been dropped or moved yet.
        if remove(unsafe { &*p.add(i) }) {
            // SAFETY: Slot `i` is initialized, and nothing reads it again.
            unsafe { ptr::drop_in_place(p.add(i)) };
        } else {
            // SAFETY: `kept <= i`, and slot `kept` was dropped or moved out.
            // After this, slot `i` counts as moved out.
            unsafe { ptr::copy(p.add(i), p.add(kept), 1) };
            kept += 1;
        }
    }
    // SAFETY: Slots `0..kept` are initialized, and `kept <= len <= capacity`.
    unsafe { v.set_len(kept) };
}

fn main() {
    let mut v = vec!["a".to_string(), "b".to_string(), "c".to_string()];
    // Before the fix: removes "a", panics on "b", and the `Vec` drops "a"
    // again during unwinding. Now it leaks "b" and "c" instead.
    remove_where(&mut v, |s| if s == "b" { panic!("bad input") } else { s == "a" });
}
```

<details>

- **Answer:** a closure that removes one element and then panics causes a double
  drop; fix it with `set_len(0)` before the loop.

- A panic on element `i` leaves the `Vec`'s length at `len`. Slots that were
  dropped get dropped again, and slots that were copied down exist twice.
  - Usual wrong answer: "the caller's closure is at fault." Panicking is safe,
    so `remove_where`, a safe function, must handle it.
  - What isn't a fix: a doc comment saying "`remove` must not panic". Safe
    callers don't have to read it.
  - What isn't a fix: moving the final `set_len` earlier in the loop body. The
    length must be correct at _every_ call to `remove`.
  - `T: Copy` is sound but changes the API. Ask whether that's acceptable.
- The guard: the same `SetLenOnDrop` as slide 05, with `kept` in the guard. On a
  panic, it keeps slots `0..kept` and leaks the unread tail.
- The `SAFETY:` comment on the line before the panic point should say what state
  a panic leaves behind.

</details>
