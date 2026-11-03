---
minutes: 15
---

# Exercise: The Stale Registration

- `notify_all` relies on the invariant on `hits`.
- Add one line to `main` that makes it UB. Which line broke the invariant?\
  **Need a hint**? see the speaker notes.
- Fix it: make `Widget::new` return `Pin<Box<Widget>>`.
- Do you still need `Drop`? Is `mem::forget` a problem?
- **Stretch goal**: Soundly initialize `Widget` on the stack without spelling
  `unsafe` in `main`.

```rust,editable
use std::cell::{Cell, RefCell};

/// An observer list that keeps raw addresses, like a C++ one keeps `this`.
#[derive(Default)]
pub struct Registry {
    // Safety invariant: each pointer points to the `hits` of a live `Widget`.
    hits: RefCell<Vec<*const Cell<u32>>>,
}

impl Registry {
    pub fn notify_all(&self) {
        for &p in self.hits.borrow().iter() {
            // SAFETY: By the invariant on `hits`.
            let hits = unsafe { &*p };
            hits.set(hits.get() + 1);
        }
    }
}

pub struct Widget<'r> {
    reg: &'r Registry,
    hits: Cell<u32>,
}

impl<'r> Widget<'r> {
    pub fn new(reg: &'r Registry) -> Self {
        let w = Widget { reg, hits: Cell::new(0) };
        reg.hits.borrow_mut().push(&w.hits);
        w
    }

    pub fn hits(&self) -> u32 {
        self.hits.get()
    }
}

impl Drop for Widget<'_> {
    fn drop(&mut self) {
        let me: *const Cell<u32> = &self.hits;
        self.reg.hits.borrow_mut().retain(|&p| p != me);
    }
}

fn main() {
    let reg = Registry::default();
    let w = Widget::new(&reg);
    println!("{}", w.hits());
}
```

<details>

- **Goal:** see that a safe move breaks a safety invariant that holds raw
  addresses, and that pinning before registering restores it.

- [The Self-Referential Tokenizer](../../07-bonus-exercises/01-the-self-referential-tokenizer.md)
  is in [Bonus Exercises](../../07-bonus-exercises.md), for students who want
  more.

- Hints:
  - Hint: `return w` moves `w` out of `new`. What does the registry still point
    at? Which `Registry` method reads that pointer?
  - Bigger hint: add `reg.notify_all();` to `main`. It writes to `new`'s dead
    stack slot.
  - If they say "`Drop` removes it": how many times does `drop` run, and at
    which address?
  - If they reach for `Box<Widget>`: can safe code still move the `Widget` out
    of the box?
  - Stretch goal: `std::pin::pin!` pins on the stack without `unsafe`, but `new`
    can't return a value pinned in its own stack frame. What if the caller
    passes in the place to build it?

</details>
