# Unified UI Handoff

## Status
- Latest completed pass: **Sidebar UBIK wordmark cleanup**.
- Verification is green for this pass:
  - `pnpm exec eslint src/components/AppSidebar.tsx`
  - `pnpm build`
- Browser verification used Playwright against `http://127.0.0.1:8082/?tab=chat-home`.
- No open functional blocker.

## Latest visual requirements
- Layout:
  - remove the extra favicon square from the expanded sidebar brand area
  - remove the `Enterprise` sublabel so the wordmark can occupy the header space cleanly
  - keep the collapsed-sidebar mark available without affecting the expanded header
- Spacing:
  - align the wordmark with the sidebar header controls
  - avoid the previous cramped two-logo stack
- Typography:
  - do not mix raster wordmark with typed brand text in the expanded state
- Color:
  - use transparent light/dark wordmark variants directly on the sidebar surface
  - avoid pulling a favicon-style mark with a visible dark background into the expanded header
- Interactions:
  - sidebar collapse behavior stays unchanged
- Responsive behavior:
  - desktop light and dark modes were checked for the sidebar brand area

## Visual evidence
- After light mode (expanded sidebar wordmark only): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/ubik-wordmark-sidebar-light-after.png`
- After dark mode (transparent dark-mode wordmark, no favicon square): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/ubik-wordmark-sidebar-dark-after.png`

## Visual delta summary
- The expanded sidebar no longer shows a separate favicon square beside the wordmark.
- The `Enterprise` label is gone, giving the wordmark the full brand row.
- Dark mode now renders the transparent white wordmark on the sidebar surface instead of showing a favicon-like asset with an unwanted background.

## Status
- Latest completed pass: **UBIK logo and favicon asset refresh**.
- Verification is green for this pass:
  - `pnpm exec eslint src/components/AppSidebar.tsx`
  - `pnpm build`
  - `pnpm test`
- Browser verification used Playwright against `http://127.0.0.1:8082/?tab=chat-home` because Browser plugin control was not exposed in this session.
- No open functional blocker.

## Latest visual requirements
- Layout:
  - replace the temporary sparkle shell mark with the real UBIK brand mark and wordmark
  - preserve the existing sidebar geometry and nav density
  - keep the mobile viewport stable after favicon/mobile icon metadata is added
- Spacing:
  - keep the logo inside the existing 32px brand mark footprint
  - keep the wordmark and `Enterprise` label aligned with the previous brand stack
- Typography:
  - replace the typed `UBIK` label with the copied raster wordmark in the expanded sidebar
  - keep `Enterprise` as the secondary workspace label
- Color:
  - use light/dark logo variants with the existing tokenized sidebar surfaces
  - keep the primary blue brand accent from the copied UBIK assets
- Interactions:
  - the sidebar collapse trigger and brand button behavior stays unchanged
  - favicon links include light, dark, fallback, Apple touch, and manifest entries
- Responsive behavior:
  - desktop sidebar and mobile viewport were both checked after the asset swap

## Visual evidence
- Before desktop (old sparkle sidebar mark): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/ubik-logo-favicon-before.png`
- Before mobile (pre-metadata mobile viewport): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/ubik-logo-favicon-mobile-before.png`
- After desktop (UBIK mark and wordmark in sidebar): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/ubik-logo-favicon-after.png`
- After mobile (mobile viewport still stable after icon metadata): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/ubik-logo-favicon-mobile-after.png`

## Visual delta summary
- The sidebar brand area now uses the copied UBIK raster mark and wordmark instead of the generic sparkle icon plus typed brand name.
- The document metadata now names the app `UBIK Unified UI` and exposes light/dark favicon links, a fallback favicon, Apple touch icon, and web app manifest for mobile install surfaces.
- The mobile viewport remained visually stable; the favicon/mobile changes live in document metadata rather than adding mobile-only page chrome.

