---
minutes: 3
---

# `lzo1x_decompress` Trusts the Caller

- `lzo1x_decompress` never reads `*dst_len`.
- It trusts that `dst` is big enough.
- `_safe` checks, and never overflows.

```c
// Never reads `*dst_len`. Trusts that `dst` is big enough, and writes the
// decompressed size into `*dst_len` afterward.
int lzo1x_decompress(const unsigned char *src, lzo_uint src_len,
                     unsigned char *dst, lzo_uint *dst_len, void *wrkmem);

// Reads `*dst_len` as the capacity of `dst`, and never writes past it.
int lzo1x_decompress_safe(const unsigned char *src, lzo_uint src_len,
                          unsigned char *dst, lzo_uint *dst_len, void *wrkmem);
```

<details>

- **Answer:** `lzo1x_decompress` never reads `*dst_len` and trusts that `dst` is big enough, while `_safe` checks, then the signature alone can't show that contract.

- In `lzo1x_decompress`, `dst_len` is output only. In `_safe`, it's input and
  output.
- Ask: how can a caller use the trusting one correctly? The arguments don't
  say how big the output will be.
- Usual answer: "just use `_safe`". Often right. The trusting one is faster,
  and the next slide shows how teams used it anyway.

</details>
