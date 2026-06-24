---
description: 
alwaysApply: true
---

# The Optimized Cursor Agent Workflow

ALWAYS start with a "Scope Prompt" for new features. To conserve context tokens and prevent hallucination, the Agent must adhere to the following:
1. **Targeted Context:** Explicitly identify and list ONLY the required files. Do NOT scan or read the full repo indiscriminately.
2. **File Limit:** Ask for user permission before reading or opening more than 5 files in a single turn.
3. **Plan First:** Create a step-by-step implementation plan (or `plan.md`) BEFORE writing or editing any code.
4. **Halt & Catch Fire:** Wait for user approval ("Proceed" or "Yes") before executing multi-file creations or edits.

# Force "Plan → Build → Fix" Phases

- **Phase 1 (Planning):** Analyze context and create the architecture plan. Write NO implementation code. Explicitly list the exact file paths that will be created, modified, or read.
- **Phase 2 (Targeted Build):** Implement ONLY based on the approved plan. Touch ONLY the listed files. Do not silently refactor or "cleanup" unrelated code. Apply the project's strict guidelines (e.g., Zero Mock Data, Flat DOM).
- **Phase 3 (Fix/Debug):** When provided an error log or bug report, fix ONLY the specific bug. Do not reanalyze the whole system or rewrite unrelated components to solve a localized issue.

# MCP & Database Discipline
- If a feature requires database changes, the Agent MUST halt UI development, define the SQL schema, and prompt the user to execute the MCP Supabase sync BEFORE proceeding to frontend data-fetching.
