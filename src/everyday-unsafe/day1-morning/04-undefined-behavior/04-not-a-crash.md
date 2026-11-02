---
minutes: 1
---

# What Can This Print?

- `session` is freed, then read.
- Something else is allocated in between.
- You ran it, and it printed `false`. Is it fine?

```rust
struct Session {
    is_admin: bool,
}

fn main() {
    let session = Box::new(Session { is_admin: false });
    let dangling: *const Session = &*session;
    drop(session); // The memory is freed.

    let _attacker = Box::new([1u8]);

    let is_admin = unsafe { (*dangling).is_admin };
    println!("{is_admin}");
}
```

<details>

- **Question:** students work out that printing `false` doesn't make a use after free fine: it's UB, so no output is promised. The answer is on the next slide.

- Ask: what can this print? Then: you ran it, and it printed `false`. Is it
  fine?
- Usual wrong answer: "it printed `false`, so it's fine", or "it'll crash".
- Expected answer: no. It's a use after free, which is UB, so nothing about
  the output is promised. The next slide has the outcomes.
- Hint if needed: `_attacker` is the same size as a `Session`.

</details>
