---
minutes: 5
---

# Picking the Lifetime of a Raw Borrow

- A lifetime says how long a borrow lasts.
- Nothing else: not scope, not when memory is freed.
- Raw pointers have none, so you pick one.

```rust,editable
fn main() {
    let v = vec![1, 2, 3];
    let r: &u32 = &v[0]; // The borrow of `v` starts here...
    println!("{r}"); // ...and ends after the last use of `r`.
    drop(v); // Fine: `r` isn't used after this.
    // println!("{r}"); // Error: this would extend the borrow past `drop(v)`.
}
```

<details>

- **Goal:** students give a reference made from a raw pointer a lifetime that's
  actually true. **Arc:** a lifetime describes a borrow → who picks `'a`? → tie
  `'a` to something real → valid until the next call: which signature? → borrow
  `&mut self` → when no lifetime fits → exercises.

- Lifetimes are Rust's way of writing "valid until". Thread: _until when?_
- The compiler checks that the borrow ends before `v` is moved or freed. It
  doesn't keep `v` alive.
- When `unsafe` code turns a raw pointer into a reference, the compiler can't
  check anything. The lifetime you write is a claim, like a `SAFETY:` comment.
- Ask: "In the logger's
  [Fix 2](../day1-morning/06-fixing-an-unsound-logger/03-fix-2-make-handler-new-unsafe.md),
  what did 'for as long as the `Handler` exists' claim?" Valid until the
  `Handler` is dropped: a lifetime written in prose.

</details>
