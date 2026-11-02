
# Solution

- `Glyph::new` is the only `pub` way to make a `Glyph` and checks its input.
- `Font::advance` is safe. Its `SAFETY:` comment cites the field invariant.
- `last_glyph_width` returns `None` for non-printable input.

```rust,editable
#![allow(dead_code)]

/// A printable ASCII character, `' '..='~'`.
#[derive(Clone, Copy, Debug)]
pub struct Glyph(
    // Safety invariant: less than 95.
    u8,
);

impl Glyph {
    pub fn new(c: char) -> Option<Glyph> {
        (' '..='~').contains(&c).then(|| Glyph(c as u8 - b' '))
    }
}

/// Advance widths for the 95 printable ASCII characters, `' '..='~'`.
pub struct Font {
    advance: [u8; 95],
}

impl Font {
    pub fn monospace(width: u8) -> Self {
        Font { advance: [width; 95] }
    }

    pub fn advance(&self, g: Glyph) -> u8 {
        // SAFETY: `g.0 < 95` by the invariant on `Glyph`.
        unsafe { *self.advance.get_unchecked(usize::from(g.0)) }
    }
}

pub fn text_width(font: &Font, text: &str) -> u32 {
    text.chars().filter_map(Glyph::new).map(|g| u32::from(font.advance(g))).sum()
}

pub fn last_glyph_width(font: &Font, text: &str) -> Option<u8> {
    let g = Glyph::new(text.chars().last()?)?;
    Some(font.advance(g))
}

fn main() {
    let font = Font::monospace(8);
    assert_eq!(text_width(&font, "hi there"), 64);
    assert_eq!(last_glyph_width(&font, "hi!"), Some(8));
    assert_eq!(last_glyph_width(&font, "café"), None);
}
```

<details>

- **Answer:** a `Glyph` with a private field and one checked `new`. `Font::advance(Glyph)` is safe, and `"café"` gets `None`.

- The `SAFETY:` comment states a fact about the caller's input that nobody
  checked. In a safe `fn`, that's unsound.
- Not a fix: making `last_glyph_width` an `unsafe fn` with "`text` must be
  printable ASCII". Sound, but it hands the proof to every caller instead of
  back to a type.
- Ask: "What would break `Glyph`?" A `pub` field, or `impl From<u8>`.
  A derived `Default` is fine here (0 is below 95), unlike `BoundedIdx<0>`.
- Ask: "What if `Font` held a `Vec<u8>` of any length?" A `Glyph` checked
  against one font proves nothing about another. The fixed length is what
  makes the proof portable.
- the unsafe surface is now one line, in one function, and its proof
  depends only on code in `Glyph`'s module.

</details>
