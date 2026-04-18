# Unified UI Handoff

## Status
- Latest completed pass: **Inbox left-rail collapse cleanup pass**.
- Verification is green:
  - `pnpm build`
  - `pnpm test`
- No open functional blocker.

## Latest visual requirements
- Layout:
  - remove the duplicate collapse button from the left inbox rail entirely
  - rely on the middle-panel expand/collapse control as the only inbox hide/show affordance
  - keep the rest of the left rail layout unchanged after removing that extra control
- Spacing:
  - keep the left rail header visually quiet with only the unread/sent toggle and search stack
- Typography:
  - no new copy; remove the redundant affordance instead of relabeling it
- Color:
  - stay on preset light/dark tokens instead of a copied black strip
  - preserve the current inbox rail colors while changing only structure
- Interactions:
  - the inbox collapse/expand affordance now exists only in the middle-panel command rail
- Responsive behavior:
  - the left rail should not reserve vertical space for a redundant control row

## Visual evidence
- Before (duplicate collapse button still present): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-compose-cleanup-after-full.png`
- After (left rail duplicate collapse button removed): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-left-rail-collapse-removed-after-full.png`

## Visual delta summary
- The left rail no longer contains its own collapse button.
- The unread/sent toggle and search field now start immediately at the top of the inbox rail.
- The middle-panel rail remains the only place where the inbox hide/show control lives.

## Status
- Latest completed pass: **Inbox command bar correction: dark auto-layout rail with persistent left-edge inbox toggle**.
- Verification is green:
  - `pnpm build`
  - `pnpm test`
- No open functional blocker.

## Latest visual requirements
- Layout:
  - make the thread actions read like the compact dark command-bar reference, not a loose bordered toolbar
  - keep the nested inbox toggle permanently at the far-left edge of the command component so its purpose is obvious even before collapse
  - preserve the rest of the thread header layout while tightening only the command bar geometry
- Spacing:
  - use content-width auto-layout segments instead of wide button cells
  - keep the command rail dense with uniform item height and small internal gaps
- Typography:
  - keep command labels short and the hotkey token compact
  - avoid oversized command cells that create visual dead space
- Color:
  - use an inverted dark utility rail inside the light page shell
  - keep the hotkey token darker and denser inside the rail
- Interactions:
  - left-most list icon toggles the inbox rail in both open and collapsed states
  - keep only subtle hover/state transitions and respect reduced motion
- Responsive behavior:
  - allow the command rail to wrap only when it truly needs to; desktop should read as one compact command strip

## Visual evidence
- Before (user-shared problematic state, rail open): `/Users/shubhranshujha/Desktop/Screenshot 2026-04-18 at 3.52.53 AM.png`
- Before (previous fix, command strip still too loose): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-refine-top-focus.png`
- After (command bar focus): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-command-bar-fix-top-focus.png`
- After (full page, rail collapsed): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-command-bar-fix-collapsed-full.png`
- After (full page baseline, rail open): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-command-bar-fix-after-full.png`

## Visual delta summary
- The thread actions now sit in a single dark utility rail that tracks much closer to the shared command-bar example.
- The inbox toggle is no longer buried in the middle of the actions; it is now the first control at the far-left edge of the rail in both states.
- The command items now size to content, so the strip reads like auto-layout instead of a row of equally heavy bordered cells.
- The hotkey chip is visually denser and nested inside the rail rather than floating as a separate oversized cell.

## Status
- Latest completed pass: **Inbox refinement pass: list-icon inbox restore, denser action strip, collapsed recipients, artifact-only insertions**.
- Verification is green:
  - `pnpm build`
  - `pnpm test`
- No open functional blocker.

## Latest visual requirements
- Layout:
  - keep the inbox-restore control as the first item in the action strip and render it as a list icon instead of a text button
  - make the action strip read closer to the shared compact hotkey example, with contiguous segments instead of loose standalone buttons
  - keep `To` as the only header card in the compose surface
  - collapse `Cc` and `Bcc` into compact pill rows that show suggested people before expansion instead of tall empty wells
  - keep suggested insertions restricted to concrete outbound artifacts only: attachments, image/chart inserts, documents, and ERP/shipment tracking links
- Spacing:
  - reduce wasted vertical space in the recipient rows
  - let longer prefilled replies naturally occupy more height so some threads feel denser and more realistic