## Status
- Latest completed pass: **Projects Scope Router V1**.
- Verification is green for this pass:
  - `pnpm exec eslint src/components/shell-state.tsx src/App.tsx src/pages/Projects.tsx src/pages/Workflows.tsx src/components/AppSidebar.tsx src/components/projects/ScopeQueue.tsx src/components/projects/ProjectDetail.tsx src/components/projects/PresetGallery.tsx src/components/projects/ProjectStepper.tsx src/components/projects/DecisionTrace.tsx src/components/projects/variants/VMIDetail.tsx src/components/projects/variants/DocQueueDetail.tsx src/lib/project-presets.ts src/lib/project-types.ts src/test/example.test.ts`
  - `pnpm exec vitest run src/test/example.test.ts -t "Projects|Workflows|project"`
  - `pnpm test`
  - `pnpm build`
- Browser verification is green for this pass:
  - `/projects` redirects to `/projects/po-queue`
  - `/workflows` redirects to `/projects/templates`
  - Projects sidebar scope children update the route and queue
  - MR-Q2 opens the canonical dashboard detail
  - VMI and Doc Queue projects render their variant detail modules
  - bulk multi-select shows the bottom action bar and `Archive` removes selected visible rows
  - `+ New from preset` creates a local project instance and routes to detail
- No open functional blocker.

## Latest visual requirements
- Layout:
  - Projects now behaves like the Inbox-style workbench: global Projects sidebar scopes, a left in-page scope rail, a middle queue, and a right detail area
  - keep this pass Projects-only; Meetings parity stays parked
  - fold the old Workflows surface into Projects Templates instead of keeping a separate workflow-builder page
  - use representative dummy projects and 1-2 step preset journeys rather than a heavy workflow model
- Spacing:
  - keep queue rows dense and scannable with inline actions on hover
  - keep detail dashboards organized into header, tabs, stat row, status/variant band, operational cards, and trend/trace modules
- Typography:
  - preserve the existing mono micro-labels and sharp operational dashboard hierarchy
  - use project IDs, scope labels, and status badges as compact metadata rather than marketing copy
- Color:
  - stay inside the shadcn/Radix preset tokens, white/card surfaces, sharp radii, and blue primary accents
  - use risk/status color only as small badges and indicators
- Interactions:
  - scope navigation changes URL and queue contents
  - single rows expose inline actions
  - Cmd/Ctrl click and Shift click support multi-select
  - the bottom bulk bar supports `Assign`, `Delegate`, `Archive`, `Pause`, `Run`, `Tag`, and `Reassign`
  - Templates can create a local browser/session project instance through `useWorkbenchState`
- Responsive behavior:
  - current verification focused on the desktop workbench viewport matching the supplied screenshot context

