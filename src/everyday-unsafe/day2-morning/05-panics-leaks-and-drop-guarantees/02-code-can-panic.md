---
minutes: 3
---

# Code You Don't Control Can Panic

- Callbacks and trait methods may panic.
- Unwinding runs destructors on the way out.
- Like a C++ exception.

```rust,editable
struct Loud(&'static str);

impl Drop for Loud {
    fn drop(&mut self) {
        println!("dropping {}", self.0);
    }
}

fn call_twice(mut f: impl FnMut(u32)) {
    let _local = Loud("call_twice's local");
    f(1);
    f(2); // Never reached if `f(1)` panics.
}

fn main() {
    let result = std::panic::catch_unwind(|| {
        call_twice(|n| {
            if n == 1 {
                panic!("bad input");
            }
        })
    });
    // Prints "dropping call_twice's local" first, during unwinding.
    println!("panicked: {}", result.is_err());
}
```

<details>

- **Point:** every call to code you don't control may panic, and unwinding drops
  whatever state you left.

- The hostile safe caller from
  [Sound for Every Safe Caller](../../day1-afternoon/06-sound-for-every-safe-caller.md)
  can panic: closures, and `Ord`, `Hash`, `Clone`, and `Drop` impls.
- Every call to code you don't control is a point where your function may stop
  halfway, and destructors run on whatever state you left.
- A build with `panic = "abort"` doesn't unwind, but library code can't count on
  how it's built.
- The rule: at every such call, the state must be safe to drop.

</details>
