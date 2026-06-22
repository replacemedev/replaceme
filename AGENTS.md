# The Optimized Agent Workflow
ALWAYS start with a "Scope Prompt" for new features:
1. Identify ONLY required files.
2. Do NOT scan the full repo.
3. Ask before opening more than 5 files.
4. Create an implementation plan first.
5. Wait for user approval.

# Force "Plan → Build → Fix" Phases
- Phase 1 (Planning): Only create architecture plan. No code. List files needed.
- Phase 2 (Targeted Build): Implement ONLY based on approved plan. Touch only listed files.
- Phase 3 (Fix): Fix only the specific bug. Do not reanalyze the whole system.
