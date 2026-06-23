# ContextForge Git Safety

Do not commit, push, merge, rebase, reset, delete branches, or rewrite history unless explicitly requested by the user.

---
description: Git Workflow — branch naming, conventional commits, merge discipline, and safe recovery patterns
globs: ["**/*"]
alwaysApply: false
---

# Git Workflow

## Branch Rules

- Never commit directly to `main` or `master`.
- Use prefixes: `feature/`, `bugfix/`, `hotfix/`, `refactor/`, `docs/`.
- Delete branches after they are merged.

## Commit Message Format (Conventional Commits)

```
type(scope): subject

Body explaining why (not what — the diff shows that).

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
Subject: imperative mood, lowercase after type, ≤72 characters, no trailing period.

## Safety

- `--force-with-lease` not `--force`.
- Never `reset --hard` or amend published commits on shared branches without user confirmation.
- Run tests before pushing.

## Sync Discipline

- `git pull --rebase` to stay current.
- Rebase feature branches onto `main` before opening a PR.
- `git fetch --prune` to clean stale references.
- Review `git diff --staged` before every commit.

## Common Recovery

| Situation | Command |
|---|---|
| Undo last commit (keep changes) | `git reset --soft HEAD~1` |
| Wrong branch | `git branch correct-branch` → `git reset --hard HEAD~1` |
| Undo pushed merge | `git revert -m 1 <merge-hash>` |
| Recover deleted branch | `git reflog` → `git checkout -b recovered <hash>` |
