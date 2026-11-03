---
minutes: 3
---

# The Unwritten Contract

- Production isn't full of heap overflows.
- Every team stored the decompressed size.
- The contract lived in people's heads.

```c
struct blob {
    lzo_uint decompressed_len;  // Written by whoever compressed the data.
    lzo_uint compressed_len;
    unsigned char data[];
};

unsigned char *dst = malloc(b->decompressed_len);
lzo_uint dst_len;
lzo1x_decompress(b->data, b->compressed_len, dst, &dst_len, NULL);
```

<details>

- **Question:** students work out what breaks the unwritten "store the size next
  to the data" contract: a new format without the size, or a size from an
  untrusted file. The answer is on
  [Writing the Contract Down](08-writing-it-down.md).

- The header never says "store the size next to the data". Teams found that out,
  and passed it on by word of mouth.
- Ask: what goes wrong? A new teammate writes a new file format without the
  size. Or `decompressed_len` comes from an untrusted file.
- Either way, the result is a heap overflow, with no warning from the compiler.
  [Writing the Contract Down](08-writing-it-down.md) opens with that.
- A contract existed. It just wasn't written anywhere a reviewer could check.

</details>
