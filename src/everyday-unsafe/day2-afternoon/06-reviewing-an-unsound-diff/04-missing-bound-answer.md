---
minutes: 2
---

# Answer 2: A Missing Bound

- Safe caller: a handler that captures an `Rc`.
- Two threads update one reference count: a data race.
- `unsafe impl<H> Send` sends `H` too. Fix: require `H: Send`.

```rust
# use std::ffi::c_void;
#
# pub struct Parser<H> {
#     raw: *mut c_void, // The C parser.
#     handler: H,       // Called on the library's worker thread.
# }
#
// SAFETY: The C library permits use from any thread, one thread at a time,
// and `H: Send` lets the handler go with it.
unsafe impl<H: Send> Send for Parser<H> {}
```

<details>

- **Answer:** a handler that captures an `Rc`, with a clone kept on this thread
  (a data race on its count), then the takeaway: an `unsafe impl` promises for
  every `H`, so require `H: Send`.

- The `SAFETY:` comment was true about `raw` and silent about `H`. An
  `unsafe impl` is a promise for every `H` the caller can choose.
- Not a fix: "`H` must be `Send`" in a doc comment. The caller picks `H`, and
  the compiler only checks bounds.
- Same bug as `LeakyBox` on the `Send`/`Sync` page this morning.

</details>
