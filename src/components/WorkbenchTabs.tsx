import { Bell, Plus, X } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useShellState } from "@/hooks/use-shell-state";
import { workbenchLauncherRoutes } from "@/lib/ubik-data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkbenchTabs() {
  const {
    activeTabId,
    tabs,
    selectTab,
    createTab,
    closeTab,
    reorderTab,
    openDrawer,
  } = useShellState();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div className="border-b border-border bg-[#f6f3ed]">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = tab.id === activeTabId;
            const dragging = tab.id === draggingId;

            return (
              <div
                key={tab.id}
                draggable
                onDragStart={(event) => {
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", tab.id);
                  setDraggingId(tab.id);
                }}
                onDragEnd={() => setDraggingId(null)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const sourceId = event.dataTransfer.getData("text/plain");
                  if (sourceId) reorderTab(sourceId, tab.id);
                  setDraggingId(null);
                }}
                className={`group flex shrink-0 items-center ${dragging ? "opacity-60" : ""}`}
              >
                <div
                  className={`flex h-9 items-stretch overflow-hidden rounded-sm border transition-colors ${
                    active
                      ? "border-[#1f1f1f] bg-[#1f1f1f] text-[#f7f5f0]"
                      : "border-[#ddd7cf] bg-[#fbfaf7] text-[#494741] hover:border-[#c9c1b6] hover:bg-white"
                  }`}
                >
                  <button
                    className="flex h-9 max-w-[156px] items-center truncate px-3.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em]"
                    onClick={() => selectTab(tab.id)}
                  >
                    {tab.title}
                  </button>
                  {tab.closable === false ? null : (
                    <button
                      className={`flex h-9 w-9 items-center justify-center border-l border-current/20 transition-opacity ${
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      }`}
                      onClick={() => closeTab(tab.id)}
                      aria-label={`Close ${tab.title}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground transition-colors hover:brightness-95">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52 font-mono text-[11px] uppercase tracking-[0.14em]">
              {workbenchLauncherRoutes.map((route) => (
                <DropdownMenuItem key={route.key} onClick={() => createTab(route.path)}>
                  {route.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            className="relative flex h-9 w-9 items-center justify-center border border-primary bg-primary text-primary-foreground transition-colors hover:brightness-95"
            onClick={() =>
              openDrawer({
                title: "Notifications",
                eyebrow: "Top Workbench",
                description: "Global notifications stay accessible beside the workbench controls.",
                timeline: [
                  "Thai Union exception waiting on review",
                  "Pricing monitor finished run 842",
                  "Supplier review meeting starts in 43 minutes",
                ],
              })
            }
            aria-label="Open notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute right-1 top-1 h-2.5 w-2.5 bg-primary" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