- Typography:
  - keep the monospaced micro-label treatment for queue labels and compose section labels
  - remove generic draft-suggestion language from the insertion tray
- Color:
  - keep the dark hotkey chip only on the keyboard token inside the action strip
  - keep all new pills and artifact rows on preset tokens with no extra accent fills
- Interactions:
  - clicking the left list icon restores the hidden inbox rail
  - `Cc` / `Bcc` expansion still happens through the add popovers, but the closed state now previews suggested recipients inline
  - the reply body seeds a fuller outbound response for the approval thread and scales editor height from content length
- Responsive behavior:
  - preserve the compact two-column desktop structure while making the compose surface visibly denser

## Visual evidence
- Before (previous full state): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-comment-pass-after-full.png`
- Before (previous compose state): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-comment-pass-after-compose.png`
- After (full page): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-refine-after-full.png`
- After (collapsed inbox rail with list-icon restore): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-refine-after-collapsed.png`
- After (top action strip focus): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-refine-top-focus.png`
- After (compose focus): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-refine-compose-focus.png`

## Visual delta summary
- The restore affordance is now the left-most list icon in the action strip, which makes the hidden inbox rail feel like a proper toggle instead of a secondary text CTA.
- The action controls now read as two tighter segmented strips, closer to the compact hotkey reference and less like a row of unrelated buttons.
- `Cc` and `Bcc` no longer occupy large empty boxes; they stay collapsed into short preview rows with suggested recipients until the picker is opened.
- The seeded reply is now a fuller email-style response for the approval thread, and the editor height grows with the content instead of staying fixed.
- Suggested insertions now contain only concrete outbound artifacts: PDF, spreadsheet, image/chart, and Salesforce tracking link. The old generic `Insert suggested draft` card is gone.

## Status
- Latest completed pass: **Inbox comment pass: compact action strip, centered thread meta, chat history, collapsed compose metadata, quick-task tray**.
- Verification is green:
  - `pnpm build`
  - `pnpm test`
- No open functional blocker.

## Latest visual requirements
- Layout:
  - remove the extra `Working mail` subtitle from the inbox rail header
  - keep thread actions in one compact strip instead of a labeled secondary panel
  - center `People on thread` between sender identity and received time
  - replace the `Thread messages` heading block with a `View older messages` nudge and chat-bubble rows
  - keep only the `To` contact card in the reply header, move subject into a single editable row, and split `Cc` / `Bcc` evenly below it
  - keep suggested insertions inside the compose surface, below the prefilled reply body
  - expand quick-task cards into a compact routing tray with search + icon/value controls instead of the old horizontal action buttons
- Spacing:
  - keep the new top action bar tight and scan-first, closer to the dark hotkey-strip reference the user shared
  - give the sender/meta row a balanced three-part alignment so the avatar group sits visually centered
  - keep the compose surface dense but not stacked with redundant helper copy
- Typography:
  - preserve the preset’s monospaced micro-labels
  - remove explanatory filler copy where the structure already communicates intent
- Color:
  - stay on preset tokens only
  - use the inverted dark chip only for the hotkey token inside the action strip
- Interactions:
  - subject input appears only while editing
  - `Cc` / `Bcc` search inputs only appear on click via the popovers
  - quick-task expansion now exposes default routing values that can be changed before adding the task
- Responsive behavior:
  - keep the right rail intact while making the compose and quick-task controls denser at desktop width

## Visual evidence
- Before (top/thread baseline): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-comment-pass-before.png`
- Before (compose baseline from prior pass): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-comment-pass-reply-after.png`
- After (top/thread): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-comment-pass-after.png`
- After (lower compose): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-comment-pass-after-compose.png`
- After (quick task expanded): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-comment-pass-after-quick-task.png`
- After (full page): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-thread-comment-pass-after-full.png`
- After DOM snapshot (compose + quick task in view): `.playwright-cli/page-2026-04-17T22-56-36-374Z.yml`

## Visual delta summary
- The inbox rail header is cleaner now: the redundant `Working mail` subtitle is gone, and the left list starts with just `Inbox`, the scope toggle, and search.
- The top-right thread actions now read like one compact hotkey/action strip instead of a loose stack with an `Actions` caption and helper line.
- The sender meta row now uses a centered middle column for `People on thread`, which makes the avatar cluster feel aligned instead of floating between sender and timestamp.
- The message history now reads like chat: leading avatar, square bubble surface, and a `View 1 older message` nudge replacing the old section title.
- The reply composer now matches the requested hierarchy: `To` contact card in the header only, subject as the top editable row, even `Cc`/`Bcc` cells below, and the recommended reply prefilled in the editor with suggested insertions moved inside the compose frame.
- The quick-task expansion now opens into a routing tray with assignee search, preset project/status/priority/due/label controls, and a single `Add task` commit action instead of the previous three-button add bar.

