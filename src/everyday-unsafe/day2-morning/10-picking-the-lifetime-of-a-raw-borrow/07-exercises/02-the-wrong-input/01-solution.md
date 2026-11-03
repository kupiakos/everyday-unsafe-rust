
# Solution

- The result points into `cfg`, so tie it to `cfg`, not `key`.
- Give `as_ref` an owner argument, so `'a` is always a real borrow.

```rust,editable
pub struct RawConfig {
    entries: Vec<(String, String)>,
}
unsafe fn cfg_get(cfg: *const RawConfig, key: &str) -> *const String {
    let entries = unsafe { &(*cfg).entries };
    match entries.iter().find(|(k, _)| k == key) {
        Some((_, v)) => v,
        None => std::ptr::null(),
    }
}

/// # Safety
///
/// `p` must point to a live `T` that nothing mutates while `owner` is borrowed.
unsafe fn as_ref<'a, T, O: ?Sized>(_owner: &'a O, p: *const T) -> &'a T {
    // SAFETY: The caller upholds this function's `# Safety` section.
    unsafe { &*p }
}

pub struct Config {
    // Safety invariant: `raw` came from `Box::into_raw`. Only `Drop` frees it.
    raw: *mut RawConfig,
}

impl Config {
    pub fn load() -> Config {
        let entries = vec![("user".to_string(), "ferris".to_string())];
        Config { raw: Box::into_raw(Box::new(RawConfig { entries })) }
    }
}

impl Drop for Config {
    fn drop(&mut self) {
        // SAFETY: By the invariant on `raw`, nothing else frees it.
        drop(unsafe { Box::from_raw(self.raw) });
    }
}

pub fn lookup<'c>(cfg: &'c Config, key: &str) -> Option<&'c str> {
    // SAFETY: `cfg.raw` is live, by the invariant on `raw`.
    let p = unsafe { cfg_get(cfg.raw, key) };
    if p.is_null() {
        return None;
    }
    // SAFETY: `p` points into the config `cfg` owns, which lives and isn't
    // mutated while `cfg` is borrowed.
    Some(unsafe { as_ref(cfg, p) }.as_str())
}

fn main() {
    let cfg = Config::load();
    println!("{:?}", lookup(&cfg, "user"));
    // Before the fix, this compiled and read freed memory:
    // let v = { let cfg = Config::load(); lookup(&cfg, "user") };
}
```

<details>

- **Answer:** tie the result to `cfg`, not `key`, and give `as_ref` an owner
  argument so `'a` is a real borrow.

- The fix: `fn lookup<'c>(cfg: &'c Config, key: &str) -> Option<&'c str>`.
- Usual wrong answer: "`'a` came from an input, so it's tied." It's tied to the
  _wrong_ input. `as_ref` accepts any `'a`, so the compiler couldn't tell.
- Making `as_ref` take `owner: &'a O` ties `'a` to a real borrow. Then the wrong
  signature is a compile error.
- with the new `as_ref`, the old signature
  `fn lookup<'a>(cfg: &Config, key: &'a str) -> Option<&'a str>` fails with
  "explicit lifetime required in the type of `cfg`". Try it.
- [`ptr.as_ref()`](https://doc.rust-lang.org/std/primitive.pointer.html#method.as_ref)
  and
  [`CStr::from_ptr`](https://doc.rust-lang.org/std/ffi/struct.CStr.html#method.from_ptr)
  have the same unbounded lifetime as the old `as_ref`. Pin the lifetime down
  right where you call them.

</details>
