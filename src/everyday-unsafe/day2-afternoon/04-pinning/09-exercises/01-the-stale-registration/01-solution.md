
# Solution

- `return w` moved the `Widget` after it registered its address.
- Pin it on the heap first, then register: the address can't change.
- Keep `Drop`: it deregisters before the box is freed.

```rust,editable
use std::cell::{Cell, RefCell};
use std::marker::PhantomPinned;
use std::pin::Pin;

/// An observer list that keeps raw addresses, like a C++ one keeps `this`.
#[derive(Default)]
pub struct Registry {
    // Safety invariant: each pointer points to the `hits` of a live, pinned
    // `Widget`.
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
    _pin: PhantomPinned, // Not `Unpin`: `Pin` never hands out `&mut Widget`.
}

impl<'r> Widget<'r> {
    pub fn new(reg: &'r Registry) -> Pin<Box<Self>> {
        let w = Box::pin(Widget { reg, hits: Cell::new(0), _pin: PhantomPinned });
        // Maintains the invariant on `hits`: `w` is pinned, so it stays at
        // this address until `drop` removes it.
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
    let a = Widget::new(&reg);
    let b = Widget::new(&reg);
    let moved = a; // Moves the `Box`, not the `Widget`.
    reg.notify_all();
    drop(b);
    reg.notify_all();
    std::mem::forget(Widget::new(&reg)); // A leak: the address stays valid.
    reg.notify_all();
    assert_eq!(moved.hits(), 3);
}
```

### Stretch Goal: On the Stack

- `new` can't return a value pinned in its own frame, so the caller provides the
  place: a pinned `Option` slot, made with `pin!`.
- `new_in` fills the slot, then registers it. The `Option` drops the `Widget`,
  so `Drop` still deregisters.

```rust,editable
use std::cell::{Cell, RefCell};
use std::marker::PhantomPinned;
use std::pin::{Pin, pin};

#[derive(Default)]
pub struct Registry {
    // Safety invariant: each pointer points to the `hits` of a live, pinned
    // `Widget`.
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
    _pin: PhantomPinned,
}

impl<'r> Widget<'r> {
    /// Makes a `Widget` in a pinned `slot`, and registers it there.
    pub fn new_in<'s>(
        reg: &'r Registry,
        mut slot: Pin<&'s mut Option<Self>>,
    ) -> Pin<&'s Self> {
        slot.set(Some(Widget { reg, hits: Cell::new(0), _pin: PhantomPinned }));
        let w = slot.into_ref().as_pin_ref().unwrap();
        // Maintains the invariant on `hits`: `w` is pinned, so it stays at
        // this address until `drop` removes it.
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
    {
        let slot = pin!(None); // A pinned stack slot.
        let w = Widget::new_in(&reg, slot);
        reg.notify_all();
        assert_eq!(w.hits(), 1);
    } // The `Widget` drops here, and deregisters.
    reg.notify_all();
}
```

<details>

- **Answer:** `return w` moved the `Widget` after it registered. Return
  `Pin<Box<Widget>>` with `PhantomPinned`, pin before registering, and keep
  `Drop`.

- every way to get a `Widget` now goes through `new`, which pins it before
  registering it. That's what makes the invariant on `hits` hold.
- `main` moves `a` freely. Moving a `Pin<Box<_>>` moves the pointer.
- the UB line is `reg.notify_all();`: it writes through the address of `new`'s
  dead local. `vec.push(Widget::new(&reg))` is another move.
  - Usual wrong answer: "`Drop` removes it." `Drop` runs once, at the new
    address, and removes the new address. The stale one stays forever. A
    moved-from value has no destructor.
  - Not a fix: `Box<Widget>`. It hands out `&mut Widget`, so `*b` or
    `mem::replace` moves it again. Not a fix either: registering before
    `Box::pin`, which moves the value into the box.
  - `PhantomPinned` is required: without it, `Widget` is `Unpin`, and
    `Pin<Box<Widget>>` hands out `&mut Widget` too.
  - `Drop` is still needed: `Pin` keeps the memory in place until `drop` runs,
    and `drop` must deregister before the box is freed. `mem::forget` leaks the
    box, so the address stays valid: a leak, not UB.
  - `Widget` can't move to another thread: `&Registry` isn't `Send`, because
    `RefCell` isn't `Sync`.
- Stretch goal: `pin!` owns the slot, so nobody can name it and move it. When
  the slot goes out of scope, the `Option` drops the `Widget`, and `Drop`
  deregisters it. That's the
  [pin drop guarantee](https://doc.rust-lang.org/std/pin/index.html#drop-guarantee)
  doing the work.
  - Not a fix: a `MaybeUninit<Widget>` slot. It never drops its contents, so
    nothing deregisters the `Widget`, and the registry keeps a dangling pointer:
    UB from safe code. That's why `pin-init` and `moveit` use slot types that do
    drop.
  - Calling `new_in` twice on one slot is fine: `set` drops the old `Widget`,
    which deregisters it first.

</details>