## Status
- Latest completed pass: **Inbox comment pass: unread/sent rail, top-bar actions, and inline reply recipients**.
- Verification is green:
  - `pnpm build`
  - `pnpm test`
- No open functional blocker.

## Latest visual requirements
- Layout:
  - remove the inbox chip strip and fold the list controls back into the left rail
  - keep the left rail to `Inbox`, search, and a visible `Unread` / `Sent` toggle
  - make left-rail collapse a true focus mode that gives the thread detail full width
  - move primary thread actions beside `Open Gmail` in the thread top bar
  - keep the right column shorter by removing the old `Actions` and `People` panels
- Spacing:
  - tighten the left rail so the list starts immediately below search
  - let the subject line span the full detail width by separating the action row from the title
  - keep the reply footer on a single line with `Send` aligned to the right
- Typography:
  - preserve the preset’s sharp, utilitarian hierarchy and monospaced micro-labels
  - keep button labels explicit (`Unread`, `Sent`, `Reply`, `Compose`) rather than icon-only toggles
- Color:
  - stay on preset tokens only (`b6rrgQgiNt`)
  - use blue only for active state/emphasis and keep attachments neutral except for SVG file marks
- Interactions:
  - restore a visible product-nav trigger beside the tabs when the main sidebar is collapsed
  - use left/right arrow key nudges to move thread-by-thread
  - make `Reply` and `Compose` first-class top-bar actions
  - remove `Ask chat`, `Copy draft`, `Mark reviewed` from the reply surface, and the connected-apps footer copy
  - move recipient, subject, Cc/Bcc search, avatar-group preview, and suggestion cards into the reply compose surface
  - use SVG file-type marks for attachments and suggestion cards instead of flat yellow fills
- Responsive behavior:
  - keep the left rail usable at desktop width and fully removable in focus mode
  - preserve the two-column detail + quick-task layout on desktop while letting the subject stay readable

