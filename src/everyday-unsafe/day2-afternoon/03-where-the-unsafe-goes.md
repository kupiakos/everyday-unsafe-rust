---
minutes: 5
---

# Where the `unsafe` Goes

- C hands the callback seven pointers.
- Every dereference needs an `unsafe` block.
- Seven identical `SAFETY:` comments: crying wolf.

```rust,editable
use std::ffi::{CStr, c_char, c_void};

#[repr(C)]
pub struct lp_record {
    pub pri: *const c_char,
    pub time: *const c_char,
    pub host: *const c_char,
    pub app: *const c_char,
    pub pid: *const c_char,
    pub msg_id: *const c_char,
    pub msg: *const c_char,
}

pub unsafe extern "C" fn on_record(_user: *mut c_void, rec: *const lp_record) {
    // SAFETY: C passes a valid record that lives until we return.
    let rec = unsafe { &*rec };
    // SAFETY: Each field is a NUL-terminated string that lives until we return.
    let host = unsafe { CStr::from_ptr(rec.host) };
    // SAFETY: Each field is a NUL-terminated string that lives until we return.
    let app = unsafe { CStr::from_ptr(rec.app) };
    // ...five more like these.
    println!("{host:?} {app:?}");
}
```

<details>

- **Goal:** students discharge a precondition once, hand back the proof in a
  type, and keep an `unsafe` unchecked version only where it's needed. **Arc:**
  seven pointers, seven `SAFETY:` comments → one `unsafe` constructor → a type
  that checks for itself → a checked/unchecked pair → a proof that rests on a
  safe line → how big a block → make preconditions checkable → exercises.

- Each block is correct, and each comment is true. That's the problem: a
  reviewer reads the same proof seven times, and stops reading by the third.
- Crying wolf: when `unsafe` is everywhere, the one block that needs attention
  doesn't stand out.
- Ask: "Where is the precondition actually stated?" Once, in the C library's
  docs for the callback. The goal is to discharge it once, in one place.
- `lp_record` now has its real fields, so it needs `#[repr(C)]`
  ([Struct Layout](01-abi/03-struct-layout.md)).
- Each `SAFETY:` comment answers
  [`CStr::from_ptr`'s requirements](https://doc.rust-lang.org/std/ffi/struct.CStr.html#method.from_ptr).

</details>
