---
minutes: 3
---

# Miri

- Run shows one outcome of UB. It could have been anything.
- Miri runs your program step by step, and checks each step against the rules.
- Every example today has a Miri button next to Run.

```rust,editable
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

- **Goal:** students can check an example with Miri, read its report, and say
  what a clean Miri run does and doesn't prove. **Arc:** a use after free under
  Run, then Miri → Miri passed: is it sound? → Miri only checks your tests.

- This is the example from
  [What Can This Print?](../day1-morning/03-undefined-behavior/04-not-a-crash.md).
  Ask: "Press Run. What did it print?" Then: "Now press Miri."
- Run can print `true`, `false`, or anything: the freed `Session` may now hold
  `_attacker`'s byte. In testing, Run printed `true` and Run with optimizations
  printed `false`: the same source, two outcomes.
- Miri stops at the read: "Undefined Behavior: memory access failed: ... has
  been freed, so this pointer is dangling". It also shows where the `Box` was
  allocated and freed.
- Miri is an interpreter, not a compiler. It tracks every allocation, every
  initialized byte, and every borrow. That's why it's slow, and why it sees what
  Run can't.
- It reports out-of-bounds reads, use after free, uninitialized reads,
  misaligned accesses, invalid values like a `bool` of 2, data races, and
  aliasing violations. It also reports leaks, which aren't UB.
- The button uses Tree Borrows, one of two candidate aliasing models.
  [Not Every Rule Is Settled](../day1-morning/03-undefined-behavior/08-unsettled.md)
  applies: Tree Borrows accepts some code the final rules may reject.
- On your machine: `rustup +nightly component add miri`, then
  `cargo +nightly miri test` or `cargo +nightly miri run`. Set
  `MIRIFLAGS=-Zmiri-tree-borrows` to match the button. On Windows, add
  `--target x86_64-unknown-linux-gnu`.
- In an editable example, Ctrl-Shift-Enter also runs Miri.

</details>
