---
minutes: 4
---

# The Logger, With Threads

- [Fix 2's logger](../../day1-morning/06-fixing-an-unsound-logger/03-fix-2-make-handler-new-unsafe.md)
  ignored threads.
- Now the `Mutex` guards the `Logger` itself.
- `# Safety` gains a concurrency bullet.

```rust,editable
use std::fmt::{self, Write};
use std::ptr;
use std::sync::Mutex;

#[derive(Default)]
pub struct Logger {
    pub max_level: u32,
    pub sinks: Vec<Box<dyn fmt::Write + Send>>, // Was `dyn fmt::Write`.
}

struct LoggerPtr(*mut Logger);

// SAFETY: Only the thread holding `LOGGER`'s lock uses the pointer, and a
// `Logger` (sinks included) is `Send`.
unsafe impl Send for LoggerPtr {}

static LOGGER: Mutex<LoggerPtr> = Mutex::new(LoggerPtr(ptr::null_mut()));

/// # Safety
/// - `logger` must point to an initialized `Logger`, valid for reads and writes
///   for the remaining lifetime of the program.
/// - From the start of this call, `*logger` must not be accessed by any thread
///   except through this module.
pub unsafe fn init_logger(logger: *mut Logger) {
    let mut slot = LOGGER.lock().unwrap();
    // SAFETY:
    // - Caller promises that `*logger` is a live, initialized `Logger`.
    // - Caller promises that only this module accesses it, and this module only
    //   does so while holding the lock, which we hold. So this `&mut` to `sinks` is
    //   unique.
    unsafe { (*logger).sinks.push(build_default_sink()) };
    slot.0 = logger;
}

pub fn log(level: u32, value: impl fmt::Display) {
    let slot = LOGGER.lock().unwrap(); // Held until `log` returns.
    // SAFETY: Non-null means `init_logger` stored a valid pointer that only
    // this module uses, and holding the lock means only this thread does.
    let Some(logger) = (unsafe { slot.0.as_mut() }) else {
        panic!("`init_logger` must be called before `log`");
    };
    if level > logger.max_level {
        return;
    }
    for sink in &mut logger.sinks {
        _ = writeln!(sink, "{value}");
    }
}

fn build_default_sink() -> Box<dyn fmt::Write + Send> {
    Box::new(String::new())
}
```

<details>

- **Point:** the logger as a global shared across threads: hold the lock for all
  of `log`, require `Send` sinks, and add a concurrency bullet to `# Safety`.

- [Fix 2](../../day1-morning/06-fixing-an-unsound-logger/03-fix-2-make-handler-new-unsafe.md)'s
  `unsafe fn Handler::new(*mut Logger)` became a global `init_logger`. Three
  changes: a lock held for all of `log`, `Send` sinks, and the second `# Safety`
  bullet.
- The obvious `static LOGGER: Mutex<*mut Logger>` doesn't compile: a `static`
  must be `Sync`, and a
  [`Mutex<T>` is only `Sync` if `T: Send`](https://doc.rust-lang.org/std/sync/struct.Mutex.html#impl-Sync-for-Mutex%3CT%3E).
  `*mut Logger` isn't. Hence `LoggerPtr` and its `unsafe impl Send`.
- Dropping the lock at the end of the `let`, before using the logger, would let
  two threads hold two `&mut Logger` at once.
- The best fix is still the safe one: `static LOGGER: Mutex<Option<Logger>>`,
  with no `unsafe` at all.

</details>
