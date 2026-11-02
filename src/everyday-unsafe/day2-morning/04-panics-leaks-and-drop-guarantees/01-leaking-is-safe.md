---
minutes: 3
---

# Leaking Is Safe

- `mem::forget` is a safe function.
- `Rc` cycles leak, in safe code.
- A leak wastes memory. It isn't UB.

```rust
use std::mem;

struct Loud(&'static str);

impl Drop for Loud {
    fn drop(&mut self) {
        println!("dropping {}", self.0);
    }
}

fn main() {
    let _a = Loud("a"); // Prints at the end of `main`.
    mem::forget(Loud("forgotten")); // Safe. Never prints.
    let _b: &'static mut Loud = Box::leak(Box::new(Loud("leaked"))); // Also safe.
}
// Output: "dropping a". Two values leaked, and no `unsafe` anywhere.
```

<details>

- **Point:** leaking is safe (`mem::forget`, `Rc` cycles), so `unsafe` code
  can't assume a destructor runs.

- `Loud` again, from Write It Twice.
- C++ developers often treat a leak as a memory-safety bug. In Rust, it's a
  resource bug: wasteful, but not UB.
- Two `Rc`s that point at each other never reach a count of zero, so neither is
  dropped. No `unsafe` needed.
- The consequence: `unsafe` code can't assume a destructor will run. The last
  slide of this section shows what breaks if it does.

</details>
