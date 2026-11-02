---
minutes: 2
---

# Answer 3: An Unbounded Lifetime

- `'static` says forever. Nothing ties it to the memory.
- And `from_ptr` is safe, so callers needn't read the doc comment.
- Best fix: borrow from whatever owns the memory.

```rust,no_run
# /// Caller must pass a pointer valid for reads of `len` elements.
# pub fn from_ptr<T>(ptr: *const T, len: usize) -> &'static [T] {
#     // SAFETY: The caller passes a valid pointer, as documented above.
#     unsafe { core::slice::from_raw_parts(ptr, len) }
# }
#
fn main() {
    let v = vec![1];
    let s = from_ptr(v.as_ptr(), 1);
    drop(v);
    println!("{}", s[0]); // Use after free, and no `unsafe` in sight.
}
```

<details>

- **Answer:** a `main` that drops the `Vec` and then reads the slice, a use-after-free with no `unsafe`, then the takeaway: borrow from whatever owns the memory.

- In the PR this is how record fields were returned "without copying": C's
  strings only live until the callback returns, and `'static` says forever.
- Two bugs: a safe function with a precondition in its doc comment, and a
  lifetime that isn't tied to anything.
- Not a fix: `fn from_ptr<'a, T>(..) -> &'a [T]`. Still safe, and now the
  caller picks `'a`, which can still be `'static`.
- Sound but fragile: `unsafe fn` with that signature, like
  `slice::from_raw_parts`. Inference may pick a lifetime that's far too long.
- Best: borrow from whatever owns the memory, like
  `Record::host(&self) -> &'a CStr`.

</details>
