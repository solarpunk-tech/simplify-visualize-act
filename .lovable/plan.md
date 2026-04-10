

## UBIK Enterprise Sidebar — Full Rebuild

Complete rewrite of `AppSidebar.tsx` to match the executive command center specification. Also update `TopBar.tsx` route labels and `App.tsx` routes to align with the new navigation structure.

### What Changes

**1. `src/components/AppSidebar.tsx`** — Full rewrite

The sidebar becomes a structured, sectioned executive navigation with:

- **Header**: UBIK wordmark + collapse/expand toggle button (right-aligned)
- **Search bar**: "Search anything" input with `⌘K` hint badge, clicking opens CommandPalette
- **+ Create button**: Uses shadcn DropdownMenu with options: Ask Ubik, Start Research, New Project, New Workflow, Schedule Monitor, Add Note
- **Notifications bell icon**: Subtle, next to search area

**Section 1 — NAVIGATE** (collapsible):
- Briefing (`/`, icon: LayoutDashboard)
- Inbox (`/inbox`, icon: Inbox) — red unread badge "3"
- Meetings (`/meetings`, icon: Calendar)
- Projects (`/projects`, icon: FolderKanban)
- Intelligence (`/intelligence`, icon: Radar) — small active dot
- Approvals (`/approvals`, icon: ShieldCheck) — red pending badge "2"

**Section 2 — EXECUTION** (collapsible):
- Workflows (`/workflows`, icon: Workflow) — running status dot
- Agents (`/agents`, icon: Bot) — health status dot

**Section 3 — PINNED** (collapsible):
- 5 static mock items with type icons (chat, research, project, workflow, meeting)
- "View all" link

**Section 4 — RECENTS** (collapsible):
- 6 static mock items with type icons
- "View all" link

**Bottom utility**:
- Archive, Settings, Help as nav links
- Profile row: avatar initial circle + "Arjun M." + chevron
- Metadata line: `Business • Prod • v1.0.4` in small muted text

**Collapse behavior**:
- Full sidebar collapse to icon-only rail using shadcn `collapsible="icon"`
- In collapsed state: search becomes search icon, +Create becomes + icon, section labels hide, pinned/recents hide, badges stay as small dots on icons, tooltips on hover
- Each section (Navigate, Execution, Pinned, Recents) independently collapsible via chevron toggle
- Active item: red left border + red text/icon

**Styling**: 0px border-radius, 1px borders, JetBrains Mono for all labels, no greys (use opacity on black/white), red accent `#af2309` for active states and badges.

**2. `src/components/TopBar.tsx`** — Update route labels

Add new route labels:
- `/` → `UBIK_BRIEFING`
- `/intelligence` → `UBIK_INTELLIGENCE`
- `/approvals` → `UBIK_APPROVALS`
- `/workflows` → `UBIK_WORKFLOWS`

**3. `src/App.tsx`** — Add new routes

Add placeholder routes for `/intelligence`, `/approvals`, `/workflows`.

**4. `src/lib/mock-data.ts`** — Add pinned/recents data

Add `pinnedItems` and `recentItems` arrays with mixed object types (chat, research, project, workflow, meeting) and appropriate metadata.

### Implementation Order

1. Add mock data for pinned/recents
2. Rebuild AppSidebar with all sections, badges, collapse behavior, profile row
3. Update TopBar route labels
4. Add new routes in App.tsx

