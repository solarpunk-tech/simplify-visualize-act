import { BellIcon, PlusIcon, XIcon } from "@phosphor-icons/react";
import { useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useShellState } from "@/hooks/use-shell-state";
import { workbenchLauncherRoutes } from "@/lib/ubik-data";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
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
  const tabsAtLimit = tabs.length >= 8;
  const { state } = useSidebar();

  return (
    <div className="border-b border-border/70 bg-background/95 px-3 py-2">
      <div className="flex items-center justify-between gap-3 rounded-none border border-border/70 bg-card/90 px-2 py-2 shadow-sm">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
          {state === "collapsed" ? (
            <SidebarTrigger
              className="mr-1 shrink-0 rounded-none border-border/70 bg-background hover:bg-secondary"
            />
          ) : null}
          {tabs.map((tab) => {
            const active = tab.id === activeTabId;
            const dragging = tab.id === draggingId;
            const temporary = tab.temporary === true;

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
                  className={`flex h-9 items-stretch overflow-hidden rounded-none border transition-colors ${
                    temporary
                      ? active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/25 bg-primary/5 text-primary hover:border-primary/45 hover:bg-primary/8"
                      : active
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/70 bg-background text-foreground/80 hover:border-foreground/15 hover:bg-secondary/70"
                  }`}
                >
                  <button
                    className="flex h-9 max-w-[156px] items-center truncate px-3.5 font-mono text-[10.5px] font-medium uppercase tracking-[0.16em]"
                    onClick={() => selectTab(tab.id)}
                    type="button"
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
                      type="button"
                    >
                      <XIcon className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon-lg"
                className={`ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-none border transition-colors ${
                  tabsAtLimit
                    ? "cursor-not-allowed border-border bg-muted text-muted-foreground"
                    : "border-border/70 bg-background text-foreground hover:bg-secondary"
                }`}
                disabled={tabsAtLimit}
                aria-label="Open new tab menu"
              >
                <PlusIcon className="h-3.5 w-3.5" />
              </Button>
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
          <Button
            variant="outline"
            size="icon-lg"
            className="relative rounded-none border-border/70 bg-background hover:bg-secondary"
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
            <BellIcon className="h-3.5 w-3.5" />
            <span className="absolute right-1 top-1 h-2 w-2 bg-primary" />
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
