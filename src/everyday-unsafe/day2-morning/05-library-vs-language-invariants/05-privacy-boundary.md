---
minutes: 3
---

# Privacy Is the Boundary

- Last slide: `set_head` is at fault, not `current`.
- Fix: check `head`, or make `set_head` an `unsafe fn`.
- `unsafe` code relies on `head`.
- Every function that writes `head` is in the proof.
- Keep the field private.

```rust
mod ring {
    pub struct RingBuffer {
        buf: Vec<u32>,
        // Safety invariant: `head < buf.len()`.
        pub head: usize, // UNSOUND: code outside `ring` can write `head`.
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
    }
}

fn main() {
    let mut r = ring::RingBuffer::new(4);
    r.head = 100; // Safe code, in another module.
    println!("{}", r.current()); // UB: reads past the end of `buf`.
}
```

<details>

- **Answer:** `set_head` is at fault, not `current`, then: every function that
  can write `head` is in the proof, so keep the field private.

- Answer to the last slide's question: `current` is now unsound, but `set_head`
  is at fault. `current`'s proof was right until `set_head` broke the invariant
  it cites.
- Story title: the ring buffer with a public field. A `pub` field is a setter
  with no checks.
- Privacy in Rust is per module, not per type. Everything inside `mod ring` can
  write `head`, so the whole module is what a reviewer reads.
- Keep modules with `unsafe` small, so that "every function that writes the
  field" is a short list.

</details>
