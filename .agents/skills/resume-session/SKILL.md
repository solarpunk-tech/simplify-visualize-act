---
name: "resume-session"
description: "Use when you need to continue work in a fresh session with minimal prompting by reconstructing state from the repo handoff and current git status."
---

# Resume Session

Use this skill when the session is new or context is thin and the goal is to continue the repository's current work without re-reading the entire transcript.

## Workflow

1. Read `.codex/context/session-handoff.md`.
2. Run `git branch --show-current` and `git status --short`.
3. Read and prioritize `Completion State`, `Outstanding Blockers`, and `UI Evidence Artifacts`.
4. If `Completion State` is `INCOMPLETE`, surface blockers first and do not present the task as complete.
5. If a UI task is screenshot-gated and evidence paths are missing, prioritize producing/recording before/after proof before further completion claims.
6. Confirm the current objective, current branch, and next three actions in one compact summary.
7. If the handoff and git state conflict, trust current filesystem/git state, then refresh handoff before substantial new work.
8. Continue from the smallest pending implementation or validation step instead of re-planning from scratch.

## Output Contract

- Restate the active goal in one sentence.
- Note the current branch and whether it satisfies the branch policy.
- Report completion state (`COMPLETE` or `INCOMPLETE`) and blockers before listing next actions.
- List the next three actions exactly or refine them if the repo state has changed.
- Call out any missing context that still blocks execution.
