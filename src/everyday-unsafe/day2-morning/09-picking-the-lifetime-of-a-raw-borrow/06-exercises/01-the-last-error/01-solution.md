
# Solution

- `&'static str` lets safe code keep the message past the next call.
- `&mut self` makes "until the next call" a borrow the compiler checks.

```rust,editable
use std::ffi::{CStr, CString, c_char};

pub struct RawHandle {
    err: CString,
}
unsafe fn lib_connect(h: *mut RawHandle, port: u16) -> bool {
    unsafe { (*h).err = CString::new(format!("port {port}: refused")).unwrap() };
    false
}
unsafe fn lib_last_error(h: *mut RawHandle) -> *const c_char {
    unsafe { (*h).err.as_ptr() }
}

pub struct Client {
    // Safety invariant: `raw` came from `Box::into_raw`. Only `Drop` frees it.
    raw: *mut RawHandle,
}

impl Client {
    pub fn new() -> Self {
        let raw = Box::new(RawHandle { err: CString::default() });
        Client { raw: Box::into_raw(raw) }
    }
    pub fn connect(&self, port: u16) -> bool {
        // SAFETY: `raw` is live, by the invariant on `raw`.
        unsafe { lib_connect(self.raw, port) }
    }
    pub fn last_error(&mut self) -> &str {
        // SAFETY: `raw` is live, by the invariant on `raw`.
        let p = unsafe { lib_last_error(self.raw) };
        // SAFETY: `p` is a C string, valid until the next call on the handle.
        // The result borrows `self` mutably, so no such call can happen, and
        // `self` can't be dropped, while it's alive.
        unsafe { CStr::from_ptr(p) }.to_str().unwrap_or("(not UTF-8)")
    }
}

impl Drop for Client {
    fn drop(&mut self) {
        // SAFETY: By the invariant on `raw`, nothing else frees it.
        drop(unsafe { Box::from_raw(self.raw) });
    }
}

fn main() {
    let mut c = Client::new();
    c.connect(80);
    let e = c.last_error().to_owned(); // Copy it out to keep it.
    c.connect(443); // Before the fix, this could free a borrowed `&'static str`.
    println!("{e}");
}
```

<details>

- **Answer:** `last_error(&mut self) -> &str`; with `&self`, `connect` can still run while the result is borrowed.

- First fix students try: `-> &str` with `&self`. That stops the
  drop-in-a-block caller, but `connect(&self)` can still run while `e` is
  borrowed.
- `&mut self` works: while the result is borrowed, no other method on `c`
  can be called.
- Also a fix: return a `String`. One copy, and no lifetime at all.
- What isn't a fix: a doc comment saying "don't keep the result". It's a
  safe function.
- with `&mut self`, `c.last_error()` followed by `c.connect(443)`
  while the result is alive is a borrow error, even though `connect` takes
  `&self`.

</details>
