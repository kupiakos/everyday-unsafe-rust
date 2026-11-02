---
minutes: 5
---

# Contracts Between Engineers

- Every engineer in a large system deals with rules and regulations.
- These rules allow different specialties to declare constraints and design within them.
- These prevent disaster due to miscommunication of expectations.

<details>

- **Goal:** students see the rules `unsafe` code follows as contracts between engineers: each layer trusts the documented rules of the one below, and a contract nobody wrote down can't be reviewed. **Arc:** rules between specialties → the electrician trusts the label → a stack of contracts → which contract broke? → usually your code → two LZO functions, one signature → the trusting one → the unwritten contract → writing it down as `# Safety`.

- Start outside software. An architect, a plumber, and an electrician design
  one building without meeting, because each follows a code and trusts the
  others to follow theirs.
- Ask: what's a rule in your field that lets another team work without asking
  you? (An API's documentation, a wire protocol, a file format.)
- The rest of this section: where those rules live in a Rust program.

</details>
