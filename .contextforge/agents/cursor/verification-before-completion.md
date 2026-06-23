---
description: Verification Before Completion — no success claims without fresh command evidence
globs: ["**/*"]
alwaysApply: true
---

# Verification Before Completion

## The Iron Law

NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE.

If you have not run the verification command in this message, you cannot claim it passes.

## Gate Function

Before claiming any status, completion, or satisfaction:

1. **IDENTIFY** — What command proves this claim?
2. **RUN** — Execute it fresh and complete.
3. **READ** — Full output, exit code, failure count.
4. **VERIFY** — Does output confirm the claim?
5. **ONLY THEN** — Make the claim with evidence attached.

Skip any step = asserting without evidence.

## Required Evidence

| Claim | Proof required |
|---|---|
| Tests pass | Test output: 0 failures |
| Build succeeds | Build exit 0 |
| Bug fixed | Original symptom now passes |
| Regression verified | Red-green cycle confirmed |
| Agent completed | VCS diff shows changes |
| Requirements met | Line-by-line checklist |

## Stop Words — HALT Before Writing These

"should", "probably", "seems to", "I'm confident", "Done!", "Perfect!", "Great!" — stop and run the verification command first.

- "Linter passed" ≠ build passes
- "Agent said success" ≠ verified
- "Partial check" ≠ complete verification
