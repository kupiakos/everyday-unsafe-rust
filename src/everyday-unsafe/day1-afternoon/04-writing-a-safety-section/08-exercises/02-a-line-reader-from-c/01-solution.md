
# Solution

- Two bullets: who, what, and until when.
- The rest is handled inside, or goes in the normal docs.

| From the header                    | If it's wrong          | Goes                         |
| ---------------------------------- | ---------------------- | ---------------------------- |
| `r` must be open                   | Use after free: UB     | `# Safety`; later, a type    |
| Writes its length to `*len`        | Write to anywhere: UB  | Handled: `&mut len`          |
| Pointer valid until the next call  | Dangling slice: UB     | `# Safety`; later, a borrow  |
| Returns NULL at end of input       | Null slice: UB         | Handled: `is_null`, `Option` |
| Leaves `*len` unwritten            | Uninitialized read: UB | Handled: `len` starts at `0` |
| Lines longer than 4096 bytes split | Wrong output: a bug    | Normal docs                  |

```rust,editable
use std::ffi::c_char;

#[repr(C)]
pub struct RawReader {
    _private: [u8; 0],
}

unsafe extern "C" {
    fn reader_next(r: *mut RawReader, len: *mut usize) -> *const c_char;
}

/// Returns the next line from `r`, or `None` at end of input. Lines longer
/// than 4096 bytes are split into several lines.
///
/// # Safety
///
/// The caller must ensure that:
///
/// - `r` is open (from `reader_open`, and not closed) for the duration of the
///   call;
/// - the returned slice is not used after the next call on `r`, or after `r`
///   is closed.
pub unsafe fn next_line<'a>(r: *mut RawReader) -> Option<&'a [u8]> {
    let mut len = 0;
    // SAFETY: `r` is open, by this function's `# Safety`. `len` is a live
    // `usize`.
    let p = unsafe { reader_next(r, &mut len) };
    if p.is_null() {
        return None;
    }
    // SAFETY: `p` is non-null, checked above. `reader_next` returned `len`
    // bytes at `p`, and they stay valid for `'a` by this function's `# Safety`.
    Some(unsafe { std::slice::from_raw_parts(p.cast::<u8>(), len) })
}

/// Later, a safe wrapper: an owned handle, and a borrow of `&mut self`.
pub struct Reader(*mut RawReader); // Invariant: open until `Drop`.

impl Reader {
    pub fn next_line(&mut self) -> Option<&[u8]> {
        // SAFETY: `self.0` is open until `Drop`. The result borrows
        // `&mut self`, so it ends before the next call or `Drop`.
        unsafe { next_line(self.0) }
    }
}
```

<details>

- **Answer:** two bullets: `r` is open for the call, and the slice isn't used
  after the next call on `r`. The rest is handled inside `next_line` or goes in
  the normal docs.

- the `Reader` wrapper is "Move It into a Type" again. A field
  invariant replaces bullet 1, and borrowing `&mut self` replaces bullet 2.
  Its `Drop` (not shown) would call `reader_close`.
- the unbounded `'a` on `next_line` is a Day 2 topic (Lifetimes).
  Today, notice that the `# Safety` bullet is what limits it.
- Expect six items. Two stay in `# Safety`: `r` is open, and the returned
  slice isn't used after the next call on `r`.
- Usual wrong answer: "for the duration of the call" for the slice. It
  outlives the call, so "until when" is "until the next call on `r`".
- "Lines longer than 4096 bytes are split" is just a bug if you forget it.
  It goes in the normal docs, not `# Safety`.
- "Returns NULL" and "leaves `*len` unwritten" are handled inside
  `next_line`: the `is_null` check, and `len` starting at `0`. The caller
  has nothing to do, so they don't belong in `# Safety`.
- Not a fix: "`r` must be a valid reader". Valid how, and until when?
- The solution shows the next step: a `Reader` type that makes both bullets
  true, so its `next_line` is safe.

</details>
