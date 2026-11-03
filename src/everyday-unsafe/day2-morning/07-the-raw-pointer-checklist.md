---
minutes: 3
---

# The Raw Pointer Checklist

- `Handler::new` below says "`logger` must point to a live `Logger`".
- A null check isn't enough: a dangling pointer is non-null.
- Today, "valid" becomes a
  [checklist](https://doc.rust-lang.org/std/ptr/index.html#safety).

```rust,no_run
# use std::ptr::NonNull;
# pub struct Logger;
# pub struct Handler {
#     logger: *mut Logger,
# }
# impl Handler {
/// # Safety
///
/// - `logger` must point to a live `Logger` for as long as the `Handler`
///   exists.
pub unsafe fn new(logger: *mut Logger) -> Handler {
    // ...
#     Handler { logger }
}
# }
# fn main() {

// Not a fix: a dangling pointer passes a null check.
unsafe { Handler::new(NonNull::dangling().as_ptr()) };
# }
```

<details>

- **Goal:** students unpack "valid pointer" into a checklist: non-null, live,
  aligned, initialized, in bounds. **Arc:** the logger's "live" → non-null and
  live → aligned → initialized → in bounds: which line is UB? → the bump
  allocator → check before you compute → the checklist → what `from_raw_parts`
  asks for → exercises.

- "What 'valid' meant all along". Day 1 sprinkled the word "valid"; this section
  unpacks it into parts students already know.
- The code is Day 1's logger contract, from
  [Fix 2: Make `Handler::new` `unsafe`](../day1-morning/06-fixing-an-unsound-logger/03-fix-2-make-handler-new-unsafe.md),
  and its non-fix, from
  [Null Checks Don't Make It Sound](../day1-morning/06-fixing-an-unsound-logger/01-null-checks-dont-make-it-sound.md).
  Read it aloud before asking: students won't remember the original.
- Ask: "What does 'live' mean for a pointer? List everything it needs." Write
  the answers on the board, and check them off from
  [Non-Null and Live](07-the-raw-pointer-checklist/01-non-null-and-live.md)
  through [The Checklist](07-the-raw-pointer-checklist/05-checklist.md).
- Expected list: non-null, live, aligned, initialized (for reads), in bounds.
  [From Raw Pointer to Reference](08-from-raw-pointer-to-reference.md) adds
  more.
- Recall the
  [`slice::from_raw_parts` bullets](../day1-afternoon/02-reading-a-safety-section/06-a-long-list.md).
  [What `from_raw_parts` Asks For](07-the-raw-pointer-checklist/06-from-raw-parts.md)
  derives them from this list.

</details>
