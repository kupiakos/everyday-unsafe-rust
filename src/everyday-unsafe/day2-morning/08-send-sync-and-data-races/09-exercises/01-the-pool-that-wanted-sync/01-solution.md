
# Solution

- The C docs justify `Send` only.
- Share handles through a `Mutex`: `Mutex<Db>` is `Sync` because `Db: Send`.

```rust,editable
use std::ffi::c_void;
use std::sync::Mutex;
use std::thread;

fn db_open() -> *mut c_void {
    Box::into_raw(Box::new(0u64)).cast()
}
unsafe fn db_query(h: *mut c_void) -> u64 {
    let n = unsafe { &mut *h.cast::<u64>() };
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

// SAFETY: The C docs allow a handle to be used, and closed, from any thread,
// one thread at a time. `Db` owns `raw`, so moving a `Db` moves the only path
// to the handle. `Db` isn't `Sync`, so no two threads use it at once.
unsafe impl Send for Db {}

fn main() {
    let pool: Vec<Mutex<Db>> = vec![Mutex::new(Db::open()), Mutex::new(Db::open())];
    thread::scope(|s| {
        for _ in 0..4 {
            s.spawn(|| pool[0].lock().unwrap().query());
        }
    });
}
```

<details>

- **Answer:** keep only `Send`, and share handles as `Mutex<Db>`.

- "any thread, one at a time" justifies `Send`. `Sync` would allow
  `query(&self)` from two threads at once, which the docs forbid.
  - The fix students reach for: make `query` take `&mut self`. That works
    too: a `&Db` then can't call into C, so `Sync` would be sound. But
    everything then needs `&mut`.
  - The usual fix: `Vec<Mutex<Db>>`. `Mutex<T>` is `Sync` when `T: Send`.
  - Usual wrong answer: "`Sync` is harmless, our pool never shares a handle."
    An `unsafe impl` is a promise about every safe caller.
  - `db_close` from any thread matters too: `Drop` may run on whichever
    thread last owns the `Db`.
- the `SAFETY:` comment ends with "isn't `Sync`". It depends on
  nobody adding that impl later, and says so.

</details>
