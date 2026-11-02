---
minutes: 2
---

# C++ Thread-Safety Words

- You already know these words.
- They map onto `Send` and `Sync`.

| C++ term          | Promise                               | Rust                         |
| ----------------- | ------------------------------------- | ---------------------------- |
| Thread-safe       | Any calls from any threads, at once   | `Sync` (and usually `Send`)  |
| Thread-compatible | Concurrent `const` calls are OK       | `Send`, and usually `Sync`   |
| Thread-unsafe     | Not even concurrent `const` calls     | Not `Sync`, maybe not `Send` |

<details>

- **Point:** C++'s thread-safe, thread-compatible, and thread-unsafe map onto `Sync` and `Send`.

- Thread-compatible is the common case: `const` methods map to `&self`, and
  mutating methods to `&mut self`. The borrow checker then does the locking
  discipline for you.
- Thread-safe types take `&self` even for mutation, using locks or atomics
  inside, like `Mutex` or `AtomicU32`.
- Thread-unsafe types aren't `Sync`, and if they depend on thread-local state,
  aren't `Send` either. `Rc` is one.
- Cut candidate: this slide can fold into the previous slide's speaker notes.

</details>
