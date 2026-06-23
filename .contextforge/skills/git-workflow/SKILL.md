# Git Workflow

## When to Use

- Creating commit messages
- Managing branches and merges
- Resolving conflicts
- Collaborating with a team
- Recovering from git mistakes
- Setting up git configuration

---

## Step 1: Branch Management

```bash
# Create and switch to new branch
git checkout -b feature/feature-name

# Create from specific commit
git checkout -b feature/feature-name <commit-hash>
```

**Naming conventions:**

| Prefix | Use for |
|---|---|
| `feature/description` | New features |
| `bugfix/description` | Bug fixes |
| `hotfix/description` | Urgent production fixes |
| `refactor/description` | Code restructuring |
| `docs/description` | Documentation updates |

---

## Step 2: Staging Changes

```bash
# Stage specific files
git add file1.py file2.js

# Stage all changes
git add .

# Stage interactively (review hunks before staging)
git add -p
```

**Check before staging:**

```bash
# See what's changed
git status

# See unstaged diff
git diff

# See staged diff (what will be committed)
git diff --staged
```

---

## Step 3: Committing

**Conventional Commits format:**

```
type(scope): subject

Detailed description of what changed and why.

- Change 1
- Change 2

Fixes #123
```

**Types:**

| Type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring |
| `test` | Adding or fixing tests |
| `chore` | Maintenance, tooling |

**Example:**

```bash
git commit -m "feat(auth): add JWT authentication

- Implement JWT token generation
- Add token validation middleware
- Update user model with refresh token

Closes #42"
```

---

## Step 4: Pushing

```bash
# Push to remote
git push origin feature/feature-name

# Set upstream and push (first push)
git push -u origin feature/feature-name

# Force push safely (fails if remote diverged unexpectedly)
git push origin feature/feature-name --force-with-lease
```

---

## Step 5: Pulling and Syncing

```bash
# Pull latest with rebase (cleaner history)
git pull --rebase origin main

# Fetch without merging
git fetch origin

# Remove stale remote-tracking branches
git fetch --prune
```

---

## Step 6: Merging

```bash
# Merge feature into main
git checkout main
git merge feature/feature-name

# Merge with explicit merge commit (no fast-forward)
git merge --no-ff feature/feature-name
```

**Rebase instead of merge (cleaner history):**

```bash
git checkout feature/feature-name
git rebase main

# After resolving conflicts
git rebase --continue

# Abandon rebase
git rebase --abort
```

---

## Step 7: Resolving Conflicts

```bash
# See conflicted files
git status
```

Conflict markers in files:

```
<<<<<<< HEAD
Current branch code
=======
Incoming branch code
>>>>>>> feature-branch
```

After resolving:

```bash
# For merge
git add <resolved-files>
git commit

# For rebase
git add <resolved-files>
git rebase --continue
```

---

## Step 8: Cleanup

```bash
# Delete local branch (safe — checks fully merged)
git branch -d feature/feature-name

# Force delete local branch
git branch -D feature/feature-name

# Delete remote branch
git push origin --delete feature/feature-name
```

---

## Advanced Workflows

### Interactive Rebase

```bash
# Rebase last 3 commits (squash, reword, reorder, drop)
git rebase -i HEAD~3
```

Commands in the editor:

| Command | Effect |
|---|---|
| `pick` | Use commit as-is |
| `reword` | Change commit message |
| `edit` | Amend commit content |
| `squash` | Combine with previous commit |
| `fixup` | Like squash but discard message |
| `drop` | Remove commit entirely |

### Stashing

```bash
# Stash current changes
git stash

# Stash with description
git stash save "Work in progress on feature X"

# List stashes
git stash list

# Apply and remove most recent stash
git stash pop

# Apply specific stash (keep it in list)
git stash apply stash@{2}

# Drop specific stash
git stash drop stash@{0}

# Clear all stashes
git stash clear
```

### Cherry-Picking

```bash
# Apply a specific commit to the current branch
git cherry-pick <commit-hash>

# Multiple commits
git cherry-pick <hash1> <hash2> <hash3>

# Stage changes without committing
git cherry-pick -n <commit-hash>
```

