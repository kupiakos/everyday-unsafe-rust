---
minutes: 2
---

# Answer 1: The Safe `from_raw`

- Safe caller: `Buffer::from_raw(ptr::null_mut(), 1)`.
- `drop` frees a pointer `Box` never allocated.
- The bug is in `from_raw`. It must be `unsafe`.

```rust
use std::ptr;

pub struct Buffer {
    ptr: *mut u8,
    len: usize,
}

impl Buffer {
    /// Takes ownership of a buffer from `Box<[u8]>`, without copying it.
    ///
    /// # Safety
    ///
    /// `ptr` and `len` must be the pointer and length of a `Box<[u8]>` that
    /// was released with `Box::into_raw`. The caller must not use or free it
    /// afterward.
    pub unsafe fn from_raw(ptr: *mut u8, len: usize) -> Self {
        Buffer { ptr, len }
    }
}

impl Drop for Buffer {
    fn drop(&mut self) {
        // SAFETY: By the `# Safety` section of `from_raw`, the only
        // constructor, `ptr` came from a `Box<[u8]>` of `len` bytes, and the
        // `Buffer` owns it.
        unsafe {
            drop(Box::from_raw(ptr::slice_from_raw_parts_mut(self.ptr, self.len)))
        }
    }
}
```

<details>

- **Answer:** any pointer that didn't come from `Box<[u8]>`, like
  `ptr::null_mut()`, then the takeaway: the precondition belongs where the
  pointer enters, so `from_raw` must be `unsafe`.

- The `unsafe` block is in `drop`, but the bug is in `from_raw`. The
  precondition belongs where the pointer enters, in a `# Safety` section saying
  where `ptr` must come from.
- Not a fix: a doc comment saying "only pass pointers from `Box`". Safe
  functions can't have preconditions.
- Not a fix: checking `ptr.is_null()`. Non-null is one item on the list, not the
  whole list.

</details>
