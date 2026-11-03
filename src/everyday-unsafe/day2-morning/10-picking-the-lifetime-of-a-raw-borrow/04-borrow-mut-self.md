---
minutes: 2
---

# Borrow `&mut self`

- `&'static`: kept forever. Wrong.
- `&self`: a second call can still happen. Wrong.
- `&mut self`: no other call while borrowed.

```rust,editable
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
    // `&mut self`: no other call on this handle can happen while the result
    // is borrowed. `&self` wouldn't be enough.
    pub fn last_error(&mut self) -> &CStr {
        // SAFETY: `self.raw` is live, by the invariant on `raw`.
        let p = unsafe { lib_last_error(self.raw) };
        // SAFETY: `p` is a non-null C string, valid until the next call on the
        // handle. The returned `&CStr` borrows `self` mutably, so no such call
        // can happen while it's alive.
        unsafe { CStr::from_ptr(p) }
    }
}
```

<details>

- **Answer:** `&mut self -> &CStr`, then: the borrow checker now enforces "until
  the next call".

- Answer to the question on
  [Valid Until the Next Call](03-valid-until-next-call.md):
  `&mut self -> &CStr`.
- First try, `&'static CStr`: safe code keeps it past the next call and reads
  freed memory.
- Second try, `&self`: `let a = h.last_error(); let b = h.last_error();`
  compiles, and the second call invalidates `a`.
- `&mut self` makes the borrow checker enforce "until the next call", as long as
  every C call on the handle goes through `&mut self` too.

</details>