## Visual evidence
- Before (flat Projects page before scope-router pass): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/projects-inbox-match-before.png`
- After (Projects scope router with PO Queue, queue rows, and detail area): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/projects-scope-router-after.png`
- After (Templates scope folded in from Workflows): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/projects-templates-after.png`
- After (MR-Q2 canonical dashboard detail): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/projects-mr-q2-detail-after.png`
- After (VMI detail variant): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/projects-vmi-variant-after.png`
- After (Doc Queue detail variant): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/projects-docqueue-variant-after.png`
- After (bulk multi-select action bar): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/projects-bulk-actions-after.png`

## Visual delta summary
- Projects changed from a flat index into an Inbox-like scoped workspace with scope rails, count badges, a filterable queue, and a persistent detail canvas.
- The global Projects sidebar now expands to the requested scopes instead of listing project instances, and the old Workflows route now lands on `/projects/templates`.
- MR-Q2 provides the canonical project dashboard shape, while VMI and Doc Queue use lighter variant modules to prove the detail layout can swap scope-specific middle bands.
- The queue now supports row actions, multi-select, and archive behavior without adding Kanban/Gantt chrome.
- Templates now use small preset cards with simple 1-2 step journeys and can create local project instances without backend or source-file mutation at runtime.

## Status
- Latest completed pass: **pnpm-only package-manager cleanup**.
- Verification is green for this pass:
  - `pnpm install`
  - `pnpm exec vite --version`
  - `pnpm build`
- `pnpm run dev` was also verified to start cleanly after reinstall, then the temporary check process was stopped.
- No open functional blocker.

## Latest workflow requirements
- Package management:
  - this repo now treats `pnpm` as the only supported package manager
  - `pnpm-lock.yaml` is the single dependency source of truth
  - the legacy npm lockfile was removed because it was scaffold carryover and caused mixed-manager installs
- Developer entry path:
  - use `pnpm install`
  - use `pnpm run dev`
  - do not use `npm install` or `npm run dev`
  - if someone already ran `npm install`, rerun `pnpm install` to repair `node_modules`

## Change summary
- Removed `/Users/shubhranshujha/Codex/simplify-visualize-act/package-lock.json`.
- Added an explicit `pnpm` setup section to `/Users/shubhranshujha/Codex/simplify-visualize-act/README.md`.
- Recorded the package-manager standardization here so fresh sessions do not reintroduce dual-lockfile drift.

## Status
- Latest completed pass: **Multi-surface cleanup across Inbox, Meetings, Tasks, and Know Anything**.
- Verification is green for this pass:
  - `pnpm exec eslint src/pages/Inbox.tsx src/pages/Meetings.tsx src/pages/Tasks.tsx src/pages/Index.tsx src/components/rich-operator-editor.tsx src/test/example.test.ts`
  - `pnpm exec vitest run src/test/example.test.ts -t "chat|Chat|meeting|Meeting|meetings|Meetings|task|Task|tasks|Tasks|Inbox|inbox"`
  - `pnpm build`
  - `pnpm test`
- `eslint` still reports only the existing `react-hooks/exhaustive-deps` warnings in `src/pages/Inbox.tsx`, `src/pages/Index.tsx`, and `src/pages/Meetings.tsx`; no new lint errors were introduced.
- No open functional blocker.

## Latest visual requirements
- Layout:
  - keep two-item rail toggles in Inbox and Meetings evenly split across the available width instead of leaving dead space for a non-existent third segment
  - strip the duplicate Tasks page/list headings so the list opens directly into filters and grouped rows
  - make task groups collapsible by section header
  - replace Know Anything's suggested-asks module with a simpler previous-chats history block
  - turn the Meetings `Summary` tab into one editable markdown document and replace the old add-line task routing with a lighter task-nudge treatment
  - move task `Activity` out of the right rail into the main work column, with suggestions presented as lighter helper nudges
- Spacing:
  - reduce empty spacing inside `Actions / Category` and `Folders / Meetings`
  - keep the task list scan-first after removing the duplicate title chrome
  - keep task detail suggestions in one horizontal row rather than stacked cards
- Typography:
  - preserve existing mono utility labels and title hierarchy
  - let Meetings summary read like a markdown note with heading structure instead of boxed dashboard copy
  - use a simpler `Previous chats` label on the Know Anything history module
- Color:
  - stay inside preset white/card surfaces
  - keep task-detail suggestions visibly secondary with dashed borders instead of white stacked boxes
  - keep the rich editor closer to the preset by removing extra rounded grey wells
- Interactions:
  - Inbox and Meetings toggle behavior stays the same after the width cleanup
  - Tasks section headers collapse/expand independently
  - Know Anything history rows should seed the composer from a prior thread instead of acting like category chips
  - Meetings summary should support markdown editing in one surface, and task nudges should route checklist items without the old routing form
  - Task detail activity should be editable from the main middle column with the same `Add update` flow preserved
- Responsive behavior:
  - all changes were validated at the review widths shown in the diff-comment screenshots

## Visual evidence
- Before (Inbox rail with under-filled two-item toggle): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-ui-comments-before.png`
- After (Inbox rail with balanced `Actions / Category` toggle): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-ui-comments-after.png`
- Before (Meetings rail and older summary shell): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-ui-comments-before.png`
- After (Meetings rail with balanced toggle plus white markdown summary shell): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-ui-comments-after.png`
- After (Meetings summary with rich markdown content and lightweight task nudge row): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-summary-rich-ui-comments-after.png`
- Before (Tasks list with duplicate heading chrome): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-list-ui-comments-before.png`
- After (Tasks list with direct filters and collapsible sections): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-list-ui-comments-after.png`
- Before (Task detail with activity isolated in the side rail): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-detail-ui-comments-before.png`
- After (Task detail top shell after layout cleanup): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-detail-ui-comments-after.png`
- After (Task detail activity moved into the main column with dashed suggestions): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-detail-activity-ui-comments-after.png`
- Before (Know Anything with suggested asks): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/chat-home-ui-comments-before.png`
- After (Know Anything with previous chats history block): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/chat-home-ui-comments-after.png`

## Visual delta summary
- Inbox and Meetings rail toggles now occupy the full two-item width evenly, so the controls no longer look like three-segment shells with missing content.
- Tasks list no longer repeats the page heading and execution-queue intro before the actual work surface. It opens straight into filters and collapsible sections.
- The selected task now keeps `Activity` in the main work column, while the right rail is reserved for properties. The suggestion helpers are lighter dashed nudges in a single row instead of stacked white cards.
- Know Anything no longer uses the suggested-asks strip. It now shows a `Previous chats` history module with a history icon and thread rows underneath.
- Meetings `Summary` now behaves like a single markdown document, and the old add-line task routing chrome is replaced by a simpler task-nudge row with inline action routing.

## Status
- Latest completed pass: **Inbox/Meetings rail selection consistency cleanup**.
- Verification is green for this pass:
  - `pnpm build`
  - `pnpm test`
  - `pnpm exec eslint src/pages/Inbox.tsx src/pages/Meetings.tsx`
- `eslint` still reports only the existing hook-dependency warnings in `Inbox.tsx` and `Meetings.tsx`; no new errors were introduced.
- No open functional blocker.

## Latest visual requirements
- Layout:
  - keep Inbox and Meetings nested rail rows on clean white surfaces instead of grey box fills
  - use the same active-row treatment across both pages rather than one surface using a solid blue row and the other using a faint card
  - remove bordered icon wells from the Meetings rail rows
- Spacing:
  - preserve the compact row density while moving to bordered white cards
  - keep the count pill aligned to the right edge without extra icon framing
- Typography:
  - selected row labels should stay readable without fading into heavy fills
  - descriptions remain secondary but should not disappear against the active state
- Color:
  - use subtle preset blue highlighting for the active row instead of mixed blue/grey slabs
  - keep the base rail surface white, not muted grey
- Interactions:
  - selection behavior remains unchanged; this pass only normalizes the visual treatment
- Responsive behavior:
  - the lighter active treatment should still read clearly at the narrow review widths used in the sidebar comments

## Visual evidence
- Before (Inbox rail after dummy folder pass, still mixing solid blue and grey row treatments): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-rail-toggle-dummy-folders-after.png`
- Before (Meetings rail after dummy folder pass, still using boxed icons and a different active row style): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-rail-toggle-dummy-folders-full-after.png`
- After (Inbox rail with white row cards and a subtle active border): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-rail-selection-consistency-after.png`
- After (Meetings rail with matching row treatment and borderless icons): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-rail-selection-consistency-after.png`

## Visual delta summary
- Inbox and Meetings now use the same nested-rail grammar: white bordered rows, subtle active highlight, and cleaner count pills.
- The heavy solid-blue selected folder row is gone, so readability no longer depends on forced white-on-blue contrast.
- Meetings icons now sit directly on the row without little bordered boxes, which makes the rail feel cleaner and more consistent with the rest of the preset.

## Status
- Latest completed pass: **Meetings detail white-document cleanup**.
- Verification is green for this pass:
  - `pnpm exec eslint src/pages/Meetings.tsx src/test/example.test.ts`
  - `pnpm exec vitest run src/test/example.test.ts -t "meeting|Meeting|meetings|Meetings"`
  - `pnpm build`
  - `pnpm test`
- `eslint` still reports only the existing `react-hooks/exhaustive-deps` warning in `src/pages/Meetings.tsx:1512`; no new lint errors were introduced.
- No open functional blocker.

## Latest visual requirements
- Layout:
  - replace the meeting detail summary card stack with one cleaner white document surface
  - keep the existing meeting header structure, tab model, and bottom Q&A composer unchanged
  - keep `Transcript` and `Files` semantically separate tabs, but visually lighter and closer to the preset
- Spacing:
  - remove the heavy grey boxed treatment from the summary sections
  - tighten transcript/file rows so they sit inside white surfaces with lighter borders and less dead space
- Typography:
  - preserve the mono section labels and current meeting title hierarchy
  - make summary content read like an editable document instead of stacked dashboard cards
- Color:
  - stay inside preset token surfaces with white/card backgrounds and sharp corners
  - avoid reintroducing dull grey fill blocks in the summary area
- Interactions:
  - `Overview`, `Decisions`, `Risks & blockers`, and `Key insights` should be editable in-place inside the summary document
  - `Action items` should remain editable and routable into tasks from the same summary document
  - `Summary`, `Transcript`, and `Files` tabs should still switch correctly
  - the bottom `Ask this meeting anything...` composer stays untouched
- Responsive behavior:
  - the cleaned document surface should still read as one continuous pane at the review width without collapsing back into stacked grey chrome

## Visual evidence
- Before (meeting summary with grey stacked sections): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-detail-summary-before-cleanup.png`
- Before (meeting transcript before cleanup): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-detail-transcript-before-cleanup.png`
- Before (meeting files before cleanup): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-detail-files-before-cleanup.png`
- After (meeting summary as a white editable document): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-detail-summary-after-cleanup.png`
- After (meeting transcript with lighter preset-aligned rows): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-detail-transcript-after-cleanup.png`
- After (meeting files with lighter preset-aligned rows): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-detail-files-after-cleanup.png`

## Visual delta summary
- The summary tab no longer reads as a stack of dull grey cards. It is now one white document surface with editable overview, decisions, action items, risks, and insights separated by light dividers.
- Transcript and Files keep their original roles, but the rows now sit inside cleaner white/card containers with sharper borders and less visual weight.
- The bottom meeting Q&A composer stayed exactly where it was, so this pass cleans the detail canvas without changing the ask flow.

## Status
- Latest completed pass: **Inbox/Meetings rail toggle width cleanup and dummy folder refresh**.
- Verification is green for this pass:
  - `pnpm build`
  - `pnpm test`
  - `pnpm exec eslint src/pages/Inbox.tsx src/pages/Meetings.tsx`
- `eslint` still reports only the existing hook-dependency warnings in `Inbox.tsx` and `Meetings.tsx`; no new errors were introduced.
- No open functional blocker.

## Latest visual requirements
- Layout:
  - keep the Inbox and Meetings segmented rail toggles content-fit instead of stretching across the rail
  - make the two pills inside each toggle equal-width so `Actions / Category` and `Folders / Meetings` read like balanced autolayout controls
  - keep this pass limited to the rail controls and dummy folder labels only; no landing canvas redesign
- Spacing:
  - remove the dead space inside the two-item toggle controls
  - preserve the current rail card/list spacing while swapping the placeholder folder rows
- Typography:
  - keep the existing mono micro-label treatment and current toggle label sizing
  - rename placeholder folder rows so they read like folder scopes instead of customer labels
- Color:
  - preserve the current preset token styling for toggle active states and count pills
- Interactions:
  - Inbox `Actions` and Meetings `Folders` should still switch cleanly after the width change
  - zero-count placeholder folders should remain visible in Meetings instead of disappearing from the rail
- Responsive behavior:
  - the narrower review widths should still show the toggle groups as compact, balanced controls

## Visual evidence
- Before (Inbox rail with older action buckets and uneven-looking toggle spacing): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-comment-tabs-back-after.png`
- Before (Meetings rail before dummy folder refresh): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-comment-tabs-fit-after.png`
- After (Inbox rail with equal-width toggle pills and generic dummy action folders): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-rail-toggle-dummy-folders-after.png`
- After (Meetings rail with equal-width toggle pills and refreshed folder placeholders): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-rail-toggle-dummy-folders-full-after.png`

## Visual delta summary
- Inbox `Actions / Category` and Meetings `Folders / Meetings` now size like compact autolayout controls instead of leaving awkward internal whitespace.
- Inbox action rows now use the generic placeholder set `Quick Note`, `Private`, `This Week`, `This Month`, and `History`.
- Meetings folders now keep `All meetings` at the top and add the same folder-like placeholders, with counts still visible even when a scope is just a dummy bucket.

## Status
- Latest completed pass: **Preset-coded task priorities and Linear-style task document split**.
- Verification is green for this pass:
  - `pnpm exec eslint src/lib/task-helpers.ts src/components/task-controls.tsx src/pages/Tasks.tsx src/test/example.test.ts`
  - `pnpm exec vitest run src/test/example.test.ts -t "task|Task|tasks|Tasks"`
  - `pnpm build`
  - `pnpm test`
- No open functional blocker.

## Latest visual requirements
- Layout:
  - replace the translucent severity treatment in Home and Tasks with preset-aligned priority badges
  - keep Home plus task list/kanban scan-first, but make the selected task route read like a simple white editor
  - move task activity/updates out of the main document and into a right-side rail
  - keep task properties visible together in the top half of the selected-task view with icon-led controls and shortcut hints
- Spacing:
  - preserve the one-line density of priority badges in Home, list, and kanban
  - keep the task document body open and uncluttered instead of stacking internal cards and tabs
- Typography:
  - preserve the current mono utility labels and large task title
  - keep the editor copy comfortable and plain, closer to a document surface than a dashboard
- Color:
  - use preset token colors for task priority instead of translucent red warning chips
  - keep the task document inside the existing white/card surfaces
- Interactions:
  - the task route should expose `Add update` from the command bar and from the activity rail
  - properties should remain directly editable with the existing task shortcuts (`A`, `P`, `L`, `S`, `0-4`, `U`)
- Responsive behavior:
  - the right rail should remain a distinct secondary column without collapsing the editor into dense cards

## Visual evidence
- Before (Home priority badges before preset recode): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-priority-linear-after.png`
- Before (Tasks list priority badges before preset recode): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-list-priority-linear-after.png`
- Before (Tasks kanban priority badges before preset recode): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-kanban-priority-linear-after.png`
- Before (Tasks document before editor/right-rail split): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-detail-merged-after.png`
- After (Home priority badges with preset-coded tones): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-priority-preset-after.png`
- After (Tasks list priority badges with preset-coded tones): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-list-priority-preset-after.png`
- After (Tasks kanban priority badges with preset-coded tones): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-kanban-priority-preset-after.png`
- After (Tasks document with simple editor and activity rail): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-detail-editor-rail-after.png`

## Visual delta summary
- Home, task list, and kanban now use crisp preset-coded priority badges with white backgrounds and token-colored icons/text instead of translucent red severity chips.
- The selected task no longer reads as tabs plus stacked dashboard cards. It now uses a plain document editor on the left and a dedicated properties/activity rail on the right.
- Task updates are now clearly secondary: they stay visible in the rail, while the main pane stays reserved for the working document.

## Status
- Latest completed pass: **Tasks document header cleanup and Details/Edit merge**.
- Verification is green for this pass:
  - `pnpm build`
  - `pnpm exec eslint src/pages/Tasks.tsx src/test/example.test.ts`
  - `pnpm test`
- No open functional blocker.

## Latest visual requirements
- Layout:
  - remove the metadata chip row beside and below the assignee heading in the individual task document
  - merge `Details` and `Edit` into one working surface so the selected task only exposes `Details` and `Updates`
  - keep the selected task document readable as a simple working page instead of a dense dashboard header
- Spacing:
  - preserve whitespace around the title and summary once the chip row is removed
  - keep edit controls grouped in the document body rather than spread across a separate tab
- Typography:
  - preserve the mono section labels and the large task title treatment
  - keep the body copy readable without adding another utility row under the title
- Color:
  - stay inside the preset token system and keep sharp-corner controls
- Interactions:
  - clicking task edit affordances should land in the merged `Details` surface instead of an `Edit` tab
  - the task document should still expose `Updates` as the secondary panel
- Responsive behavior:
  - the simplified header should hold together cleanly at the review width without a wrapping chip rail

## Visual evidence
- Before (task document with header chip row and separate `Edit` tab): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-detail-after.png`
- After (task document with clean header and merged `Details` surface): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-detail-merged-after.png`
- After (tasks list sanity pass after merged-detail refactor): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-list-merged-after.png`

