import { Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShellState } from "@/hooks/use-shell-state";
import { getRouteMeta } from "@/lib/ubik-data";

export function TopBar() {
  const location = useLocation();
  const { openDrawer, setCommandPaletteOpen } = useShellState();
  const route = getRouteMeta(location.pathname);

  return (
    <header className="border-b border-border bg-background">
      <div className="flex flex-col gap-4 px-4 py-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <SidebarTrigger className="border border-border md:hidden" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Ubik Workspace</p>
            <h1 className="mt-2 font-mono text-[2.3rem] font-semibold tracking-tight leading-none">{route?.title ?? "Ubik"}</h1>
            <p className="mt-3 max-w-2xl text-base text-muted-foreground">{route?.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {route?.actions.map((action) => (
            <button
              key={action.label}
              className={`border px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] ${
                action.kind === "primary"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground"
              }`}
              onClick={() =>
                openDrawer({
                  title: action.label,
                  eyebrow: route.title,
                  description: `Action surface for ${action.label.toLowerCase()} on the ${route.title} page.`,
                  metadata: [
                    { label: "Page", value: route.title },
                    { label: "Mode", value: "Frontend seeded" },
                  ],
                })
              }
            >
              {action.label}
            </button>
          ))}

          <button
            className="border border-border bg-foreground px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-background"
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Open command palette"
          >
            <Sparkles className="mr-2 inline h-3.5 w-3.5" />
            Create
            <kbd className="ml-2 border border-current/25 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-background/80">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
