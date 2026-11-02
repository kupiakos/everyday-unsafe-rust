---
minutes: 3
---

# The Null Check That Vanished

- Linux `tun` driver, 2009.
- Dereference first, null check second.
- GCC deleted the check.

```c
static unsigned int tun_chr_poll(struct file *file, poll_table *wait) {
    struct tun_struct *tun = __tun_get(file->private_data);
    struct sock *sk = tun->sk;  // Dereference...
    if (!tun)                   // ...then check. GCC deleted this.
        return POLLERR;
    // ...
}
```

<details>

- **Question:** students decide whether GCC deleting the `tun` null check is a compiler bug. The answer is on the next slide.

- Story 1.2. GCC reasoned: `tun` was just dereferenced, so it can't be null,
  so `if (!tun)` is always false.
- With page zero mapped, the null dereference didn't crash, and the bug became
  an exploitable privilege escalation.
- Ask: is this a compiler bug? Usual answer: yes. It isn't: the code broke a
  rule, and the compiler relied on it. The next slide opens with that.
- The kernel now builds with `-fno-delete-null-pointer-checks`.

</details>
