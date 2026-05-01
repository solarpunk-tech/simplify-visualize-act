# Agents in this repo

shadcn/ui project. Preset: `b6rrgQgiNt`. Primitive base: **Radix** (26 `@radix-ui/react-*` deps in `package.json`).

## Adding a primitive

- Core (Radix style): `pnpm dlx shadcn@latest add <component>`
- From any shadcn-compatible registry (Animate UI, Boldkit, etc.): `pnpm dlx shadcn@latest add <registry-url>`
- Diff existing components vs. upstream: `pnpm dlx shadcn@latest diff`

Rules:
- Never hand-author a primitive when a registry has one. Compose from existing `src/components/ui/*` before installing new primitives.
- Never install Base UI (`@base-ui/react`) — this repo is Radix. If a doc says `base-nova` style, pull the Radix equivalent instead.
- Never `pnpm add -D shadcn` — the CLI is single-shot; use `pnpm dlx`.

## After install: preset-rollback pass

Before committing a freshly installed component, walk through and replace hardcoded values with preset tokens:

- Colors → `bg-background`, `bg-primary`, `bg-card`, `text-muted-foreground`, `text-foreground`, `border-border`, etc.
- Radius → inherits `--radius: 0rem` (sharp corners are intentional — do not add `rounded-*` overrides unless the user explicitly asks).
- **Keep motion timing/curves/springs from the source** — that's what you imported. Only swap the color/radius/spacing tokens.

## Tokens

- CSS vars live in `src/index.css` (`:root` and `.dark`).
- Blue primary `hsl(227 81% 56%)`, mapped via `--primary` / `--accent` / `--ring`.
- Support accent uses `--support` / `--support-foreground`.
- Fonts: Noto Sans Variable (sans), Montserrat Variable (heading), and JetBrains Mono (mono).
- Do not hardcode colors or radii. Use Tailwind classes that read from the vars (`bg-primary`, `border-border`).

## Re-applying the preset

If tokens drift or need to be reset:

```bash
pnpm dlx shadcn@latest apply b6rrgQgiNt
```

## components.json

Already configured for this stack (Tailwind v4, `cssVariables: true`, `@/` aliases, phosphor icons). Do not regenerate with `shadcn init` — it will overwrite the preset-applied CSS.

## Screenshots from the user

Markdown docs with install command + source are usually enough to install and integrate a component. Ask for a screenshot or GIF only when:
- The component is motion-centric (GIF > still image).
- The source hardcodes colors you need to roll back to preset tokens.
- A specific variant isn't in the docs' code block.
