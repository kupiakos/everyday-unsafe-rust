---
minutes: 5
---

# FFI

- The wrapper keeps its state in a `Pin<Box<State>>`.
- C stores a `void*` to it.
- C calls `on_record(user, rec)` for every record.
- `on_record` turns `user` back into `&mut State`.

<!-- mdbook-xgettext: skip -->

```bob
   Rust                                 C
 .------------------------.          .-----------------------.
 | Parser                 |          | lp_parser             |
 |   raw   o--------------+--------->|   cb   = on_record    |
 |   state o              |       .--+---o user              |
 '---------+--------------'       |  '-----------------------'
           |                      |
           v                      |
 .------------------.             |
 | State (pinned)   |<------------'
 '------------------'
```

<details>

- **Goal:** students can review an FFI boundary for panics, reentrancy, and threads, and export Rust functions to C. **Arc:** the callback's `void*` to a pinned `State` → a panic → re-entry and a second `&mut` → another thread and `set_var` → exporting to C → questions for every boundary → exercise.

- This is where the pieces meet: the bindings from ABI, `Record` from Unsafe,
  Correctly Documented, and the pinned heap value from Pinning.
- `Parser::new` calls `lp_new`, boxes and pins a `State`, and passes
  `lp_set_callback(raw, Some(on_record), user)`. C keeps `user` until
  `lp_free`.
- Until when? `State` must stay put until C can no longer call back, so
  `Parser`'s `Drop` calls `lp_free` before the box is freed. Fields are dropped
  after `drop` returns, so that order comes for free.
- Ask: "What can go wrong inside `on_record`?" Collect answers. The next three
  slides are the usual ones: a panic, a second `&mut`, another thread.

</details>
