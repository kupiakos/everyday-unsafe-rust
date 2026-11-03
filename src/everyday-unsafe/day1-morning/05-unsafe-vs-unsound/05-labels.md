---
minutes: 3
---

# Labels and Wiring

- Tests check today's callers. A label is for every caller.
- Safe interface: a normal outlet.
- `unsafe` interface: labeled wiring, for professionals.
- Unsound interface: a wrong label.

The metaphor table:

| Rust                                                   | Electrical                                |
| ------------------------------------------------------ | ----------------------------------------- |
| Program seems to work and tests pass                   | Lamp lights up and nobody notices         |
| Someone triggers a memory exploit                      | Someone touches the lamp and gets shocked |
| Optimizer relies on a broken assumption: miscompile!   | House burns down on its own               |
| Data race causes a memory tear                         | Overloaded extension cable melts?         |
| "Works on my machine" but breaks on a compiler upgrade | "It's been fine for years" (eh, forced)   |
| Bounds-check panic                                     | Breaker trip                              |
| `pub fn foo(x: *mut i32) { *x *= 2; }`                 | Outlet with swapped hot and neutral       |

<details>

- **Answer:** the label is wrong: a safe signature switches off the compiler's
  check on every caller, then the metaphor: safe is an outlet, `unsafe` is
  labeled wiring, unsound is a wrong label.

- Answer to the question on [Green Tests, Unhappy Reviewer](04-green-tests.md):
  the reviewer is unhappy because the label is wrong. The compiler checks every
  caller of a safe `fn` against its signature, and `read_and_double`'s signature
  switched that check off. Tomorrow's caller gets no warning.
- The real version: `actix-service`, under actix-web, 2020
  ([RUSTSEC-2020-0046](https://rustsec.org/advisories/RUSTSEC-2020-0046.html)).
  Its internal `Cell<T>` wrapped an `Rc<UnsafeCell<T>>`, was `Clone`, and handed
  out `&mut T`. It ran in production, but two clones gave safe code two `&mut`
  to the same value, which Rust's rules forbid. Reviewers found it by reading
  the interface, not from a crash
  ([actix-net#160](https://github.com/actix/actix-net/issues/160)). Aliasing
  rules themselves come in
  [Aliasing](../../day2-morning/08-from-raw-pointer-to-reference/05-aliasing.md).
- Anyone can plug into an outlet. Behind it is wiring that only an electrician
  touches, and the electrician trusts its labels.
- `push` is an outlet with wiring inside. `set_len` is labeled wiring.
  `read_and_double` is an outlet with swapped wires.
- Skip the data race row for now: threads come in
  [`Send`, `Sync`, and Data Races](../../day2-morning/09-send-sync-and-data-races.md).
- This slide is a cut candidate if time is short.

</details>
