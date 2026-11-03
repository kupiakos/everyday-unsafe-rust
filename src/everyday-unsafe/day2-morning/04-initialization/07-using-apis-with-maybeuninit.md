---
minutes: 2
---

# Using APIs with `MaybeUninit`

## Using APIs with `MaybeUninit`

Three common API shapes for "init this pointer to uninit `Foo`":

```rust,editable
// Example that reasonably wants deferred init.
// Motivating example: table of coefficients for signal processing. Array of 4K
// floating point #'s, coefficient computed by a for loop. Want to skip the zero
// init.
struct Foo {
    x: u8,
    y: u16,
}
```

Proposal: write the "Fair" first using the big hammer, then "OK" then show the
motivation for the "Best". Drop FFI mention for Fair.

First example that demos usage of MaybeUninit (previously just ops).
Accomplishes something. Secondly this slide arc accomplishes abstraction.

<details>

- **Point:** there are three common API shapes for "initialize this for me":
  [Fair](08-fair-shape.md), [Better](09-ok-shape.md), and
  [Best](10-best-shape.md), from worst to best.

- There's a few ways you'll see deferred initialization functions written.

- `Foo` stands in for the motivating example in the comment: a big table you'd
  rather not zero before filling it in.
- [Fair](08-fair-shape.md), [Better](09-ok-shape.md), and
  [Best](10-best-shape.md) are the three shapes, worst first.

</details>
