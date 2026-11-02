---
minutes: 3
---

# Generate the Bindings

- `bindgen` reads the header and writes the `extern` block.
- Put them in a `-sys` crate.
- Write the safe wrapper on top.

<!-- mdbook-xgettext: skip -->

```bob
.------------.  bindgen   .-----------------.        .----------------.
| logparse.h +----------->| logparse-sys    +------->| logparse       |
'------------'            | "unsafe extern" |        | safe "Parser"  |
                          '-----------------'        '-------+--------'
                                                             |
                                                             v
                                                        your code
```

<details>

- **Point:** generate bindings with `bindgen` into a `-sys` crate, so types and
  layouts come from the header, and write the safe wrapper on top.

- Generated bindings can't get `strlen`'s return type wrong: `bindgen` maps
  `size_t` to `usize` and `int` to `c_int` straight from the header.
- `bindgen` also generates layout tests, which check each struct's size,
  alignment, and field offsets against what the C compiler sees.
- The `-sys` crate holds only the raw bindings. The safe crate on top is where
  the `SAFETY:` comments live, and it's the only crate most code depends on.
- Run `bindgen` from your build system (a Cargo build script, or your monorepo's
  rule for it), so the bindings change when the header does.

</details>
