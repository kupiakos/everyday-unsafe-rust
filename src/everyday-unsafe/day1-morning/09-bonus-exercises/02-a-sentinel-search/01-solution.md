
# Solution

- The liar: `unwrap_or(Ordering::Less)`, with the key `Score(f64::NAN)`.
- At fault: `lower_bound`. It trusted a caller's `Ord` for memory safety.
- Fix: `partition_point`. Safe, and a binary search.

```rust,editable
use std::cmp::Ordering;

/// Fix: stay safe. A lying `Ord` gives a wrong answer, never UB.
pub fn lower_bound<T: Ord>(items: &[T], key: &T) -> Option<usize> {
    let i = items.partition_point(|item| item < key);
    (i < items.len()).then_some(i)
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
        // Safe, plausible, and a lie: NaN is "less than" everything, and
        // everything is "less than" NaN.
        self.0.partial_cmp(&other.0).unwrap_or(Ordering::Less)
    }
}

fn main() {
    let scores = [Score(1.0), Score(2.5), Score(4.0)];
    // With the original `lower_bound`, this read past the end of `scores`:
    // `key > last` is false, and every `item < key` is true.
    println!("{:?}", lower_bound(&scores, &Score(f64::NAN)));
}
```

<details>

- **Answer:** `unwrap_or(Ordering::Less)` with a NaN key, and `lower_bound` is
  at fault; fix it with safe `partition_point`.

- Usual wrong answer: "`Score` broke `Ord`'s rules, so it's at fault". The
  [`Ord` docs](https://doc.rust-lang.org/std/cmp/trait.Ord.html) say a logic
  error in an impl must not cause UB, and `unsafe` code must not rely on these
  methods being correct.
- Expected fix: change `lower_bound`, without `unsafe`. A student who "fixes"
  `Score::cmp` has fixed this one caller, and the next liar still gets UB.
- Fix: `partition_point`, a binary search. It's safe, and faster than the scan.
  Or keep the scan and check `i < items.len()`.
- What isn't a fix: sorting `items` first (sorting doesn't make `Ord` honest,
  and recent `std`
  [may panic on a bad order](https://doc.rust-lang.org/std/primitive.slice.html#method.sort));
  `debug_assert!(items.is_sorted())`; restricting `T` to "numbers".
- Contrast:
  [`BTreeMap`](https://doc.rust-lang.org/std/collections/struct.BTreeMap.html),
  `sort`, and `binary_search` with a lying `Ord` give wrong answers or panic.
  Never UB.
- with the original `lower_bound`, a debug build aborts at `std`'s optional
  `get_unchecked` check. In one local release build, it hung. UB promises
  nothing, including a crash.
- `lower_bound` could also require `unsafe trait TrustedOrd: Ord`, with "`cmp`
  is a total order" as its `# Safety` section. Then `Score` can't honestly
  implement it. Not worth it when `partition_point` is already fast.

</details>
