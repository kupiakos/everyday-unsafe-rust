---
minutes: 1
---

# Until It's Dropped

- Pinned memory
  [stays valid until `drop` runs](https://doc.rust-lang.org/std/pin/index.html#drop-guarantee).
- Freeing or reusing it without `drop` breaks the promise.
- What if `drop` never runs?

```rust,editable
use std::marker::PhantomPinned;

struct Registered {
    id: u32,
    _pin: PhantomPinned,
}

impl Drop for Registered {
    fn drop(&mut self) {
        // C++: `~Widget() { reg->remove(this); }`
        println!("unregister {}", self.id);
    }
}

fn main() {
    let a = Box::pin(Registered { id: 1, _pin: PhantomPinned });
    drop(a); // Fine: `drop` unregisters, then the memory is freed.

    let b = Box::pin(Registered { id: 2, _pin: PhantomPinned });
    std::mem::forget(b); // A bug?
}
```

<details>

- **Question:** students decide whether `mem::forget` on a pinned value is a
  bug: a leak, not UB. The answer is on
  [Leaking Is Fine](08-leaking-is-fine.md).

- Until when? From the moment it's pinned until its destructor runs. This is
  [`Pin`'s drop guarantee](https://doc.rust-lang.org/std/pin/index.html#drop-guarantee).
- That's what makes registering `this` work: whatever holds the address can
  count on the destructor running before the memory is reused.
- Ask: "Is `mem::forget` on a pinned value a bug?" Expected answer: a leak, not
  UB. The memory is never freed, so a registered address stays valid.
- Usual wrong answer: "UB: `Pin` promises that `drop` runs." It promises `drop`
  runs before the memory is reused, and leaked memory never is.
- Hint if the class is stuck: recall
  [Leaking Is Safe](../../day2-morning/05-panics-leaks-and-drop-guarantees/01-leaking-is-safe.md).
  Is `mem::forget` `unsafe`?

</details>
