---
minutes: 0
---

# Exercise: A Sentinel Search

- `lower_bound` skips the bounds check, C sentinel style.
- Fill in `Score::cmp` with a safe impl that makes `lower_bound` read out of
  bounds. Then pick the key.
- Who's at fault?
- Fix it. Is it still fast?

```rust,editable,should_panic
#![allow(unreachable_code, unused_variables)]
use std::cmp::Ordering;

/// Returns the index of the first item that is `>= key`, if there is one.
pub fn lower_bound<T: Ord>(items: &[T], key: &T) -> Option<usize> {
    let last = items.last()?;
    if key > last {
        return None;
    }
    let mut i = 0;
    // SAFETY: `key <= last`, so the loop stops at the last item at the latest.
    while unsafe { items.get_unchecked(i) } < key {
        i += 1;
    }
    Some(i)
}

/// A float that can be sorted.
#[derive(PartialEq)]
pub struct Score(pub f64);

impl Eq for Score {}

impl PartialOrd for Score {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))
    }
}

impl Ord for Score {
    fn cmp(&self, other: &Self) -> Ordering {
        todo!("a safe impl that makes `lower_bound` read out of bounds")
    }
}

fn main() {
    let scores = [Score(1.0), Score(2.5), Score(4.0)];
    let key: Score = todo!("pick a key");
    println!("{:?}", lower_bound(&scores, &key));
}
```

<details>

- **Goal:** `unsafe` code can't rely on a caller's `Ord`: a safe impl that lies on NaN makes the sentinel loop read out of bounds, and `lower_bound` is at fault.

- Hints:
  - Hint: the guard (`key > last`) and the loop (`item < key`) compare in
    opposite directions. A real total order makes them agree. A lying one
    doesn't.
  - Bigger hint: Realistic liar:
    `self.0.partial_cmp(&other.0).unwrap_or(Ordering::Less)`, with a NaN key.
    Simplest liar: always return `Ordering::Less`.
  - If they say "`Score` broke `Ord`'s rules, so it's at fault": what do the
    `Ord` docs say `unsafe` code may rely on?
  - If they fix `Score::cmp`: what happens with the next caller's `Ord`?
  - Hint for "is it still fast?": is a linear scan the fastest way to search a
    sorted slice?
  - If they sort `items` first: does sorting make `Ord` honest?
  - If they add `debug_assert!(items.is_sorted())`, or restrict `T` to
    "numbers": does that stop the next liar in a release build?
  - Ask: what do `BTreeMap`, `sort`, and `binary_search` do with a lying `Ord`?

</details>
