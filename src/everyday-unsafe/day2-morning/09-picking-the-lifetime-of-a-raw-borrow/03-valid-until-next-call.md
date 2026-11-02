---
minutes: 2
---

# Valid Until the Next Call

- C docs: valid until the next call on `h`.
- First try: `&self` and `&'static CStr`.
- Which signature says "until the next call"?

```rust
use std::ffi::{CStr, c_char};

#[repr(C)]
pub struct RawHandle {
    _private: [u8; 0],
}

unsafe extern "C" {
    /// Returns a non-null C string that stays valid until the next call on `h`.
    fn lib_last_error(h: *mut RawHandle) -> *const c_char;
}

pub struct Handle {
    // Safety invariant: `raw` is a live handle from the C library.
    raw: *mut RawHandle,
}

impl Handle {
    pub fn last_error(&self) -> &'static CStr {
        // SAFETY: `self.raw` is live, by the invariant on `raw`.
        let p = unsafe { lib_last_error(self.raw) };
        // SAFETY: `p` is a non-null C string.
        unsafe { CStr::from_ptr(p) }
    }
}
```

<details>

- **Question:** students find the signature that means "valid until the next
  call": `&mut self -> &CStr`. The answer is on the next slide.

- Story 3.10. The C docs say "valid until the next call". The task is to spell
  that in a lifetime.
- Ask: "What's wrong with this signature? What should it be?" Let the class try
  `&'static`, then `&self -> &CStr`, then `&mut self -> &CStr`. The next slide
  has the answer.
- Expected: `&mut self -> &CStr`.
- Usual wrong answer: `&self -> &CStr`. It ties the result to the handle, but a
  second call can still happen while the first result is borrowed.

</details>
