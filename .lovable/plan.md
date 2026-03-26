

## UBIK — Phase 1 Build: Shell + Home + Agents (Nav-by-Nav)

Since nothing is built yet, this is a full foundation build. Per your request to go "nav by nav," this phase covers the **shell layout**, **Home feed**, and **Agents view** — the two most complex surfaces. Remaining nav items (Inbox, Projects, Meetings, Settings) will follow in subsequent phases.

### Design System

- **Palette**: `#000000` black, `#ffffff` white, `#af2309` red. No greys. Use `rgba(0,0,0,0.5)` for secondary text in light mode, `rgba(255,255,255,0.5)` in dark mode
- **Dark mode**: Pure black base, white text, same red accent. Borders `rgba(255,255,255,0.12)`
- **Typography**: JetBrains Mono (nav, labels, system text), Inter (body, descriptions)
- **Zero border-radius**, 1px borders, zero decorative shadows
- **CSS variables** updated in `index.css` for both modes

### Shell Layout (all pages)

- **Left sidebar** (~56px collapsed / ~200px expanded): `[UBIK]` wordmark, nav icons for Home, Inbox, Projects, Meetings, Agents, Settings. Active = red left border + red icon/text
- **Top bar** (48px): Breadcrumb left, contextual label showing active tab (e.g. `UBIK_HOME` / `UBIK_AGENTS`), dark/light toggle right
- **Floating chat bar** at bottom center of main content area — textarea with send button. Context chips show active tab highlighted (e.g. "HOME" chip is red when on home). Can be toggled to "all-purpose" mode by removing chip selection

### Home Page (`/`)

Three-column layout: Feed | Quick Actions | Context Intelligence

**Left column — Feed**
- "GOOD MORNING." heading with red period, date/time
- **Engagement feed**: Rotating visual cards (like MidJourney-style generated images based on user's industry — seafood shipments, ports, containers) with subtle animation. Behavioral hook to draw users in
- Recent conversation threads with timestamps

**Center column — Quick Actions + Task Tracker**
- "ASK ANYTHING." input (connects to floating chat bar)
- 4 quick action cards: Email Analysis, Budget Report, Research, Project Status
- **Inline task tracker**: Pre-filled intelligent tasks extracted from emails/meetings. Shows deduplication indicators ("3 duplicates merged"), tasks grouped by project. Status chips: TODO / IN_PROGRESS / DONE

**Right column — Context Intelligence Panel**
- Active workflows count + status (running/stopped)
- Pending approvals with urgency badges
- Calendar snapshot (next 3 meetings)
- Unread inbox count
- AI-surfaced insights ("3 rate confirmations pending > 48hrs")

**Project cards** at bottom of center column: 2-3 cards showing active projects (e.g. "Mumbai-Rotterdam Q2", "Supplier Compliance Audit") with progress indicators and last activity

### Agents Page (`/agents`)

Three sections in a flexible panel layout:

**1. My Agents — Workflow Configuration**
- List of agent workflows, each as an expandable card:
  - Agent name, description, ON/OFF toggle
  - **Workflow steps** shown as a pipeline: e.g. `Figma MCP → Browser Use → Computer Use → Notify`
  - Each step shows: tool icon, name, status (connected/disconnected), last run
  - "Add Step" button to extend pipeline
- Pre-built agent templates: "Email Triage Agent", "Rate Confirmation Agent", "Document Extractor", "Meeting Follow-up Agent"

**2. Approvals Queue**
- Cards showing pending agent actions needing human sign-off
- Each card: agent name, action summary, confidence score, context preview, APPROVE / REJECT / MODIFY buttons
- Red left border for urgent items
- Provenance block showing what context the agent used to reach its recommendation

**3. Preferences & App Connections**
- Connected apps list with status indicators: Gmail, Slack, WhatsApp, Figma, Calendar, Telegram
- Per-app permissions: read/write/execute toggles
- Agent behavior preferences: aggressiveness level (conservative/balanced/autonomous), notification preferences, auto-approve thresholds
- "Connected Tools" grid showing MCP integrations with connect/disconnect buttons

### Floating Chat Bar (global component)

- Fixed bottom-center, ~600px wide
- Textarea + attachment + send button
- **Context chips row** above input: HOME, INBOX, PROJECTS, MEETINGS, AGENTS — active tab chip highlighted in red. Clicking a chip scopes the chat context. Clicking active chip again removes scope (all-purpose mode)
- Model selector dropdown (subtle, right side)

### Routing

| Route | Page |
|-------|------|
| `/` | Home |
| `/inbox` | Placeholder |
| `/projects` | Placeholder |
| `/meetings` | Placeholder |
| `/agents` | Agents |
| `/settings` | Placeholder |

### Files to Create/Modify

1. `src/index.css` — Design system variables (red/black/white, dark mode)
2. `src/components/Shell.tsx` — Sidebar + topbar + floating chat bar wrapper
3. `src/components/Sidebar.tsx` — Navigation
4. `src/components/TopBar.tsx` — Breadcrumb + toggle
5. `src/components/FloatingChat.tsx` — Global chat input with context chips
6. `src/components/ThemeToggle.tsx` — Dark/light mode
7. `src/pages/Index.tsx` — Home feed (3-column)
8. `src/pages/Agents.tsx` — Agents view (workflows, approvals, preferences)
9. `src/pages/Placeholder.tsx` — Stub for unbuilt nav items
10. `src/App.tsx` — Routes + Shell wrapper
11. `src/lib/mock-data.ts` — All dummy data for home feed, agents, tasks, projects

### Implementation Order

1. Design system + Shell (sidebar, topbar, theme toggle)
2. Floating chat bar component
3. Home page — feed column, quick actions, context intelligence panel, project cards, task tracker
4. Agents page — workflows, approvals, preferences
5. Wire routing + placeholder pages

