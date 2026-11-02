---
minutes: 10
---

# Exercise: The Wrong Input

- `lookup` compiles. Write a safe `main` that uses its result after the
  `Config` is dropped.
- Fix `lookup`'s signature so your `main` doesn't compile.
- Change `as_ref` so the compiler would have rejected the wrong signature.

```rust,editable
#![allow(dead_code)]

// Simulated C library: `const char *cfg_get(const cfg_t *, const char *key);`
// Docs: "The result is owned by the config, and valid until `cfg_free`."
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
/// `p` must point to a live `T` that nothing mutates for all of `'a`.
unsafe fn as_ref<'a, T>(p: *const T) -> &'a T {
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

// Two reference inputs, so elision needs help.
pub fn lookup<'a>(cfg: &Config, key: &'a str) -> Option<&'a str> {
    // SAFETY: `cfg.raw` is live, by the invariant on `raw`.
    let p = unsafe { cfg_get(cfg.raw, key) };
    if p.is_null() {
        return None;
    }
    // SAFETY: `p` points into `cfg`, which nothing mutates.
    Some(unsafe { as_ref(p) }.as_str())
}

fn main() {
    todo!("use `lookup`'s result after the `Config` is gone")
}
```

<details>

- **Goal:** a lifetime tied to the wrong input is as bad as none; tie it to the owner the result points into.

- Hints:
  - Bigger hint: the hostile caller: `let v = { let cfg = Config::load();
    lookup(&cfg, "user") };`. A string literal key makes `'a` `'static`.
  - If stuck on the fix: the result points into which input?
  - If they say "`'a` came from an input, so it's tied": tied to which input?
    Does `as_ref` care which?
  - For `as_ref`: what extra argument would force `'a` to come from a real
    borrow?

</details>