### Bisect (Finding Which Commit Introduced a Bug)

```bash
# Start bisect session
git bisect start

# Mark current commit as broken
git bisect bad

# Mark a known-good commit
git bisect good <commit-hash>

# Git checks out a midpoint commit — test it, then mark:
git bisect good   # works fine
git bisect bad    # still broken

# When bisect finds the culprit, it reports the first bad commit
# Reset when done
git bisect reset
```

---

## Real-World Examples

### Feature Development

```bash
# 1. Start from latest main
git checkout main
git pull origin main
git checkout -b feature/user-profile

# 2. Develop, commit incrementally
git add src/profile/
git commit -m "feat(profile): add user profile page

- Create profile component
- Add profile API endpoints
- Add profile tests"

# 3. Stay current with main
git fetch origin
git rebase origin/main

# 4. Push and open a PR
git push origin feature/user-profile

# 5. After PR merges, clean up
git checkout main
git pull origin main
git branch -d feature/user-profile
```

### Hotfix

```bash
# 1. Branch from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug

# 2. Fix, commit
git add .
git commit -m "fix: resolve authentication bypass vulnerability

Fixes #999"

# 3. Push and merge immediately
git push origin hotfix/critical-bug

# 4. Clean up after merge
git checkout main
git pull origin main
git branch -d hotfix/critical-bug
```

### Collaborative Branch

```bash
# Stay current with main while working
git fetch origin
git rebase origin/main

# If a teammate pushed to your branch
git pull origin feature/new-feature --rebase

# After resolving any conflicts
git add .
git rebase --continue

# Push after rebase
git push origin feature/new-feature --force-with-lease
```

---

## Common Recovery Patterns

**Undo last commit, keep changes staged:**

```bash
git reset --soft HEAD~1
```

**Undo last commit, discard changes (destructive — local only):**

```bash
git reset --hard HEAD~1
```

**Amend last commit (only if not yet pushed):**

```bash
# Change message
git commit --amend -m "corrected message"

# Add a forgotten file
git add forgotten-file.txt
git commit --amend --no-edit
```

**Accidentally committed to wrong branch:**

```bash
# 1. Save current state to the correct branch
git branch feature/correct-branch

# 2. Undo the commit on the current branch
git reset --hard HEAD~1

# 3. Switch to correct branch
git checkout feature/correct-branch
```

**Undo a merge:**

```bash
# If not yet pushed
git reset --hard HEAD~1

# If already pushed (creates a revert commit — safe for shared branches)
git revert -m 1 <merge-commit-hash>
```

**Recover a deleted branch:**

```bash
# Find the lost commit
git reflog

# Recreate the branch from it
git checkout -b recovered-branch <commit-hash>
```

**Sync a fork with upstream:**

```bash
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Viewing History

```bash
# Full log
git log

# One line per commit
git log --oneline

# With branch graph
git log --oneline --graph --all

# Last 5 commits
git log -5

# By author
git log --author="Name"

# In date range
git log --since="2 weeks ago"

# Search commit messages
git log --grep="keyword"

# Search code changes (find when a string was added/removed)
git log -S "function_name"

# Show history of a specific file
git log --follow -- path/to/file
```

---

## Git Configuration

```bash
# Identity
git config --global user.name "Your Name"
git config --global user.email "your@email.com"

# Editor
git config --global core.editor "code --wait"  # VS Code
git config --global core.editor "vim"

# Useful aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.lg 'log --oneline --graph --all'
git config --global alias.last 'log -1 HEAD'
git config --global alias.unstage 'reset HEAD --'
```

---

## Best Practices

1. Commit often — small, focused commits are easier to review and revert.
2. Write meaningful commit messages — explain *why*, not *what* (the diff shows what).
3. Pull before starting new work — avoid divergence.
4. Review before committing — `git diff --staged` every time.
5. Never commit directly to main — use branches.
6. Keep history clean — rebase feature branches before PR.
7. Test before pushing — don't break the build for teammates.
8. Use descriptive branch names — readable at a glance.
9. Delete merged branches — keep the remote clean.
10. Use `.gitignore` — never commit generated or secret files.
