---
name: upstream-digest
description: Generate a categorized digest of new commits in upstream/preview since the last review, so the user can pick what to backport for inspiration. Use when the user asks to check upstream, review upstream changes, see what's new in upstream, or run a monthly upstream review.
---

# Upstream Digest

This fork (`plane-fa`) tracks upstream `makeplane/plane` for **inspiration**, not sync. The goal is: surface upstream changes that genuinely benefit our deployment, ignore everything else.

## When to use

- User says "check upstream", "what's new upstream", "monthly review", "upstream digest"
- User asks if there's anything worth backporting
- After significant upstream activity (security advisory, major release)

## Workflow

### 1. Refresh upstream

```bash
git fetch upstream --no-tags
```

### 2. Determine the cutoff

Read the last commit message that backported from upstream — it usually mentions the date range or the upstream SHA. Common markers in our log:

```bash
git log --grep="backport upstream\|chore(deps): batch" --pretty=format:"%h %s%n  %ci%n" -10
```

If no clear cutoff, default to the last 30 days:

```bash
SINCE=$(date -d "30 days ago" +%Y-%m-%d)  # Linux/WSL
# Windows PowerShell: $SINCE = (Get-Date).AddDays(-30).ToString("yyyy-MM-dd")
```

### 3. Pull the commit list and categorize

```bash
git log --no-merges upstream/preview --since="$SINCE" --pretty=format:"%H %s"
```

Group by prefix (`fix:`, `feat:`, `chore:`, `refactor:`, `chore(deps):`, `[SECUR-`, `[GHSA`, `[WEB-`, `[SILO-`):

| Bucket                           | Action                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------- |
| **Security** (GHSA, CVE, SECUR-) | Always evaluate — apply unless our codebase already differs in a way that mitigates |
| **Bug fixes** (`fix:`, WEB-)     | Apply if the bug affects user experience on our deployment                          |
| **Features** (`feat:`)           | Inspire only — apply if it adds genuine value, otherwise skip                       |
| **Refactors** (`refactor:`)      | Apply only if it solves a real problem we have or aligns with future plans          |
| **Deps** (`chore(deps):`)        | Batch and apply quarterly with full regression test                                 |
| **Chores/CI** (`chore:`)         | Almost always skip — upstream-team specific                                         |

### 4. Check for conflicts with our customizations

Before recommending a backport, check whether the file is touched by our customizations:

```bash
# Did we modify the file since divergence?
git log --oneline f53446340b..main -- <path>
```

Our key customization areas:

- `packages/i18n/src/locales/fa/` — Persian translations
- RTL classes (search for `[FA-CUSTOM]` comments)
- Jalali calendar utilities in `packages/utils/src/calendar.ts`
- `apps/web/core/components/fa/` — Persian-specific components
- `apps/api/plane/bgtasks/import_task.py` — CSV importer

If the upstream commit touches one of these areas, flag for manual merge.

### 5. Output format

Produce a Persian summary, **prioritized**:

```
# هفته/ماه upstream digest

## 🔴 حتما بررسی شود
- <SHA short> <title> — <why it matters for us>

## 🟡 بسنج بر اساس استفاده
- <SHA short> <title> — <conditional reason>

## 🟢 الهام‌گیری (نه backport)
- <SHA short> <title> — <interesting idea>

## ⏸ skip
- <count> commits in <buckets> — <one-line rationale>
```

Recommend at most **5 items in 🔴**. If there's nothing critical, say so honestly — don't manufacture work.

### 6. After the user picks

For each item the user wants to apply:

1. Check our state: `git diff <merge-base>..main -- <files>`
2. If no conflict: `git checkout <commit-sha> -- <files>` then verify with compile/type checks
3. If conflict: read both versions, manual merge while preserving our customizations
4. Run relevant compile checks:
   - Python: `python -m py_compile <files>`
   - TS: `cd apps/web && pnpm exec tsc --noEmit | grep <file>`
5. Commit with a focused message that lists the upstream PR numbers
6. Push when the user confirms

## Anti-patterns to avoid

- **Don't auto-apply.** This skill is advisory. Always show the digest first, let the user pick.
- **Don't pursue sync.** If the digest has 50 commits, summarize buckets — don't list every chore.
- **Don't bundle unrelated work.** One PR per logical group (security, deps, UI fixes, etc).
- **Don't skip our customizations.** When checking out files via `git checkout`, **always** verify the resulting diff matches the upstream commit's stated scope. We've been bitten by `git checkout <sha> -- file` bringing in **all** prior commits' changes to that file.

## Last-resort sanity check

Before pushing, confirm:

```bash
# Compile-check all touched Python files
python -m py_compile <files>

# TypeScript check (filter to changed files only)
cd apps/web && pnpm exec tsc --noEmit 2>&1 | grep -E "<changed-paths>"
```

If lint-staged blocks the commit on pre-existing warnings (not from this PR), use `--no-verify` and document why in the commit message footer.
