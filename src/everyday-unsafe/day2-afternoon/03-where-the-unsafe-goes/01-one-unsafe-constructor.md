---
minutes: 3
---

# One `unsafe` Constructor

- One `unsafe fn new` states the contract.
- The caller proves it once.
- Accessors are safe: they rely on `new`.

```rust
use std::ffi::{CStr, c_char};
# #[repr(C)]
# pub struct lp_record {
#     pub pri: *const c_char,
#     pub time: *const c_char,
#     pub host: *const c_char,
#     pub app: *const c_char,
#     pub pid: *const c_char,
#     pub msg_id: *const c_char,
#     pub msg: *const c_char,
# }

pub struct Record<'a> {
    // Safety invariant: every field is a NUL-terminated string, valid for `'a`.
    raw: &'a lp_record,
}

impl<'a> Record<'a> {
    /// # Safety
    ///
    /// Every field of `raw` must point to a NUL-terminated string that stays
    /// valid and unchanged for `'a`.
    pub unsafe fn new(raw: &'a lp_record) -> Self {
        Record { raw }
    }

    pub fn host(&self) -> &'a CStr {
        // SAFETY: By the invariant on `raw`.
        unsafe { CStr::from_ptr(self.raw.host) }
    }

    // ...six more accessors like `host`.
}
```

<details>

- **Point:** one `unsafe fn new` takes the C contract once. A private field and its field invariant make every accessor safe to call.

- The `# Safety` section repeats the C library's contract for `lp_record`. The
  callback calls `Record::new` once, with one `SAFETY:` comment that points at
  the C docs.
- The accessors still contain `unsafe` blocks, but they're safe to call. Their
  `SAFETY:` comments rely on a field invariant, and only `new` can create a
  `Record`, so the invariant always holds.
- The field is private. If it were `pub`, safe code could build a `Record`
  around any `lp_record`, and the accessors would be unsound.
- The lifetime `'a` encodes "until we return": a `Record` can't outlive the
  callback's borrow of `rec`.

</details>
