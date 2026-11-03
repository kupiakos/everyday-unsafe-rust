---
minutes: 10
---

# Exercise: The Last Error

- Write a safe `main` that prints an error message after the C library freed
  that message.
- Change `last_error`'s signature so your `main` doesn't compile.
- Why isn't `&self` enough?

```rust,editable
#![allow(unreachable_code, unused_variables)]
use std::ffi::{CStr, CString, c_char};

// Simulated C library. Docs: "`lib_last_error` returns a string that stays
// valid until the next call on the same handle."
pub struct RawHandle {
    err: CString,
}
unsafe fn lib_connect(h: *mut RawHandle, port: u16) -> bool {
    // Assigning drops, and frees, the old message.
    unsafe { (*h).err = CString::new(format!("port {port}: refused")).unwrap() };
    false
}
unsafe fn lib_last_error(h: *mut RawHandle) -> *const c_char {
    unsafe { (*h).err.as_ptr() }
}

pub struct Client {
    // Safety invariant: until `drop`, `raw` is valid for aligned reads and
    // writes of a `RawHandle`, may be passed to `Box::from_raw`, and nothing
    // outside `Client` uses it.
    raw: *mut RawHandle,
}

impl Client {
    pub fn new() -> Self {
        let raw = Box::new(RawHandle { err: CString::default() });
        Client { raw: Box::into_raw(raw) }
    }
    pub fn connect(&self, port: u16) -> bool {
        // SAFETY: `raw` is valid for reads and writes, by its invariant.
        unsafe { lib_connect(self.raw, port) }
    }
    pub fn last_error(&self) -> &'static str {
        // SAFETY: `raw` is valid for reads and writes, by its invariant.
        let p = unsafe { lib_last_error(self.raw) };
        // SAFETY: `p` is a valid C string.
        unsafe { CStr::from_ptr(p) }.to_str().unwrap_or("(not UTF-8)")
    }
}

impl Drop for Client {
    fn drop(&mut self) {
        // SAFETY: `raw` may be passed to `Box::from_raw`, by its invariant,
        // and this is its last use.
        drop(unsafe { Box::from_raw(self.raw) });
    }
}

fn main() {
    let c = Client::new();
    todo!("print a message after the C library freed it")
}
```

<details>

- **Goal:** turning "valid until the next call" into `&mut self`, after writing
  the safe caller that breaks `&'static`.

- Do this exercise first. Short on time: skip
  [The Wrong Input](02-the-wrong-input.md).

- Hints:
  - Hint: what does `connect` do to the old message? Can you call it while you
    hold the result of `last_error`?
  - Bigger hint: the hostile caller:
    `let e = c.last_error(); c.connect(443);
    println!("{e}");`. Or return
    `e` from a block that drops `c`.
  - If they change it to `-> &str` with `&self`: which of the two hostile
    callers still compiles?
  - If they add a doc comment saying "don't keep the result": is `last_error` a
    safe function?

</details>
