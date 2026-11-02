---
minutes: 15
---

# Exercise: Add a `Glyph` Type

- `last_glyph_width` is unsound. Find a `&str` that makes it UB.
- Add a `Glyph` type with one checked constructor.
- Make `Font::advance` take a `Glyph`, and make it safe.
- No `unsafe` outside `Font::advance`.

```rust,editable
#![allow(dead_code)]

/// Advance widths for the 95 printable ASCII characters, `' '..='~'`.
pub struct Font {
    advance: [u8; 95],
}

impl Font {
    pub fn monospace(width: u8) -> Self {
        Font { advance: [width; 95] }
    }

    /// # Safety
    ///
    /// The caller must ensure that `i < 95`.
    pub unsafe fn advance(&self, i: usize) -> u8 {
        // SAFETY: The caller guarantees that `i < 95`.
        unsafe { *self.advance.get_unchecked(i) }
    }
}

pub fn text_width(font: &Font, text: &str) -> u32 {
    let mut width = 0;
    for c in text.chars() {
        if (' '..='~').contains(&c) {
            // SAFETY: `c` is one of the 95 chars from `' '` to `'~'`.
            width += u32::from(unsafe { font.advance(c as usize - 32) });
        }
    }
    width
}

pub fn last_glyph_width(font: &Font, text: &str) -> u8 {
    let c = text.chars().last().unwrap_or(' ');
    // SAFETY: Text is printable ASCII, so this is below 95.
    unsafe { font.advance(c as usize - 32) }
}

fn main() {
    let font = Font::monospace(8);
    assert_eq!(text_width(&font, "hi there"), 64);
    assert_eq!(last_glyph_width(&font, "hi!"), 8);
}
```

<details>

- **Goal:** spot a `SAFETY:` comment that assumes unchecked input, then hand back the proof in a `Glyph` type so `Font::advance` becomes safe.

- Hints:
  - Hint: what does the `SAFETY:` comment assume about `text`? Who checks it?
  - Bigger hint: `"café"` reads `advance[201]`. `"hi\n"` overflows the
    subtraction: a panic in debug builds, a huge index in release builds.
  - If they make `last_glyph_width` an `unsafe fn`: is that sound? Who has to
    prove it then?
  - Ask: "What would break `Glyph`?"
  - Ask: "What if `Font` held a `Vec<u8>` of any length?"

</details>