## Visual delta summary
- The selected task header no longer carries the extra metadata chip rail; it now reads as title plus summary only.
- `Edit` is no longer a separate tab. The task document now exposes `Details` and `Updates`, with assignee/project/priority/quick-edit controls folded into the `Details` surface.
- The tasks list still renders as a compact one-line scan table after the refactor, so the detail cleanup did not reintroduce the earlier list-view regression.

## Status
- Latest completed pass: **Linear-style priority icon pass across Home and Tasks**.
- Reference used for this pass:
  - live demo: `https://shadcn-linear-combobox.vercel.app/`
  - source repo: `https://github.com/damianricobelli/shadcn-linear-combobox`
- Verification is green for this pass:
  - `pnpm build`
  - `pnpm exec eslint src/components/task-controls.tsx src/pages/Home.tsx src/pages/Tasks.tsx src/test/example.test.ts`
  - `pnpm test`
- No open functional blocker.

## Latest visual requirements
- Layout:
  - keep the existing Home/list/kanban priority placement, but replace the plain text badges with the Linear-style icon plus label treatment
  - use the same priority icon language inside the task edit priority picker so the inline badge and picker match
- Spacing:
  - keep the badges compact enough to preserve the one-line task scan pattern
  - avoid expanding the right edge of task rows just to fit the new icons
