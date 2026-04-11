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
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="border border-border md:hidden" />
          <p className="max-w-3xl text-sm text-muted-foreground lg:text-[15px]">{route?.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {route?.actions.map((action) => (
            <button
              key={action.label}
              className={`border px-3 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] ${
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
            className="flex items-center gap-2 border border-border bg-foreground px-4 py-2.5 text-left font-mono text-[10.5px] uppercase tracking-[0.14em] text-background"
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Open command palette"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Create</span>
            <kbd className="ml-auto border border-current/25 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-background/80">
              ⌘K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
}
