---
minutes: 5
---

# ABI

- This afternoon: wrap `logparse`, a small C library.
- A handle with a lifecycle: new, feed, free.
- C calls us back for every record.

```c
// logparse.h: parses syslog lines.
typedef struct lp_parser lp_parser; // Opaque handle.

struct lp_record { // Seven strings, valid only during the callback.
  const char *pri, *time, *host, *app, *pid, *msg_id, *msg;
};
typedef void (*lp_callback)(void *user, const struct lp_record *rec);

lp_parser *lp_new(void); // NULL on failure.
void lp_set_callback(lp_parser *p, lp_callback cb, void *user); // `cb` may be NULL.
int lp_feed(lp_parser *p, const char *buf, size_t len); // 0, or -1 on error.
void lp_free(lp_parser *p);
```

<details>

- **Goal:** students can declare C functions and structs whose types and layout match C, and know the compiler can't check either, so they generate bindings. **Arc:** the `logparse` header → hand-written `unsafe extern` → wrong return types → `#[repr(C)]` → nullable callbacks as `Option` → generate them with `bindgen` → exercises.

- This library is the whole afternoon: bindings now, a safe wrapper next, then
  the callback, then a review of someone else's changes to it.
- Open Compiler Explorer with this header in a C pane and an empty Rust pane
  next to it. Every example today fits there, with no build system.
- Ask: "What does this header promise, and what does it leave to the docs?"
  The types are in the header. Who frees what, how long `rec` lives, and which
  thread runs `cb` are only in comments.
- Lifecycle: `lp_new`, any number of `lp_feed`s, then exactly one `lp_free`.
  C++ developers will want a destructor; that's where we're headed.

</details>
