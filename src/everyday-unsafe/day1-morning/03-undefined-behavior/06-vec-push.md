---
minutes: 3
---

# Why UB Exists: `Vec::push`

- `push` writes through `ptr`, unchecked.
- Java checks for null on every store.
- Rust doesn't: it's UB, not an exception.

```rust,ignore,editable
pub fn push(&mut self, value: T) {
    if self.len == self.cap {
        self.grow(); // Afterward, `len < cap`.
    }
    // SAFETY: `len < cap`, so slot `len` is inside the allocation.
    unsafe { self.ptr.as_ptr().add(self.len).write(value) };
    self.len += 1;
}
```

<details>

- **Point:** UB is what lets Rust skip checks: `push` writes through its pointer
  with no null check, where Java has to check every store.

- Introduce `Vec` as the running example. We'll open it up in
  [Operation vs Interface](../07-operation-vs-interface.md).
- Java defines what happens on a null or out-of-bounds store: an exception. So
  the runtime has to check, every time.
- Rust says those cases are UB, so it doesn't have to check. `push` keeps
  `len < cap` itself, and pays for nothing else.
- The rules behind UB are what pay for zero-cost code like this.

</details>
