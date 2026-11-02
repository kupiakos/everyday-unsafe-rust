---
minutes: 3
---

# A C Header Comment

- A header comment is a contract.
- Which parts belong in `# Safety`?

```c
/* Fills buf with data and writes the number of bytes to *out.
   buf must be at least len bytes.
   Returns -1 on error and leaves *out unwritten. */
int lib_fill(char *buf, size_t len, size_t *out);
```

<details>

- **Question:** students list the requirements and promises in the C header
  comment: the buffer size, the `-1` return, and `*out` left unwritten. The
  answer is on the next slide.

- You're wrapping this C function. Read the comment like a `# Safety` section.
- Ask the class to list each requirement and promise in it. Expect three: the
  buffer size, the `-1` return, and `*out` left unwritten.
- Don't sort them yet. The next slide does that.

</details>