## Visual evidence
- Inbox before (pre-comment pass): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-comment-pass-before.png`
- Inbox after (expanded rail): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-comment-pass-after.png`
- Inbox after (focus mode, rail collapsed): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-comment-pass-collapsed.png`
- Inbox after (product nav collapsed, trigger restored beside tabs): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-comment-pass-product-nav-after.png`
- Inbox after (reply surface with inline recipients + suggestion cards): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-comment-pass-reply-after.png`
- Inbox after (reply footer with single-line actions + send): `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/inbox-comment-pass-reply-send-after.png`
- Expanded after DOM snapshot: `.playwright-cli/page-2026-04-17T22-03-05-292Z.yml`
- Collapsed after DOM snapshot: `.playwright-cli/page-2026-04-17T22-03-21-671Z.yml`
- Meetings after, headerless shell: `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/meetings-headerless-after.png`
- Reference screenshots/video from user:
  - `/Users/shubhranshujha/Desktop/Screenshot 2026-04-18 at 2.04.50 AM.png`
  - `/Users/shubhranshujha/Desktop/Screenshot 2026-04-18 at 2.05.41 AM.png`
  - `/Users/shubhranshujha/Desktop/Screen Recording 2026-04-18 at 2.05.01 AM.mov`

## Visual delta summary
- The inbox chip strip is gone. The left rail now matches the requested `search + Unread/Sent toggle` model, and the list starts immediately below those controls.
- Focus mode is a real collapse now: the left rail disappears entirely, the detail column stretches full width, and the top action bar exposes a `Show inbox` restore control.
- When the product navigation is collapsed, the restore trigger now sits beside the tabs, so the off-canvas nav is still discoverable.
- The thread header is cleaner: sender identity moved into a people card below the subject, the right-most `People` panel was removed, and time is pushed to the card edge instead of sitting inline with noisy metadata.
- Thread actions now live beside `Open Gmail` with explicit `Reply` / `Compose` actions plus arrow-key nudges; `Ask chat` and the bulky old `Actions` panel are gone.
- The reply surface now contains subject + recipient controls, Cc/Bcc contact search, avatar-group recipient preview, compact suggestion rectangles, SVG file marks, and a one-line footer where `Send` sits on the same row as the attach actions.

## Status
- Latest completed pass: **Home document-style morning brief + shared task actions pass**.
- Verification is green:
  - `pnpm build`
  - `pnpm test`
- No open functional blocker.

## What changed
### Home document-style morning brief
- Reworked the expanded Home morning brief in `src/pages/Home.tsx` from a tabbed/carousel surface into one continuous operator document.
- The expanded brief now uses stacked sections instead of tab panels:
  - `Today’s operator summary`
  - `Pre-reads`
  - `Follow-ups`
  - `Linked tasks`
  - `Approvals`
- The section styling is deliberately more notion-like inside the preset:
  - paragraph-led summaries
  - quieter separators
  - compact smart-link rows
  - fewer nested card-within-card shells
- The brief stays on white preset surfaces with blue only as the accent/focus color; the earlier blue glass direction is still retired.

### Shared task actions
- Extracted shared task view-model helpers into `src/lib/task-helpers.ts`.
- Extracted shared task controls into `src/components/task-controls.tsx`.
- `src/pages/Tasks.tsx` now uses the shared task controls instead of keeping a second local copy of the same menus/buttons.
- Shared task controls now cover:
  - `TaskIconButton`
  - `TaskPriorityMenu`
  - `CompactTaskActions`
  - shared owner / priority / status labels

### Home task preview expansion
- Rebuilt the lower Home `Task list` card so rows expand inline with `Collapsible` instead of only acting as jump links.
- Expanded rows now expose the same action family already used on `/tasks`:
  - set priority
  - add to project
  - assign
  - schedule
- Expanded rows also show:
  - task description
  - compact activity/status metadata
  - high-signal linked context
  - `Open in Tasks` for the full route
- Collapsed rows remain compact/scan-first so the Home card still behaves like a brief, not a second full task manager.

### Smart-link/logo treatment
- Added richer Home smart-link treatment using the existing SVGL marks already in the repo:
  - Gmail
  - Slack
  - Google Calendar
  - Drive
  - Salesforce
- Unsupported/neutral context still falls back to preset text chips.

### Tasks list refinement
- Reworked the `/tasks` list surface in `src/pages/Tasks.tsx` to read much closer to the shared shadcn task-table reference:
  - proper compact table layout instead of the previous grouped stacked list
  - explicit filter row with `Filter tasks`, `Status`, and `Priority`
  - tighter `Task / Title / Status / Priority` columns
  - cleaner action chrome on the right edge
- Removed a number of preset-breaking overrides from the task surface:
  - dropped extra `rounded-none` overrides on shadcn buttons, inputs, menus, and popovers where the preset already defines shape
  - replaced ad-hoc raw color usage with repo tokens like `support`, `secondary`, `primary`, and `destructive`
  - switched the detail `Set priority` affordance back onto a real shadcn `Button`
- Fixed the detail-route regression introduced during the table refactor:
  - restored task-status mapping for the `StatusBadge`
  - kept `/tasks?task=<id>` working while the top-level views remain only `List` and `Kanban`
- Tightened list interaction behavior:
  - added explicit accessible labels for status/priority filter triggers
  - fixed the header checkbox so it toggles all visible rows instead of only checking forward

### Compact Home + task preview
- Removed the entire widget row from `src/pages/Home.tsx`.
- Replaced the lower Home area with a two-column split:
  - compact `Usage intelligence` card on the left
  - compact linear `Task list` preview on the right
- The new Home usage surface keeps the existing Ubik/business language, but uses denser Claude-style composition:
  - four primary compact stats
  - two smaller secondary stats
  - a tighter intensity grid and shorter supporting copy
- The new Home task preview is intentionally scan-first:
  - `Today` and `No deadline` groups only
  - compact checkbox/title/meta rows
  - click-through into `/tasks?task=...`
  - one clear `Open tasks` CTA

### Tasks route simplification
- Simplified `src/pages/Tasks.tsx` so the only explicit top-level tabs are:
  - `List`
  - `Kanban`
- Removed the `Gantt` UI and the old visible `Detail` tab.
- Deep-linked task detail is still supported through `?task=<id>`, but it now behaves as a focused state instead of a user-facing mode.
- `?view=gantt` now gracefully falls back to `List`.

### Kanban cleanup
- Reworked the board into four operational columns instead of six priority buckets:
  - `Today`
  - `Scheduled`
  - `No deadline`
  - `Done`
- The board cards are tighter and less bulky:
  - reduced card padding
  - subtler metadata treatment
  - priority stays inside cards instead of defining the whole board structure

### Test / verification refresh
- Updated the Home tests to assert the compact usage card and task preview instead of the removed widgets.
- Updated the Tasks tests to assert `List` + `Kanban`, deep-link detail compatibility, and the `gantt -> list` fallback behavior.

### Sidebar correction
- Replaced the incorrect grouped mega-sections (`Workspace / Execution / Automation`) with the real master-route list under one `Platform` section:
  - Home
  - Know Anything
  - Inbox
  - Meetings
  - Tasks
  - Projects
  - Intelligence
  - Approvals
  - Playbooks
- `Home`, `Know Anything`, and `Playbooks` are now flat master items with no nested children.
- Only `Inbox`, `Meetings`, `Tasks`, `Projects`, `Intelligence`, and `Approvals` are collapsible.
- Nested rows now use the native shadcn submenu rail and submenu buttons instead of the previous custom nested stack.
- `Projects` now lives with the rest of the master routes instead of in a separate lower section.
- Contextual child rows now sit under the active master item and read as pinned/currently relevant context rather than history or a second top-level nav.
- The nested alignment bug on `/tasks` is fixed: child rows line up correctly under the parent item and no longer inherit the broken Home-style subnest.
- The sidebar styling stays inside the preset language:
  - `bg-sidebar`
  - `text-sidebar-foreground`
  - `border-sidebar-border`
  - sharp corners and existing density scale

### Footer / account menu
- Removed the old archive/settings/help footer stack.
- Footer utility rows now carry:
  - `Support`
  - `Report Bug`
  - `History`
  - the account card trigger
- Clicking the account card now opens a more screenshot-aligned menu with:
  - `Settings`
  - `Billing`
  - `Punk Notes`
  - `Log out`
- `History` now routes to `/archive` instead of being duplicated as a nested platform child.
- The dropdown now includes an avatar/name/email-style header and opens upward on desktop so it no longer clips against the bottom edge.

### Chat sidebar / global search
- Removed the top-header global search field from `TopBar.tsx`.
- Rebuilt `AppSidebar.tsx` closer to the `shadcn add sidebar-08` information architecture:
  - brand row in the header
  - nav search field directly under the brand row
  - master-route list under `Platform`
  - contextual nested children under each master route
  - simplified footer account block
- The old large blue `Create` rail treatment was removed so the left nav reads more like a nested shadcn sidebar instead of the prior custom launcher.

### Know Anything comments
- Composer control row updates in `src/pages/Index.tsx`:
  - `Attach file` now appears before `Add context`
  - `Company knowledge` can now be turned on/off via a real toggle instead of being force-pinned on
- `org_knowledge` is no longer silently re-added in an effect.
- Runtime context assembly now respects the actual enabled sources rather than always injecting company knowledge.
- Suggested-ask categories are now a single horizontal icon rail with no bordered pills and no second-row spillover.
- Connector entries now use SVGL marks in the add-context surface:
  - Gmail
  - Slack
  - Google Drive
  - Salesforce
- Schedule popover now uses viewport-safe width/height plus internal scrolling so the calendar can be fully seen on the chat page without clipping off-screen.

### Morning brief / approvals surface
- The expanded morning-brief surfaces now use the preset card feel more directly:
  - `briefPanelClass` moved to `bg-card` + subtle card shadow
  - `briefInteractivePanelClass` also moved to `bg-card`
- This specifically fixes the approvals tab reading as tinted or washed instead of clean white preset cards.
- Latest hero polish pass tightened the collapsed top section further:
  - reduced hero top/bottom padding
  - reduced the vertical gap between hero rows
  - reduced headline size and tightened line-height
  - reduced action button height and chip-strip density
  - moved the tabbed brief surface slightly closer to the hero

### Top widgets
- The top row remains structurally the same, but the data visuals are more chart-backed and Tailwind v4-safe:
  - `Revenue Pulse` now uses the chart-backed sparkline instead of the old decorative mini bars.
  - `Pricing Ticker` now uses a real chart block (`Pricing pressure`) rather than a static segmented strip.
  - `Fleet Continuity` now includes a chart-backed seven-day lane rhythm panel.
- This keeps the widget cards in the preset shell while ensuring the Recharts / shadcn chart layer is actually in use under Tailwind v4.
- Latest polish pass tightened the fold:
  - reduced widget card height
  - reduced chart heights and internal padding
  - removed the lowest-value third pricing ticker row
  - reduced usage-stat card height slightly so the intensity section surfaces sooner in the first viewport

### Usage intelligence
- Removed the `Models` tab entirely.
- Removed the model-brand/favorite-model presentation and the related model-tab rendering from `Home.tsx`.
- Replaced the stat row with business-outcome metrics:
  - Revenue influenced
  - Working capital protected
  - Operating margin defended
  - Morning brief hit rate
  - Decisions shipped
  - Hours returned
- Removed the lower three-card highlight row under the intensity grid.
- Kept the intensity grid, but simplified it into a cleaner four-row matrix with a single consulting-style quip below it.
- The section now reads as org-benefit intelligence rather than model-usage telemetry.

### Data / test cleanup
- `homeUsageOverview` in `src/lib/ubik-data.ts` now matches the new usage-intelligence story.
- Removed now-unused usage-model types/data from `src/lib/ubik-types.ts` and `src/lib/ubik-data.ts`.
- Updated the Home route test so it asserts against the new business metrics instead of the removed `Workflow actions` / `Favorite model` labels.
- Updated the passive-widget test again during the polish pass because the `Monitor` row was intentionally removed from the compressed pricing widget.
- Updated the Home test coverage again so it now asserts:
  - expanded brief renders a document-style section (`Today’s operator summary`)
  - no tablist remains in the expanded brief
  - inline Home task expansion exposes the shared task action buttons

## Visual requirements captured from this pass
- Layout:
  - Expanded Home morning brief should read as one continuous operator document, not tabs or a carousel rail.
  - Lower Home task rows should remain compact by default and expand inline for richer detail.
- Spacing:
  - Avoid panel-within-panel stacking where separators/document blocks are enough.
  - Keep smart links compact and capped to high-signal references.
- Typography:
  - Keep the brief paragraph-led and operator-facing rather than dashboard-widget driven.
- Color:
  - Stay on preset white surfaces with blue accents only for active/action states.
  - Use branded app marks where they improve scanability, but do not reintroduce tinted glass backgrounds.
- Interactions:
  - Morning brief expand/collapse still anchors the surface.
  - Home task rows expand inline and surface the same action semantics as `/tasks`.
  - `Open in Tasks` stays available from the expanded Home row.
- Responsive behavior:
  - Expanded document sections must stack cleanly on narrow widths.
  - Expanded task rows must keep actions/context readable without horizontal overflow.

- Layout:
  - `/tasks` list should feel like a compact shadcn table, not a stacked task feed.
  - Keep `List` and `Kanban` only; detail remains a focused state via `?task=`.
- Spacing:
  - Reduce bulky control chrome and let the table carry the structure.
  - Keep the toolbar tight and the rows compact.
- Typography:
  - Use quieter table typography and lighter metadata treatment.
  - Preserve the preset feel instead of custom dashboard styling.
- Color:
  - Stay inside preset tokens; avoid custom radius/color overrides on the list controls.
  - Keep priority/status emphasis subtle and token-driven.
- Interactions:
  - Status and priority filters should be explicit top-row controls.
  - Deep-linked task detail must stay intact after the list refactor.
- Responsive behavior:
  - The list surface should still collapse cleanly without depending on the old grouped sections.

- Layout:
  - Remove the Home monitoring-widget row entirely for now.
  - Put compact usage intelligence on the left and a compact task preview on the right below Morning Brief.
  - Keep Morning Brief structurally unchanged.
  - On `/tasks`, only expose `List` and `Kanban` as first-class views.
- Spacing:
  - Tighten the usage block so it reads as a compact intelligence module instead of a second dashboard.
  - Keep the Home task preview capped and scan-friendly.
  - Make Kanban cards less bulky and reduce excess empty chrome.
- Typography:
  - Keep the Ubik business language; do not switch to model/session telemetry wording.
  - Preserve the preset’s compact, quiet tone rather than introducing louder dashboard styling.
- Color:
  - Stay inside the preset white-card + blue-accent system.
  - Do not reintroduce decorative widget colors/strips after removing the widget row.
- Interactions:
  - Home task preview rows should route into `/tasks` detail rather than exposing inline editing controls.
  - Deep-linked `/tasks?task=` must keep working even though `Detail` is no longer a tab.
- Responsive behavior:
  - Keep the new Home lower section usable as a two-column desktop split and natural single-column stack on smaller widths.
  - Keep the simplified Kanban readable without reverting to the previous six-column density.

- Layout:
  - Move search from the top app header into the sidebar header.
  - Do not invent mega-section wrappers above the actual product routes.
  - `Projects` belongs with the rest of the master tabs under `Platform`.
  - Contextual children should sit below each master route item instead of replacing the master route structure.
  - Keep the Know Anything composer and suggestion list intact structurally while tightening the control bar.
- Spacing:
  - Suggested-ask categories must stay in one horizontal row with scroll instead of wrapping.
  - Schedule content must fit inside the viewport and scroll internally if needed.
  - Keep the preset sidebar density and border rhythm; avoid oversized launcher-style rows.
- Typography:
  - Preserve the preset’s quiet nav/search typography rather than the older oversized launcher feel.
  - Contextual child rows can use a smaller two-line treatment.
- Color:
  - Keep the white preset surfaces and blue active state.
  - Connector logos should use their SVGL brand marks instead of generic monochrome icons.
  - Stay inside preset sidebar colors, borders, and sizing tokens.
- Interactions:
  - Company knowledge must be a real on/off control.
  - Add-context and schedule overlays must remain usable without clipping.
  - Footer account card should open a real options menu.
  - The bottom utility area should be `Support`, `Report Bug`, and `History`.
- Responsive behavior:
  - Sidebar search should remain in the nav, not return to the top bar.
  - The active master item should expand its contextual children while keeping the overall nav scan-friendly.
  - `Home` should remain flat and never render a subnest.

### Previous home pass
- Layout:
  - Keep the morning brief structure and top widget grid intact.
  - Keep Usage Intelligence as a compact summary block, not a second dashboard.
- Spacing:
  - White card shells should stay sharp and quiet; no glass layers or tinted slabs.
  - The intensity section should end with one quip, not an additional card row.
- Typography:
  - Usage Intelligence copy should feel more consulting-grade and business-oriented.
  - Remove model-centric labels in favor of operating outcome language.
- Color:
  - Preserve the white preset surfaces with blue as the action/accent color.
  - Keep chart accents blue/yellow without reverting to decorative gradients.
- Interactions:
  - Morning brief tabs remain interactive.
  - Top widget charts now use the chart runtime instead of only static strips.
- Responsive behavior:
  - No route or IA changes were made; the update stayed within existing grid/card layout behavior.

## Current blockers
- No functional blocker is open.

## Latest visual evidence
- Before:
  - `output/playwright/home-document-brief-before.png`
- After:
  - `output/playwright/home-document-brief-after-collapsed.png`
  - `output/playwright/home-document-brief-section-after.png`
  - `output/playwright/home-document-task-card-expanded-waited-after.png`
  - `output/playwright/home-document-brief-after-mobile.png`
- Visual delta:
  - Home now reads as a single operator document instead of a tabbed morning-brief surface.
  - The lower task card is now action-capable without becoming a second full `/tasks` clone.
  - Smart links scan faster because surfaced app references now use branded marks instead of generic pills alone.
- Non-blocking notes:
  - `pnpm build` still reports the existing large-chunk warning during production build.
  - React Router still logs the existing future-flag warnings during tests.
  - The worktree is dirty with unrelated ongoing repo changes; do not reset broadly when resuming.

## Evidence

### Before
- `/tasks` before the shadcn-aligned task-list refinement:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-compact-plan-after.png`
- `/home` before the compact-home pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-compact-plan-before.png`
- `/tasks` before the simplified-task pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-compact-plan-before.png`
- `/tasks` sidebar before the master-tab correction:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-sidebar-master-tabs-before.png`
- `/tasks` sidebar before the nested alignment cleanup:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-sidebar-nested-before.png`
- Previous `/home` state before this diff-comment pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-tailwind-v4-after-expanded.png`

### After
- `/tasks` list after the shadcn-aligned task-list refinement:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-shadcn-table-after.png`
- `/tasks` kanban after the refinement pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-shadcn-kanban-after.png`
- `/home` after the compact-home pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-compact-plan-after.png`
- `/tasks` list after the simplified-task pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-compact-plan-after.png`
- `/tasks` kanban after the board cleanup:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-kanban-compact-plan-after.png`
- `/tasks` sidebar after the master-tab correction:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-sidebar-master-tabs-after.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-sidebar-account-menu-after.png`
- `/tasks` sidebar after the nested alignment cleanup:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-sidebar-nested-after.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-sidebar-account-menu-refined.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-sidebar-collapsed-after.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/tasks-sidebar-mobile-after.png`
- `/` Know Anything before this pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/chat-sidebar-redo-before-viewport.png`
- `/` Know Anything after this pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/chat-sidebar-redo-after-viewport.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/chat-sidebar-redo-after-full.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/chat-sidebar-redo-connectors-popover.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/chat-sidebar-redo-schedule-popover-clean.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/chat-sidebar-redo-schedule-popover-detail.png`
- `/home` widgets + usage block after this pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-usage-intelligence-after-full.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-usage-intelligence-after-viewport.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-usage-intensity-after-viewport.png`
- `/home` fold after the density polish pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-polish-pass-after-full.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-polish-pass-after-viewport.png`
- `/home` fold after the hero polish pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-hero-polish-before-viewport.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-hero-polish-after-viewport.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-hero-polish-after-full.png`
- `/home` approvals tab after this pass:
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-approvals-after-full.png`
  - `/Users/shubhranshujha/Codex/simplify-visualize-act/output/playwright/home-approvals-after-viewport.png`

