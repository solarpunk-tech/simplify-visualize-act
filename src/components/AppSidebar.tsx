import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  Archive,
  Bot,
  Calendar,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Pin,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Stars,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { useLocation } from "react-router-dom";

import { NavLink } from "@/components/NavLink";
import { navigationItems, pinnedItems, recentItems } from "@/lib/ubik-data";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const iconMap: Record<string, LucideIcon> = {
  chat: LayoutDashboard,
  inbox: Inbox,
  meetings: Calendar,
  projects: FolderKanban,
  intelligence: Radar,
  approvals: ShieldCheck,
  workflows: Workflow,
  agents: Bot,
  archive: Archive,
  settings: Settings,
  help: HelpCircle,
};

const sectionLabels = {
  navigate: "Navigate",
  playbooks: "Playbooks",
  support: "Workspace",
} as const;

const pinnedTypeIcon: Record<string, LucideIcon> = {
  chat: LayoutDashboard,
  project: FolderKanban,
  workflow: Workflow,
  approval: ShieldCheck,
  meeting: Calendar,
};

function SectionToggle({
  label,
  open,
  onClick,
  hidden,
  extra,
}: {
  label: string;
  open: boolean;
  onClick: () => void;
  hidden?: boolean;
  extra?: ReactNode;
}) {
  if (hidden) return null;

  return (
    <div className="flex min-h-[40px] items-center justify-between gap-4 px-4 pt-4">
      <button
        className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-sidebar-foreground/55"
        onClick={onClick}
      >
        <span>{label}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>
      {extra}
    </div>
  );
}

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { openDrawer, navigateCurrentTab, setCommandPaletteOpen } = useShellState();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const [recentSearch, setRecentSearch] = useWorkbenchState("recent-search", "");
  const [sectionState, setSectionState] = useState({
    navigate: true,
    playbooks: true,
    pinned: true,
    recents: true,
  });

  const groupedNav = useMemo(
    () => ({
      navigate: navigationItems.filter((item) => item.section === "navigate"),
      playbooks: navigationItems.filter((item) => item.section === "playbooks"),
      support: navigationItems.filter((item) => item.section === "support"),
    }),
    [],
  );

  const toggleSection = (key: keyof typeof sectionState) => {
    setSectionState((current) => ({ ...current, [key]: !current[key] }));
  };

  const filteredRecents = recentItems.filter((item) =>
    item.title.toLowerCase().includes(recentSearch.toLowerCase()),
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="h-12 gap-0 border-b border-sidebar-border p-0">
        <div className={`${collapsed ? "px-4" : "px-6"} flex h-12 items-center`}>
          <div className={`flex w-full ${collapsed ? "items-center justify-center" : "items-center justify-between"} gap-4`}>
            <button
              className={collapsed ? "text-center" : "min-w-0 text-left"}
              onClick={collapsed ? () => toggleSidebar() : undefined}
              type="button"
            >
              {!collapsed ? (
                <h2 className="whitespace-nowrap leading-none font-mono text-[1.55rem] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground">
                  [ UBIK ]
                </h2>
              ) : (
                <span className="font-mono text-[1.1rem] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground">[U]</span>
              )}
            </button>
            {!collapsed ? (
              <SidebarTrigger className="h-10 w-10 border border-sidebar-border bg-transparent text-sidebar-foreground hover:bg-sidebar-accent md:inline-flex [&_svg]:h-4 [&_svg]:w-4" />
            ) : null}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-sidebar">
        {collapsed ? (
          <div className="flex justify-center px-4 py-4">
            <button className="flex h-8 w-8 items-center justify-center border border-sidebar-border bg-sidebar-primary text-sidebar-primary-foreground">
              <Stars className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="px-6 py-4">
            <button
              className="flex w-full items-center gap-2 border border-sidebar-border bg-sidebar-primary px-4 py-3 text-left font-mono text-[11px] uppercase tracking-[0.16em] text-sidebar-primary-foreground"
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Open command palette"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Create</span>
              <kbd className="ml-auto border border-sidebar-border px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-sidebar-primary-foreground/80">
                ⌘K
              </kbd>
            </button>
          </div>
        )}

        {(["navigate", "playbooks"] as const).map((sectionKey) => (
          <div key={sectionKey}>
            <SectionToggle
              label={sectionLabels[sectionKey]}
              open={sectionState[sectionKey]}
              onClick={() => toggleSection(sectionKey)}
              hidden={collapsed}
            />
            {(sectionState[sectionKey] || collapsed) && (
              <SidebarMenu className={collapsed ? "items-center px-0 py-3" : "px-3 py-3"}>
                {groupedNav[sectionKey].map((item) => {
                  const Icon = iconMap[item.key];
                  const active = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className={
                          collapsed
                            ? `mx-auto h-10 w-10 justify-center rounded-none px-0 ${
                                active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/80"
                              }`
                            : `h-12 rounded-none px-4 font-mono text-[11px] uppercase tracking-[0.16em] ${
                                active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80"
                              }`
                        }
                      >
                        <NavLink
                          to={item.path}
                          end={item.path === "/"}
                          onClick={(event) => {
                            event.preventDefault();
                            navigateCurrentTab(item.path);
                          }}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {!collapsed ? <span>{item.title}</span> : null}
                          {!collapsed && item.badge ? (
                            <span className="ml-auto border border-current/25 px-1.5 py-0.5 text-[10px]">{item.badge}</span>
                          ) : null}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </div>
        ))}

        <div className={collapsed ? "mx-auto w-10 border-t border-sidebar-border" : "mx-4 border-t border-sidebar-border"} />

        {!collapsed ? (
          <div>
            <SectionToggle label="Pinned" open={sectionState.pinned} onClick={() => toggleSection("pinned")} />
            {sectionState.pinned ? (
              <div className="space-y-1 px-4 pb-4 pt-3">
                {pinnedItems.slice(0, 5).map((item) => {
                  const Icon = pinnedTypeIcon[item.type];

                  return (
                    <button key={item.id} className="flex w-full items-start gap-2 border border-transparent px-2 py-2 text-left text-sidebar-foreground/78 hover:border-sidebar-border hover:bg-sidebar-accent">
                      <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <p className="truncate font-mono text-[10.5px] uppercase tracking-[0.16em]">{item.title}</p>
                        </div>
                        <p className="mt-1 text-xs text-sidebar-foreground/50">{item.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
                <button className="px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/50">More</button>
              </div>
            ) : null}
          </div>
        ) : null}

        {!collapsed ? <div className="mx-4 border-t border-sidebar-border" /> : null}

        {!collapsed ? (
          <div className="pb-4">
            <SectionToggle
              label="Recents"
              open={sectionState.recents}
              onClick={() => toggleSection("recents")}
              extra={
                <div className="relative shrink-0">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-foreground/45" />
                  <input
                    value={recentSearch}
                    onChange={(event) => setRecentSearch(event.target.value)}
                    placeholder="Search"
                    className="h-10 w-[148px] border border-sidebar-border bg-transparent pl-9 pr-3 font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground outline-none placeholder:text-sidebar-foreground/45 focus:border-sidebar-foreground/35"
                  />
                </div>
              }
            />
            {sectionState.recents ? (
              <div className="space-y-1 px-4 pt-2">
                {filteredRecents.slice(0, 6).map((item) => (
                  <button key={item.id} className="grid w-full grid-cols-[minmax(0,1fr)_82px] gap-3 border border-transparent px-2 py-2.5 text-left text-sidebar-foreground/75 hover:border-sidebar-border hover:bg-sidebar-accent">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] leading-7">{item.title}</span>
                    <span className="text-right text-[11px] text-sidebar-foreground/45">{item.time}</span>
                  </button>
                ))}
                {!filteredRecents.length ? (
                  <p className="px-2 py-2 text-sm text-sidebar-foreground/45">No matching chats.</p>
                ) : null}
                <button className="px-2 font-mono text-[10px] uppercase tracking-[0.16em] text-sidebar-foreground/50">More</button>
              </div>
            ) : null}
          </div>
        ) : null}
      </SidebarContent>

      <SidebarFooter className="gap-0 border-t border-sidebar-border bg-sidebar p-0">
        <SidebarMenu className={collapsed ? "items-center px-0 py-3" : "px-2 py-2"}>
          {groupedNav.support.map((item) => {
            const Icon = iconMap[item.key];
            const active = location.pathname.startsWith(item.path);

            return (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  className={
                    collapsed
                      ? `mx-auto h-10 w-10 justify-center rounded-none px-0 ${
                          active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/78"
                        }`
                      : "h-12 rounded-none px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-sidebar-foreground/78"
                  }
                >
                  <NavLink
                    to={item.path}
                    onClick={(event) => {
                      event.preventDefault();
                      navigateCurrentTab(item.path);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    {!collapsed ? <span>{item.title}</span> : null}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`flex items-center gap-3 border-t border-sidebar-border text-left text-sidebar-foreground hover:bg-sidebar-accent ${
              collapsed ? "justify-center px-0 py-6" : "px-4 py-4"
            }`}>
              <span className="flex h-10 w-10 items-center justify-center border border-sidebar-border font-mono text-[11px] uppercase tracking-[0.14em]">HR</span>
              {!collapsed ? (
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em]">Hemanth Rao</p>
                  <p className="mt-1 text-[11px] text-sidebar-foreground/45">Business · Prod · v1.0.4</p>
                </div>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-48 font-mono text-[11px] uppercase tracking-[0.14em]">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Environment</DropdownMenuItem>
            <DropdownMenuItem>Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
