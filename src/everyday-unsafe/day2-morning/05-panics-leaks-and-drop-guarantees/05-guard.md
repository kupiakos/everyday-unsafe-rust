---
minutes: 4
---

# Fix: A Guard

- A guard's `Drop` runs during unwinding, too.
- It sets the length right.
- C++: RAII for exception safety.

```rust,editable
pub fn retain_in_place<T>(v: &mut Vec<T>, mut keep: impl FnMut(&T) -> bool) {
    // Its `Drop` runs on return *and* during unwinding.
    struct SetLenOnDrop<'a, T> {
        v: &'a mut Vec<T>,
        kept: usize, // Slots `0..kept` hold the kept elements.
    }
    impl<T> Drop for SetLenOnDrop<'_, T> {
        fn drop(&mut self) {
            // SAFETY: slots `0..kept` are initialized, and `kept <= capacity`.
            unsafe { self.v.set_len(self.kept) };
        }
    }

    let len = v.len();
    // SAFETY: `0 <= capacity`, and there are no elements in `0..0`. If the
    // guard never ran, we'd leak.
    unsafe { v.set_len(0) };
    let mut g = SetLenOnDrop { v, kept: 0 };
    let p = g.v.as_mut_ptr();
    for i in 0..len {
        // SAFETY: `i < len`, and slot `i` hasn't been read yet.
        let item = unsafe { p.add(i).read() };
        if keep(&item) {
            // SAFETY: `g.kept <= i`, and slot `g.kept` was already moved out.
            unsafe { p.add(g.kept).write(item) };
            g.kept += 1;
        }
    }
} // `g` is dropped here, or during unwinding, and sets the length.
```

<details>

- **Point:** a guard's `Drop` sets the length right even during unwinding, but
  the `set_len(0)` fallback is what keeps it sound.

- One change from [Fix: Leak Instead](04-leak-instead.md): the final `set_len`
  moved into a guard's `Drop`, so it also runs when `keep` panics.
- On a panic, the kept elements stay in the `Vec`. Only the unread tail leaks.
- `set_len(0)` stays as the fallback: the guard makes the result better, but
  soundness doesn't depend on it running. That's the point of
  [Don't Count on a Destructor](06-no-destructor.md).
- `std`'s `retain` works this way. Its guard also moves the unread tail down, so
  nothing leaks at all.

</details>