## Visual delta summary
- Home no longer has the top widget strip; the lower section is now a simple two-column split with compact usage intelligence and a compact execution queue.
- Usage Intelligence is denser and calmer now: four primary outcome stats, two smaller secondary stats, and a tighter heatmap block instead of a broad metric grid.
- The empty right-side whitespace on Home is now doing real work via the new linear task preview.
- `/tasks` now reads as a simpler product surface: `List` and `Kanban` only, with deep-linked detail preserved behind `?task=`.
- The board no longer groups by six priority buckets; it now tracks actual operating buckets (`Today`, `Scheduled`, `No deadline`, `Done`) and reads much cleaner.
- The sidebar now uses one real master-route list under `Platform` instead of synthetic mega-section buckets.
- `Meetings` is now a first-class master item in the platform list.
- `Projects` now sits with the rest of the master routes instead of being split into its own lower section.
- `Home`, `Know Anything`, and `Playbooks` are flat rows; only the operations-heavy routes expand.
- The active master route expands into contextual child rows beneath it using the native shadcn submenu rail, which reads much closer to the intended nested menu pattern.
- The footer utility area is now `Support`, `Report Bug`, and `History`, and the account card opens a proper settings/billing/changelog-style menu.
- The app-level search has moved out of the top bar and into the sidebar header.
- The sidebar now reads much closer to a `sidebar-08` composition: quieter header, nested contextual children, and a footer account menu with a clearer journey.
- The `/tasks` nested rows are visibly cleaner: no fake Home subnest, no history rows mixed into platform context, and no broken child indentation.
- The Know Anything composer row now has the requested control order and a real company-knowledge toggle.
- Suggested asks now stay in a single icon-led rail instead of wrapping into a second bordered row.
- The add-context surface now shows SVGL connector marks, and the schedule popover fits within the viewport with its calendar fully visible.
- The approvals tab now reads as a white preset card surface instead of a bluish slab.
- The top widgets use chart-backed visuals in the cards that were previously relying on decorative strips.
- Usage Intelligence is materially cleaner: no Models tab, no Favorite model / Live threads-style telemetry, no extra lower card row, and the section language is now explicitly tied to revenue, working capital, margin, and operator capacity.
- The latest polish pass pulls more of the usage block into the first screen by shortening the widget row and trimming low-value widget copy.
- The latest hero pass makes the first screen feel less top-heavy by compressing the greeting block and chip row; the widget row now starts earlier without removing core brief information.

## Files changed in the latest pass
- `/Users/shubhranshujha/Codex/simplify-visualize-act/src/components/AppSidebar.tsx`
- `/Users/shubhranshujha/Codex/simplify-visualize-act/handoff.md`

## Next recommended move
1. If the user wants another Home pass, tighten the vertical proportion between the new usage card and the task preview so the split feels even more intentional at large desktop widths.
2. If the user wants another Tasks pass, add a lightweight “return to list/board” affordance inside deep-linked detail so the focused state feels more explicit.
3. If the user wants the new Kanban pushed further, the next step is drag/reorder behavior or inline quick actions, not more view modes.
