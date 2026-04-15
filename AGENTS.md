# Repository Codex Rules

- Never implement changes on `main`. Switch to `jex` before any edit, commit, or branch-affecting task.
- Default package manager: `npm`. Use `npm install` for dependencies unless the user explicitly requests Bun.
- Primary project commands:
  - `npm run dev`
  - `npm run build`
  - `npm run lint`
  - `npm run test`
- For parallel discovery/review, prefer `repo_mapper` and `plan_reviewer`. Use the built-in `worker` only for bounded implementation after the target files are understood.
- Keep subagent work read-heavy by default. Summaries must be compact and include file references.
- Every substantial stop should leave `.codex/context/session-handoff.md` current enough for a fresh session to resume with a minimal prompt.
- When resuming, check branch, `git status --short`, and the handoff before making assumptions about current work.

## UI Done Criteria

- When a user shares screenshots/images, or when UI targets are visually unclear, require visual proof before claiming completion.
- Required proof in those UI cases:
  - before screenshot artifact path(s),
  - after screenshot artifact path(s),
  - short delta summary mapping visible changes to requested visuals.
- Do not use completion wording without evidence paths in those UI cases.
- If proof cannot be produced, mark handoff `Completion State` as `INCOMPLETE` with blocker and next action.

## UI Scope Declaration

- Before editing UI, list the target route/component and expected visible delta.
- Capture screenshot artifacts under `.codex/artifacts/ui-checks/` using:
  - `{task-slug}-{route}-before-{timestamp}.png`
  - `{task-slug}-{route}-after-{timestamp}.png`
