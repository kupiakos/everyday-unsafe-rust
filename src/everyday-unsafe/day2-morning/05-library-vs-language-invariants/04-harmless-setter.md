---
minutes: 3
---

# A Safe `set_head`

- Last slide: to trust `current`, read `new` and `advance`.
- A teammate adds a safe `set_head`. No `unsafe` in it.
- Is anything unsound now? Who's at fault?

```rust
pub struct RingBuffer {
    buf: Vec<u32>,
    // Safety invariant: `head < buf.len()`.
    head: usize,
}

impl RingBuffer {
    pub fn new(len: usize) -> Self {
        assert!(len > 0);
        RingBuffer { buf: vec![0; len], head: 0 }
    }

    pub fn current(&self) -> u32 {
        // SAFETY: `head < buf.len()`, by the invariant on `head`.
        unsafe { *self.buf.get_unchecked(self.head) }
    }

    // Added later.
    pub fn set_head(&mut self, head: usize) {
        self.head = head;
    }
}
```

<details>

- **Question:** students work out that a safe `set_head` makes `current`
  unsound, and that `set_head` is at fault. The answer is on the next slide.

- The first bullet answers the last slide's question.
- One change from the last slide: `advance` became `set_head`.
- Ask: "Is anything unsound now? Who's at fault?" The next slide opens with the
  answer.
- Who's at fault? `set_head`. The usual wrong answer is `current`, because it
  has the `unsafe` block. Its proof was right until `set_head` broke the
  invariant it cites.
- Fixes: check (`assert!(head < self.buf.len())`), or make it an `unsafe fn`
  with a `# Safety` section.
- A reviewer of this PR sees no `unsafe` in the diff. That's why the invariant
  is written on the field.

</details>
