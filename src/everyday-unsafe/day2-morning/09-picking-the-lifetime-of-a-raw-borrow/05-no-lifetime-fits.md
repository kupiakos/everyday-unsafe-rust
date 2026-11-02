---
minutes: 3
---

# When No Lifetime Fits

- `ctime` returns one buffer for the whole process.
- No lifetime says "until anyone calls again".
- Copy the result out. Better: `ctime_r`.

```rust
use std::ffi::{CStr, c_char};

#[allow(non_camel_case_types)]
type time_t = i64; // On most 64-bit targets. Real code uses the `libc` crate.

unsafe extern "C" {
    /// Returns a static buffer that the next `ctime` call overwrites, from
    /// any caller on any thread. Returns null on error.
    fn ctime(t: *const time_t) -> *const c_char;
}

/// # Safety
///
/// No other thread may call `ctime`, `asctime`, or `localtime` during this
/// call.
pub unsafe fn ctime_string(t: time_t) -> Option<String> {
    // SAFETY: `&t` points to a valid `time_t`.
    let p = unsafe { ctime(&t) };
    if p.is_null() {
        return None;
    }
    // SAFETY: `p` is a non-null C string, valid until the next `ctime` call,
    // and the caller guarantees none happens before we finish copying it.
    Some(unsafe { CStr::from_ptr(p) }.to_string_lossy().into_owned())
}
```

<details>

- **Point:** when one buffer is shared by the whole process, no lifetime fits:
  copy the result out, or use `ctime_r`.

- The buffer is shared by every caller in the process, including C code and
  other crates. `&mut self` can't help: there's no `self` to borrow.
- Copying out fixes the lifetime. It doesn't fix the race with other threads, so
  the function stays `unsafe`, with a `# Safety` section.
- `ctime_r` writes into a buffer you pass in. With it, a safe wrapper is
  possible. Better still, use a Rust time crate.
- Cut candidate if time is short.

</details>
