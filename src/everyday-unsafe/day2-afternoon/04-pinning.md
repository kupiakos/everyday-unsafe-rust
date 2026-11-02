---
minutes: 5
---

# Pinning

- A C++ move runs a move constructor.
- A Rust move is a `memcpy`. No code runs.
- The moved-from Rust value is gone: no destructor.
- So C++ objects can rely on their address. Rust ones can't.

```cpp
struct Widget {
  explicit Widget(Registry& r) : reg(&r) { reg->add(this); }
  // A C++ move runs code: the new object fixes up the registration.
  Widget(Widget&& other) : reg(other.reg) { reg->replace(&other, this); }
  ~Widget() { reg->remove(this); }

  Registry* reg;
};
```

<details>

- **Goal:** students can explain why a Rust move (a `memcpy`) breaks a C++ object that relies on its address, and use `Pin` so safe code can't move it. **Arc:** C++ vs. Rust moves → registering `this` goes stale → `Box` isn't enough → `Pin` → on the stack → on the heap → replacing and projection → until when? → leaking is fine → exercise.

- C++ developers know this pattern: observers, intrusive lists, and
  `std::string`'s small-string buffer all depend on the object's address, and
  the move constructor keeps them correct.
- Rust has no move constructors. Moving a value copies its bytes, and the old
  location is treated as uninitialized. Nothing gets a chance to update
  `Registry`.
- Ask: "What happens if Rust code moves a `Widget`?" The registry still points
  at the old address. The next slide shows it.
- Teams that need C++ objects in Rust often work around this in ways that
  create debt. This hour is the alternative: `Pin`.

</details>