- Typography:
  - use the existing task label sizing, with the icon leading the severity text rather than replacing it
- Color:
  - keep current app severity tones for now, but use the Linear icon silhouettes
- Interactions:
  - Home execution rows, Tasks list rows, and kanban cards should all render the same priority glyphs
  - the picker should show the same five options with the matching icons and numeric shortcuts
- Responsive behavior:
  - the new icon badges should remain legible in the narrow Home card and in narrow kanban cards

## Visual evidence
- Before (Home priority badges before Linear icons): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-task-feed-after.png`
- Before (Tasks list priority badges before Linear icons): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-list-after.png`
- Before (Tasks kanban priority badges before Linear icons): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-kanban-after.png`
- After (Home priority badges with Linear icons): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-priority-linear-after.png`
- After (Tasks list priority badges with Linear icons): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-list-priority-linear-after.png`
- After (Tasks kanban priority badges with Linear icons): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-kanban-priority-linear-after.png`
- After (Tasks priority picker with Linear icon set): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-priority-menu-linear-after.png`

## Visual delta summary
- Priority badges now read with the Linear-style iconography instead of plain text alone: urgent uses the filled exclamation square, no-priority uses the dash triplet, and high/medium/low use the three-bar stack with fading bars.
- The same glyphs now appear consistently in Home, the Tasks list, kanban cards, and the task edit picker, so the severity language no longer changes by surface.
- The row density remains intact because the icons were added inside the existing compact badge footprint instead of expanding the task layout.

## Status
- Latest completed pass: **Inbox/Meetings toggle fit cleanup, Tasks detail simplification, and Meetings command-bar rebalance**.
- Verification for this pass:
  - `pnpm build`
  - `pnpm exec eslint src/pages/Inbox.tsx src/pages/Meetings.tsx src/pages/Tasks.tsx`
- `pnpm exec eslint src/pages/Inbox.tsx src/pages/Meetings.tsx src/pages/Tasks.tsx` still reports the same pre-existing hook-dependency warnings in `Inbox.tsx`, but no errors.
- `pnpm test` was not rerun in this pass; last known status is still the unrelated Tasks deep-link failure in `src/test/example.test.ts` (`Unable to find an element with the text: Pending.`)
- No open functional blocker.

## Latest visual requirements
- Layout:
  - inbox and meetings scope toggles should fit their labels tightly instead of stretching across extra whitespace
  - inbox detail command bar should use a back affordance instead of the old `Hide sidebar` text control
  - meetings detail command bar should place `New` in the center and push `Delete` closer to the right edge, with a back affordance before the actions
  - tasks list command bar should only expose list/kanban switching plus task creation
  - tasks detail should remove the generic page heading block and read as a simpler task document
  - tasks `Description` tab should be doc-style and not repeat linked-context/status blocks already shown in the header
- Spacing:
  - remove extra dead width around the two-tab toggles in inbox and meetings
  - keep task detail tighter and avoid decorative placeholder geometry
- Typography:
  - preserve the mono micro-label treatment for section labels and shortcut badges
  - keep the task document title and description readable without additional dashboard clutter
- Color:
  - stay inside the current preset blue/yellow/neutral token language
  - keep the active task/inbox/meetings controls in preset utility styling
- Interactions:
  - inbox detail now keeps sidebar collapse as an icon-only control and adds `Back to list`
  - meetings detail now keeps sidebar collapse as an icon-only control and adds `Back`
  - tasks detail keeps `Description / Edit / Updates`, but `Description` is now the primary doc-like tab
- Responsive behavior:
  - the tightened two-tab controls should still read as one compact unit at the narrower widths used in review comments

## Visual evidence
- Before (inbox toggle spacing + old detail top bar): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-hotkey-detail-after.png`
- Before (meetings toggle spacing): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-command-rail-landing-after.png`
- Before (meetings old command bar balance): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-detail-command-rail-after.png`
- Before (tasks list command bar with extra actions): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-hotkey-topbar-after.png`
- Before (tasks detail with placeholder heading and denser dashboard layout): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-linear-refactor-after-detail.png`
- After (inbox detail toggle fit + back affordance): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-comment-tabs-back-after.png`
- After (meetings landing tab fit): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-comment-tabs-fit-after.png`
- After (meetings detail command bar rebalance): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-comment-commandbar-after.png`
- After (tasks list command bar simplification): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-comment-list-commandbar-after.png`
- After (tasks detail document cleanup): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-comment-detail-doc-after.png`

## Visual delta summary
- Inbox and Meetings no longer waste horizontal space inside the two-item scope toggles; the controls now size to the actual tab content.
- Inbox detail replaced the `Hide sidebar` text button with an icon-only rail toggle and a clearer `Back to list` action.
- Meetings detail now reads in the requested hierarchy: back on the left, `New` centered, and `Delete` pushed toward the right near the calendar action.
- Tasks list now has a focused top bar for `List`, `Kanban`, and `Add task` only.
- Tasks detail now drops the extra page heading, uses a cleaner header, and turns the main tab into a description-style working document instead of repeating status/context cards.
