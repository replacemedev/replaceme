---
description: Systematic Debugging — root cause investigation required before any fix attempt
globs: ["**/*"]
alwaysApply: true
---

# Systematic Debugging

## The Iron Law

NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.

Phase 1 is a hard gate. You cannot propose any fix until it is complete.

## The Four Phases (in order)

**Phase 1 — Root Cause Investigation**
- Read error messages and stack traces completely — note line numbers, file paths, error codes
- Reproduce the issue consistently; if not reproducible, gather more data first
- Check recent changes: git diff, new dependencies, environment differences
- Multi-component systems: add diagnostic instrumentation at each layer boundary, run once to locate WHERE it breaks, then investigate that component
- Trace bad values backward through the call stack to their origin — fix at source, not at symptom

**Phase 2 — Pattern Analysis**
- Find working examples of similar code; compare working vs. broken line by line
- Read reference implementations completely — never skim

**Phase 3 — Hypothesis and Testing**
- Form a single specific hypothesis: "X is the root cause because Y"
- Test with the SMALLEST possible change — one variable at a time
- If hypothesis fails: form a new one; never stack more fixes on a failed attempt

**Phase 4 — Implementation**
- Create a failing test case FIRST
- ONE fix targeting the root cause
- Verify: test passes, no regressions, original symptom resolved

## The 3-Strikes Rule

After 3 failed fix attempts: STOP. Do not attempt Fix #4.

Each fix surfacing a new problem in a different place = wrong architecture, not wrong implementation. Raise this with the user.

## Red Flags — Return to Phase 1

- Proposing solutions before completing Phase 1
- "Just try X and see what happens"
- "It's probably X, let me fix that"
- Adding multiple changes at once
- "I don't fully understand but this might work"
- Fix #3+ without architectural discussion
