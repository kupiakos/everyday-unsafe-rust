---
minutes: 3
---

# Two Functions, One Signature

- Your team is porting LZO, a compression library.
- Two decompress functions, same arguments.
- What's the difference?

```c
int lzo1x_decompress(const unsigned char *src, lzo_uint src_len,
                     unsigned char *dst, lzo_uint *dst_len, void *wrkmem);

int lzo1x_decompress_safe(const unsigned char *src, lzo_uint src_len,
                          unsigned char *dst, lzo_uint *dst_len, void *wrkmem);
```

<details>

- **Question:** students guess how two LZO decompress functions with the same signature can differ. The answer is on the next slide.

- Story 1.4. Let the class guess before the next slide.
- Hint if needed: `dst_len` is a pointer. Is it an input, an output, or both?
- The name `_safe` is a clue that the other one isn't.

</details>
