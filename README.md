# UBIK Unified UI

This branch is the current consolidated unified UI pass for UBIK. It captures the design and implementation work completed across the last four UI sessions since `feature/unified-ui` was pulled, so anyone opening the repo can immediately see what changed and where the product now stands.

## Current state

- Shell, Home, Inbox, Meetings, Projects, Approvals, Workflows, and Know Anything have been brought onto the same shadcn preset language.
- Inbox has gone through another cleanup pass:
  - the left rail header now relies only on the middle-panel collapse/expand affordance; the duplicate control inside the rail is gone
  - the reply compose surface no longer repeats an extra `Reply / To` header row
  - attachment/send actions now sit directly below the draft editor, before suggested insertions
- `Know Anything` is now a composer-first operator workspace instead of a prototype-like utility dashboard.
- The latest reset tightened `Know Anything` into a smaller AI-app composer with:
  - footer mode dropdown for `Plan`, `Research`, and `Model Council`
  - separate listening/mic affordance
  - inherited-mode scheduling with no popup mode leakage
- `Tasks` now exists as a first-class route and receives routed follow-through from Home.
- Charts are no longer bar-only; Home and Projects now use more context-appropriate chart types.
- Build and tests are passing on the latest pass:
  - `pnpm build`
  - `pnpm test`

## What changed across the four sessions

| Session | Theme | Main outcomes |
| --- | --- | --- |
| 1 | Theme fidelity foundation | Unified the shell, Home, Inbox, and Meetings around the shadcn preset with sharper card structure, cleaner spacing, and stronger visual hierarchy. |
| 2 | Root-cause UI cleanup | Reworked the older prototype holdouts: Know Anything, shared runtime/editor surfaces, Projects, Approvals, Workflows, and the lower-priority pages. |
| 3 | Data surfaces and operator home | Diversified charts, replaced the old Home activity feed with the morning brief system, and added usage intelligence plus stronger Know Anything quick-start patterns. |
| 4 | Final tightening | Added `/tasks`, tightened tabs and shell rails, simplified task priority into structural meters, and reset `Know Anything` into a smaller composer-first AI surface with dropdown reasoning modes and separate listening control. |

## Biggest product changes

### 1. Shared shell and preset convergence

- The app now reads as one product instead of a polished shell around mixed prototype pages.
- Top rails, tabs, cards, badges, drawers, and work surfaces now follow the same sharp preset geometry.
- Blue remains the primary action color and amber remains support emphasis.

### 2. Home became an actual operator surface

- The old activity feed was replaced by a brief-first Home.
- Home now includes:
  - a morning brief hero
  - denser carry-forward tabs
  - contextual KPI widgets
  - usage intelligence with `Overview` and `Models`
  - better task routing into `/tasks`

### 3. Know Anything was rebuilt as a cleaner AI workspace

- The route now behaves more like a modern operator assistant surface:
  - compact composer-first layout
  - separate listening/mic control
  - dropdown reasoning modes for `Plan`, `Research`, and `Model Council`
  - inline `@` context suggestions
  - inline `/` skills suggestions
  - simplified scheduling
- Older clutter like visible Internet toggles, utility sidecards, and duplicated control systems was removed.

### 4. Tasks is now a real destination

- `/tasks` was added as a first-class route and left-nav item.
- Tasks unify follow-through from:
  - inbox
  - meetings
  - approvals
  - workflow runs
- Rows now support:
  - `Priority`
  - `Add to project`
  - `Assign`
  - `Schedule`

### 5. Charts are now context-aware

- Home and Projects no longer rely almost entirely on bar-family charts.
- The UI now uses area, bar, donut, and radial patterns where the data shape actually justifies them.

### 6. Inbox compose now follows the cleaner composer rhythm

- The inbox thread experience is denser and less repetitive:
  - no duplicate reply-state header inside the compose card
  - no redundant inbox title inside the left list rail
  - compose actions now sit closer to the draft area instead of being separated by insertion cards

## Key files and areas touched

- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/pages/Home.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/pages/Index.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/pages/Inbox.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/pages/Meetings.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/pages/Projects.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/pages/Approvals.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/pages/Workflows.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/pages/Tasks.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/components/ui/tabs.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/components/WorkbenchTabs.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/lib/ubik-data.ts`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/lib/ubik-types.ts`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/index.css`

## Where to look next

- Detailed session-by-session log: [CHANGELOG.md](/Users/shubhranshujha/Codex/simplify-visualize-act/CHANGELOG.md)
- Resume context and visual evidence: [handoff.md](/Users/shubhranshujha/Codex/simplify-visualize-act/handoff.md)

## Reviewer shortcut

If you want the fastest tour of the branch, review these routes in order:

1. `/home`
2. `/inbox`
3. `/meetings`
4. `/`
5. `/tasks`
