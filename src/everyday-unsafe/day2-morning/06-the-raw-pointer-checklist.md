---
minutes: 3
---

# The Raw Pointer Checklist

- Day 1: "`logger` must point to a live `Logger`".
- A null check wasn't enough.
- Today, "valid" becomes a checklist.

```rust,ignore
/// # Safety
///
/// - `logger` must point to a live `Logger` for as long as the `Handler`
///   exists.
pub unsafe fn new(logger: *mut Logger) -> Handler { /* ... */ }

// Day 1's non-fix: a dangling pointer passes a null check.
Handler::new(NonNull::dangling().as_ptr());
```

<details>

- **Goal:** students unpack "valid pointer" into a checklist: non-null, live, aligned, initialized, in bounds. **Arc:** Day 1's "live" → non-null and live → aligned → initialized → in bounds: which line is UB? → the bump allocator → check before you compute → the checklist → what `from_raw_parts` asks for → exercises.

- Story 3.7: "What 'valid' meant all along". Day 1 sprinkled the word "valid";
  this section unpacks it into parts students already know.
- Ask: "What does 'live' mean for a pointer? List everything it needs." Write the answers
  on the board, and check them off over the next slides.
- Expected list: non-null, live, aligned, initialized (for reads), in bounds.
  References add more in the next section.
- Recall the `slice::from_raw_parts` bullets from Day 1 afternoon. The last
  slide derives them from this list.

</details>

