import { Bell, Plus, Search, X } from "lucide-react";
import { useState } from "react";

import { ThemeToggle } from "@/components/ThemeToggle";
import { useShellState } from "@/hooks/use-shell-state";
import { inboxThreads, recentItems, workbenchLauncherRoutes } from "@/lib/ubik-data";
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
  const [globalWorkbenchSearch, setGlobalWorkbenchSearch] = useState("");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchSuggestionsOpen, setGlobalSearchSuggestionsOpen] = useState(false);
  const tabsAtLimit = tabs.length >= 8;
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const chatHistory = recentItems.filter((item) => item.type === "chat").slice(0, 6);
  const meetingHistory = recentItems.filter((item) => item.type === "meeting").slice(0, 6);
  const projectHistory = recentItems.filter((item) => item.type === "project").slice(0, 6);
  const inboxHistory = inboxThreads.slice(0, 6).map((thread) => ({
    id: thread.id,
    title: `${thread.subject} · ${thread.sender}`,
  }));
  const genericHistory = recentItems.slice(0, 6).map((item) => ({ id: item.id, title: item.title }));

  const getSuggestionsForPath = (path?: string) => {
    if (!path) return genericHistory;
    if (path === "/chat") return chatHistory.map((item) => ({ id: item.id, title: item.title }));
    if (path.startsWith("/meetings")) return meetingHistory.map((item) => ({ id: item.id, title: item.title }));
    if (path === "/projects") return projectHistory.map((item) => ({ id: item.id, title: item.title }));
    if (path.startsWith("/inbox")) return inboxHistory;
    return genericHistory;
  };

  const getSuggestionsLabel = (path?: string) => {
    if (!path) return "Recent items";
    if (path === "/chat") return "Recent chat history";
    if (path.startsWith("/meetings")) return "Recent meetings";
    if (path === "/projects") return "Project history";
    if (path.startsWith("/inbox")) return "Recent inbox threads";
    return "Recent items";
  };

  const contextualPlaceholder = (path?: string) => {
    if (!path) return "Search this section";
    if (path === "/chat") return "Search chats and past conversations";
    if (path.startsWith("/inbox")) return "Search threads, senders, companies";
    if (path.startsWith("/meetings")) return "Search meetings, prep, and notes";
    if (path === "/projects") return "Search project tasks and milestones";
    if (path === "/home") return "Search workstream widgets and updates";
    return "Search this section";
  };

  const activeSuggestions = getSuggestionsForPath(activeTab?.path);
  const showSuggestions = globalSearchSuggestionsOpen && !globalWorkbenchSearch.trim();

  return (
    <div className="border-b border-border bg-[#f6f3ed]">
      <div className="flex items-center justify-between gap-2 px-3 py-1.5">
        <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
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
                  className={`relative flex h-9 items-stretch overflow-hidden rounded-sm border transition-colors ${
                    temporary
                      ? active
                        ? "border-[#b4372f] bg-[#b4372f] text-[#fbf6f1]"
                        : "border-[#e5b2aa] bg-[#fbf2f0] text-[#8d362d] hover:border-[#cc8479] hover:bg-[#fff6f4]"
                      : active
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
              <button
                className={`ml-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition-colors ${
                  tabsAtLimit
                    ? "cursor-not-allowed border-[#e7e1d8] bg-[#f7f4ef] text-[#c0b8ad]"
                    : "border-[#ddd7cf] bg-[#fbfaf7] text-primary hover:border-[#c9c1b6] hover:bg-white"
                }`}
                disabled={tabsAtLimit}
                aria-label="Open new tab menu"
              >
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

        <div className="relative flex shrink-0 items-center gap-1.5">
          <div className="relative">
            <div
              className={`relative flex h-9 items-center overflow-hidden rounded-sm border border-[#ddd7cf] bg-[#fbfaf7] transition-all duration-200 ease-out ${
                globalSearchOpen ? "w-[320px] opacity-100" : "w-9 opacity-95"
              }`}
            >
              <button
                aria-label={globalSearchOpen ? "Close global search" : "Open global search"}
                className="flex h-9 w-9 items-center justify-center text-[#494741] transition-colors hover:bg-white"
                onClick={() => {
                  const nextOpen = !globalSearchOpen;
                  setGlobalSearchOpen(nextOpen);
                  if (!nextOpen) setGlobalSearchSuggestionsOpen(false);
                  if (nextOpen && !globalWorkbenchSearch.trim()) setGlobalSearchSuggestionsOpen(true);
                }}
                type="button"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
              <input
                className={`h-8 bg-transparent pr-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[#494741] outline-none placeholder:text-[#7d766e] transition-opacity ${
                  globalSearchOpen ? "w-[280px] opacity-100" : "w-0 opacity-0"
                }`}
                onBlur={() => setGlobalSearchSuggestionsOpen(false)}
                onChange={(event) => setGlobalWorkbenchSearch(event.target.value)}
                onFocus={() => {
                  if (!globalWorkbenchSearch.trim()) setGlobalSearchSuggestionsOpen(true);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setGlobalSearchSuggestionsOpen(false);
                    if (!globalWorkbenchSearch.trim()) setGlobalSearchOpen(false);
                  }
                }}
                placeholder={contextualPlaceholder(activeTab?.path)}
                value={globalWorkbenchSearch}
              />
            </div>
            {showSuggestions ? (
              <div className="absolute left-0 top-[calc(100%+0.35rem)] z-20 w-[320px] border border-[#d7d1c9] bg-[#fbfaf7] p-2 shadow-sm">
                <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#6b655d]">{getSuggestionsLabel(activeTab?.path)}</p>
                <div className="space-y-1">
                  {activeSuggestions.map((item) => (
                    <button
                      key={item.id}
                      className="w-full border border-transparent px-2 py-1.5 text-left text-[11px] text-[#3f3a34] hover:border-[#d7d1c9] hover:bg-white"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setGlobalWorkbenchSearch(item.title);
                        setGlobalSearchSuggestionsOpen(false);
                      }}
                      type="button"
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <button
            className="relative flex h-9 w-9 items-center justify-center border border-[#ddd7cf] bg-[#fbfaf7] text-[#b4372f] transition-colors hover:border-[#c9c1b6] hover:bg-white"
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
            <span className="absolute right-1 top-1 h-2 w-2 bg-primary" />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
