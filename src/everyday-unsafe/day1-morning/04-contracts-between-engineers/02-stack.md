---
minutes: 3
---

# A Stack of Contracts

At every stage, engineers follow the requirements of their dependencies, and
declare requirements for their dependents.

- The app engineer follows the documented semantics of their programming
  language when coding. They trust the compiler to correctly compile their code
  according to it.
- The compiler engineer documents the abstract machine of their programming
  language, and designs it so that compiled code reflects the abstract machine's
  semantics on the ISA. They trust the hardware to implement the ISA as
  specified.
- The chip engineer documents an ISA and designs a chip to follow it based on
  the laws of physics. They trust the physicists' models.

| Who           | Follows                     | Trusts                 |
| ------------- | --------------------------- | ---------------------- |
| App engineer  | The Rust language rules     | rustc                  |
| rustc dev     | LLVM IR semantics (LangRef) | LLVM                   |
| LLVM dev      | The ISA                     | The chip               |
| Chip engineer | The laws of physics         | The physicists' models |

<details>

- **Point:** each layer follows the documented rules of the layer below and
  documents rules for the one above; your layer's rules are the Rust language
  rules.

- Each layer obeys the documented rules of the layer below, and documents rules
  for the layer above.
- Your layer's rules are the Rust language rules. Breaking one of them is UB.
- Nobody in this stack reads the layer below's implementation. They read its
  contract.

</details>
