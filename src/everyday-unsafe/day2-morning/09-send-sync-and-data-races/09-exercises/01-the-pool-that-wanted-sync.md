---
minutes: 10
---

# Exercise: The Pool That Wanted `Sync`

- Read the C docs. Which `unsafe impl` do they justify? Write its `SAFETY:`.
- Delete the other one.
- Make `main` compile again, with no new `unsafe`.

```rust,editable
#![allow(dead_code)]
use std::ffi::c_void;
use std::thread;

// Simulated C library. Docs: "A handle may be used from any thread, but never
// from two threads at the same time. `db_close` may be called on any thread."
fn db_open() -> *mut c_void {
    Box::into_raw(Box::new(0u64)).cast()
}
unsafe fn db_query(h: *mut c_void) -> u64 {
    let n = unsafe { &mut *h.cast::<u64>() }; // Not thread-safe.
    *n += 1;
    *n
}
unsafe fn db_close(h: *mut c_void) {
    drop(unsafe { Box::from_raw(h.cast::<u64>()) });
}

pub struct Db {
    // Safety invariant: `raw` is an open handle, owned by this `Db`.
    raw: *mut c_void,
}

impl Db {
    pub fn open() -> Db {
        Db { raw: db_open() }
    }
    pub fn query(&self) -> u64 {
        // SAFETY: `raw` is open, by the invariant on `raw`.
        unsafe { db_query(self.raw) }
    }
}

impl Drop for Db {
    fn drop(&mut self) {
        // SAFETY: `raw` is open, and this `Db` owns it.
        unsafe { db_close(self.raw) }
    }
}

// Added "to make the pool happy".
unsafe impl Send for Db {}
unsafe impl Sync for Db {}

fn main() {
    let pool: Vec<Db> = vec![Db::open(), Db::open()];
    thread::scope(|s| {
        for _ in 0..4 {
            s.spawn(|| pool[0].query());
        }
    });
}
```

<details>

- **Goal:** C docs that say "one thread at a time" justify `Send` but not
  `Sync`, so sharing goes through a `Mutex`.

- "A `Job` for the Pool" is in Bonus Exercises at the end of the day, for
  students who want more.

- Hints:
  - Hint: which trait means "may move to another thread", and which means "may
    be used from two threads at once"? Which one do the docs allow?
  - If they make `query` take `&mut self`: does it work? What does every caller
    need then?
  - If stuck on `main`: which `std` type makes a `Send` type `Sync`?
  - If they say "`Sync` is harmless, our pool never shares a handle": who does
    an `unsafe impl` make a promise to?
  - Ask: on which thread does `Drop` run?

</details>
