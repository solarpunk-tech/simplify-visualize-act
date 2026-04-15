---
name: "ui-proof-gate"
description: "Use for UI tasks that require screenshot-backed completion proof, especially when user-provided screenshots exist or visual targets are ambiguous."
---

# UI Proof Gate

Use this skill for UI work when the user has shared screenshots/images, or when visual expectations are ambiguous without reference.

## Workflow

1. Define scope before edits:
   - target route/component,
   - expected visible delta.
2. Gather visual requirements from user references as structured bullets:
   - layout, spacing, typography, color, interactions, responsive behavior.
3. Capture baseline screenshot artifact(s) before changes when required.
4. Implement UI changes.
5. Capture post-change screenshot artifact(s) after changes.
6. Produce completion proof:
   - before path(s),
   - after path(s),
   - short visual delta summary mapped to requested visuals.
7. Update handoff sections:
   - `Completion State`,
   - `Outstanding Blockers`,
   - `Visual References`,
   - `UI Evidence Artifacts`.
8. If evidence cannot be produced, mark `Completion State` as `INCOMPLETE` and include blocker + next action.

## Artifact Naming Convention

Store UI artifacts in `.codex/artifacts/ui-checks/` and use:

- `{task-slug}-{route}-before-{timestamp}.png`
- `{task-slug}-{route}-after-{timestamp}.png`

## Completion Rule

- Do not claim completion for screenshot-gated UI tasks without artifact paths.
