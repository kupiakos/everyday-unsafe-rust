---
minutes: 5
---

# Library vs Language Invariants

- A `bool` holding 2 breaks the language.
- A `str` that isn't UTF-8 breaks a library.
- Both are bugs. They fail at different times.

| | Language invariant | Library invariant |
| --- | --- | --- |
| Example | `bool` is 0 or 1 | `str` is UTF-8 |
| Set by | The compiler | The type's docs |
| When broken | UB immediately | UB later, where code relies on it |

<details>

- **Goal:** students tell a language rule (broken: UB at once) from a library rule (broken: UB later, elsewhere), and know privacy is where soundness is decided. **Arc:** two kinds of rule → non-UTF-8 `str`: who's at fault? → UB later, in safe code → your type's rules → a safe `set_head` → privacy is the boundary → trusting a dependency → exercises.

- Language invariants are the validity rules from Type Validity. The compiler
  assumes them everywhere, all the time.
- Library invariants are what a type's safe API relies on. Breaking one doesn't
  do anything by itself. The library is then allowed to cause UB later, and you
  don't know where.
- A `str` that isn't UTF-8 isn't UB on the spot. But any `str` method may now
  cause UB, so treat it as a bug just as serious.
- Ask: "Name a library invariant from C++." Expected: a `std::set` stays
  sorted, a `std::string`'s `c_str()` ends in `\0`, a `string_view` points
  into a live buffer.
- Your own types get library invariants too: that's most of this section.

</details>
