---
minutes: 0
---

# Exercise: A Panicking Predicate

- Write a safe `main` that makes `remove_where` drop a `String` twice.
- Fix it so a panic leaks instead.
- Bonus: use a guard so a panic keeps the elements kept so far.

```rust,editable
use std::ptr;

/// Removes every element for which `remove` returns `true`, keeping order.
pub fn remove_where<T>(v: &mut Vec<T>, mut remove: impl FnMut(&T) -> bool) {
    let len = v.len();
    let p = v.as_mut_ptr();
    let mut kept = 0;
    for i in 0..len {
        // SAFETY: `i < len`, so slot `i` holds an initialized `T`.
        if remove(unsafe { &*p.add(i) }) {
            // SAFETY: Slot `i` is initialized, and nothing reads it again.
            unsafe { ptr::drop_in_place(p.add(i)) };
        } else {
            // SAFETY: `kept <= i`, and slot `kept` was dropped or moved out.
            unsafe { ptr::copy(p.add(i), p.add(kept), 1) };
            kept += 1;
        }
    }
    // SAFETY: Slots `0..kept` are initialized, and `kept <= len`.
    unsafe { v.set_len(kept) };
}

fn main() {
    todo!("call `remove_where` with a closure that panics")
}
```

<details>

- **Goal:** a safe function must survive its closure panicking: leak, or use a guard, but never drop twice.

- Hints:
  - Hint: while `remove` runs, what does `v.len()` say? What does the `Vec`
    drop when a panic unwinds through `remove_where`?
  - Bigger hint: a closure that removes `"a"`, then panics on `"b"`.
  - If they say "the caller's closure is at fault": is panicking safe? Then
    which function must handle it?
  - If they add a doc comment saying "`remove` must not panic": do safe
    callers have to read it?
  - If they move the final `set_len` into the loop body: is the length right
    at *every* call to `remove`?
  - If they add `T: Copy`: ask whether changing the API is acceptable.

</details>
