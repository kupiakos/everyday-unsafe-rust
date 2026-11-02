---
minutes: 3
---

# Deferred Initialization

- Sometimes you need a memory location before you have a full value to fill in.
- Uninitialized memory is special: it has a special unfixed "uninit" value.
  Successive reads may give a different value.
- `MaybeUninit` is how you explicitly manage uninit memory.
- `MaybeUninit` disables Drop glue: you have to manually drop.

```rust
let mut value: MaybeUninit<u32> = MaybeUninit::uninit();
let written: &mut u32 = value.write(42);
assert_eq!(*written, 42);

let moved_value: u32 = unsafe { value.assume_init() };
assert_eq!(moved_value, 42);

// You don't *have* to init, but if you do make sure to clean up!

struct Person { name: String };
let leaky = MaybeUninit::new(String::from("hello"));
unsafe { leaky.assume_init() };

// `leaky` leaks! Need to manually drop.
```

<details>

- **Point:** `MaybeUninit` holds memory that may be uninitialized: `write` is
  safe, and `assume_init` is the `unsafe` claim that it's done.

- `MaybeUninit` example

- `MaybeUninit<T>` says "maybe not yet": same size and alignment as `T`, but any
  bytes are valid, including uninitialized ones.
- Ask: "Why is `write` safe, but `assume_init` `unsafe`?" Writing can't create
  an invalid `T`. `assume_init` claims every byte is now a valid `T`, and only
  you know that.
- Conservative rule: keep uninitialized memory in `MaybeUninit` the whole time,
  and call `assume_init` once, at the end.

</details>
