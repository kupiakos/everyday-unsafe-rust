---
minutes: 3
---

# Why Raw Pointers Opt Out

- Raw pointers are
  [neither `Send`](https://doc.rust-lang.org/std/marker/trait.Send.html#impl-Send-for-*const+T)
  nor `Sync`.
- So C wrappers start out `!Send` and `!Sync`.
- The compiler can't read the C docs.

```rust,compile_fail,editable
use std::ffi::c_void;
use std::thread;

/// C docs: "A parser may be used from any thread, but by one thread at a time."
pub struct Parser {
    raw: *mut c_void, // Raw pointers make `Parser` `!Send` and `!Sync`.
}

impl Parser {
    pub fn feed(&mut self, _input: &str) { /* C call using `self.raw` */
    }
}

fn main() {
    let mut parser = Parser { raw: std::ptr::null_mut() };
    // Error: `*mut c_void` cannot be sent between threads safely.
    thread::spawn(move || parser.feed("GET / HTTP/1.1"));
}
```

<details>

- **Point:** raw pointers make a C wrapper `!Send` and `!Sync`, and only you can
  read the C docs to opt in.

- Your wrapper around a C parser won't compile inside a thread pool.
- The compiler doesn't know what a raw pointer points to, or who else holds it.
  `!Send` and `!Sync` is the conservative default.
- The thread-safety facts live in the C library's docs. Only you can read them,
  so opting in takes `unsafe impl`.

</details>
