# Systematic Debugging

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

Core principle: ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

Violating the letter of this process is violating the spirit of debugging.

## The Iron Law

NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST

If you haven't completed Phase 1, you cannot propose fixes.

## When to Use

Use for ANY technical issue: test failures, bugs in production, unexpected behavior, performance problems, build failures, integration issues.

Use this ESPECIALLY when:
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- Previous fix didn't work
- You don't fully understand the issue

Don't skip when:
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)
- Stakeholder wants it fixed NOW (systematic is faster than thrashing)

## The Four Phases

You MUST complete each phase before proceeding to the next.

---

### Phase 1: Root Cause Investigation

BEFORE attempting ANY fix:

**Read Error Messages Carefully**
- Don't skip past errors or warnings — they often contain the exact solution
- Read stack traces completely
- Note line numbers, file paths, error codes

**Reproduce Consistently**
- Can you trigger it reliably?
- What are the exact steps?
- Does it happen every time?
- If not reproducible → gather more data, don't guess

**Check Recent Changes**
- What changed that could cause this?
- Git diff, recent commits
- New dependencies, config changes
- Environmental differences

**Gather Evidence in Multi-Component Systems**

When a system has multiple components (CI → build → signing, API → service → database), before proposing fixes, add diagnostic instrumentation at each component boundary:

```sh
# Layer 1: Workflow
echo "=== Secrets available in workflow: ==="
echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

# Layer 2: Build script
echo "=== Env vars in build script: ==="
env | grep IDENTITY || echo "IDENTITY not in environment"

# Layer 3: Signing script
echo "=== Keychain state: ==="
security list-keychains
security find-identity -v

# Layer 4: Actual signing
codesign --sign "$IDENTITY" --verbose=4 "$APP"
```

Run once to gather evidence showing WHERE it breaks. Then analyze that evidence to identify the failing component. Then investigate that specific component.

This reveals: which layer fails (secrets → workflow ✓, workflow → build ✗).

**Trace Data Flow (Backward Call-Stack Tracing)**

When an error is deep in the call stack, trace backward:

1. **Start at the failure point** — what value or state caused the failure?
2. **Find the immediate caller** — who passed that value to the failing code?
3. **Ask: where did the caller get it?** — go one level up the stack
4. **Continue tracing upward** — keep asking "where does this come from?" until you reach the original source
5. **Fix at source** — address the origin, not the intermediate handlers or the failure point

Example: null pointer crash at Layer 4 → don't null-guard at Layer 4 → trace back to Layer 1 where null was introduced and fix there.

**Completion criterion:** You can state clearly WHAT is failing and WHY.

---

### Phase 2: Pattern Analysis

Find the pattern before fixing:

**Find Working Examples**
- Locate similar working code in the same codebase
- What works that's similar to what's broken?

**Compare Against References**
- If implementing a pattern, read the reference implementation COMPLETELY
- Don't skim — read every line
- Understand the pattern fully before applying

**Identify Differences**
- What's different between working and broken?
- List every difference, however small
- Don't assume "that can't matter"

**Understand Dependencies**
- What other components does this need?
- What settings, config, environment?
- What assumptions does it make?

**Completion criterion:** You know what distinguishes the broken path from a working equivalent.

---

### Phase 3: Hypothesis and Testing

Scientific method:

**Form Single Hypothesis**
- State clearly: "I think X is the root cause because Y"
- Write it down
- Be specific, not vague

**Test Minimally**
- Make the SMALLEST possible change to test hypothesis
- One variable at a time
- Don't fix multiple things at once

**Verify Before Continuing**
- Did it work? Yes → Phase 4
- Didn't work? Form NEW hypothesis
- DON'T add more fixes on top

**When You Don't Know**
- Say "I don't understand X"
- Don't pretend to know
- Ask for help or research more

**Completion criterion:** Hypothesis confirmed or replaced by a more informed one.

---

### Phase 4: Implementation

Fix the root cause, not the symptom:

**Create Failing Test Case**
- Simplest possible reproduction
- Automated test if possible
- One-off test script if no framework
- MUST have before fixing

**Implement Single Fix**
- Address the root cause identified in Phase 1
- ONE change at a time
- No "while I'm here" improvements
- No bundled refactoring

**Verify Fix**
- Test passes now?
- No other tests broken?
- Issue actually resolved?

**If Fix Doesn't Work**

STOP. Count: how many fixes have you tried?

- If < 3: Return to Phase 1, re-analyze with the new information this failure gives you
- If ≥ 3: STOP and question the architecture — see below
- DON'T attempt Fix #4 without architectural discussion

---

### If 3+ Fixes Failed: Question Architecture

Patterns indicating an architectural problem, not an implementation problem:

- Each fix reveals new shared state, coupling, or problem in a different place
- Fixes require "massive refactoring" to implement
- Each fix creates new symptoms elsewhere

STOP and question fundamentals:
- Is this pattern fundamentally sound?
- Are we persisting with it through inertia?
- Should we refactor the architecture rather than continue fixing symptoms?

**Discuss with the user before attempting more fixes.** This is not a failed hypothesis — this is a wrong architecture.

---

## Red Flags — STOP and Return to Phase 1

If you catch yourself thinking any of these:

- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "Add multiple changes, run tests"
- "Skip the test, I'll manually verify"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"
- "Pattern says X but I'll adapt it differently"
- "Here are the main problems: [lists fixes without investigation]"
- Proposing solutions before tracing data flow
- "One more fix attempt" (when already tried 2+)
- Each fix reveals a new problem in a different place

ALL of these mean: STOP. Return to Phase 1.

If 3+ fixes failed: question the architecture.

## Signals Your Partner Is Redirecting You

Watch for these:

| Signal | Meaning |
|---|---|
| "Is that not happening?" | You assumed without verifying |
| "Will it show us...?" | You should have added evidence gathering |
| "Stop guessing" | You're proposing fixes without understanding |
| "Ultrathink this" | Question fundamentals, not just symptoms |
| "We're stuck?" (frustrated) | Your approach isn't working |

When you see these: STOP. Return to Phase 1.

## Common Rationalizations

| Excuse | Reality |
|---|---|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "Just try this first, then investigate" | First fix sets the pattern. Do it right from the start. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |
| "I see the problem, let me fix it" | Seeing symptoms ≠ understanding root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. Question pattern, don't fix again. |

## Quick Reference

| Phase | Key Activities | Completion Criterion |
|---|---|---|
| 1. Root Cause | Read errors, reproduce, check changes, gather evidence, trace data flow | Understand WHAT and WHY |
| 2. Pattern | Find working examples, read references fully, compare | Know the differences |
| 3. Hypothesis | Form specific theory, test minimally, one variable | Confirmed or replaced |
| 4. Implementation | Failing test case, one fix, verify | Bug resolved, tests pass |

## When Process Reveals "No Root Cause"

If systematic investigation reveals the issue is truly environmental, timing-dependent, or external:

- You've completed the process
- Document what you investigated
- Implement appropriate handling (retry, timeout, error message)
- Add monitoring and logging for future investigation

But: 95% of "no root cause" cases are incomplete investigation.

## Related Skills

- `verification-before-completion` — Verify the fix actually worked before claiming success
- `test-driven-development` — Creating the failing test case required in Phase 4

## Real-World Impact

- Systematic approach: 15–30 minutes to fix
- Random fixes approach: 2–3 hours of thrashing
- First-time fix rate: ~95% systematic vs. ~40% guessing
- New bugs introduced: near zero vs. common
