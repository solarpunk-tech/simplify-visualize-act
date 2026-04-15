import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  Archive,
  Bot,
  Calendar,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  HelpCircle,
  History,
  Home,
  Inbox,
  LayoutDashboard,
  Pin,
  Radar,
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
  home: Home,
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
        className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/75"
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
  const { navigateCurrentTab, setCommandPaletteOpen } = useShellState();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const [sectionState, setSectionState] = useState({
    navigate: true,
    playbooks: true,
    pinned: true,
    history: true,
    history_chat: true,
    history_meeting: true,
    history_project: true,
    history_workflow: true,
    history_file: true,
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

  const filteredGroupedNav = {
    navigate: groupedNav.navigate.filter((item) => item.key !== "chat"),
    playbooks: groupedNav.playbooks,
  };

  const filteredRecents = recentItems;
  const historyByType = {
    chat: filteredRecents.filter((item) => item.type === "chat"),
    meeting: filteredRecents.filter((item) => item.type === "meeting"),
    project: filteredRecents.filter((item) => item.type === "project"),
    workflow: filteredRecents.filter((item) => item.type === "workflow"),
    file: filteredRecents.filter((item) => item.type === "file"),
  };

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
          <div className="space-y-3 px-6 py-4">
            <button
              className="flex h-11 w-full items-center gap-2 border border-sidebar-border bg-sidebar-primary px-3 text-left font-mono text-[11.5px] uppercase tracking-[0.16em] text-sidebar-primary-foreground"
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Open command palette"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Create</span>
              <kbd className="ml-auto border border-sidebar-primary-foreground/20 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-sidebar-primary-foreground/90">
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
                {filteredGroupedNav[sectionKey].map((item) => {
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
                                active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/90"
                              }`
                            : `h-11 rounded-none px-4 font-mono text-[10.5px] uppercase tracking-[0.14em] ${
                                active ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/92"
                              }`
                        }
                      >
                        <NavLink
                          to={item.path}
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
                    <button key={item.id} className="flex w-full items-start gap-2 border border-transparent px-2 py-2 text-left text-sidebar-foreground/88 hover:border-sidebar-border hover:bg-sidebar-accent">
                      <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{item.title}</p>
                        </div>
                        <p className="mt-1 text-[11px] text-sidebar-foreground/75">{item.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ) : null}

        {!collapsed ? <div className="mx-4 border-t border-sidebar-border" /> : null}

        {!collapsed ? (
          <div className="pb-4">
            <SectionToggle
              label="History"
              open={sectionState.history}
              onClick={() => toggleSection("history")}
              extra={<History className="h-3.5 w-3.5 text-sidebar-foreground/75" />}
            />
            {sectionState.history ? (
              <div className="space-y-2 px-4 pt-2">
                {(Object.keys(historyByType) as Array<keyof typeof historyByType>).map((typeKey) => {
                  const sectionKey = `history_${typeKey}` as keyof typeof sectionState;
                  const items = historyByType[typeKey];
                  if (!items.length) return null;

                  return (
                    <div key={typeKey}>
                      <button
                        className="flex w-full items-center justify-between border border-sidebar-border px-2 py-2 font-mono text-[9px] uppercase tracking-[0.14em] text-sidebar-foreground/85"
                        onClick={() => toggleSection(sectionKey)}
                        type="button"
                      >
                        <span>{typeKey}</span>
                        {sectionState[sectionKey] ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      </button>
                      {sectionState[sectionKey] ? (
                        <div className="mt-1 space-y-1">
                          {items.map((item) => (
                            <button key={item.id} className="grid w-full grid-cols-[minmax(0,1fr)_82px] gap-3 border border-transparent px-2 py-2 text-left text-sidebar-foreground/82 hover:border-sidebar-border hover:bg-sidebar-accent">
                              <span className="font-mono text-[9px] uppercase tracking-[0.14em] leading-6">{item.title}</span>
                              <span className="text-right text-[11px] text-sidebar-foreground/75">{item.time}</span>
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
                {!filteredRecents.length ? <p className="px-2 py-2 text-sm text-sidebar-foreground/75">No matching history.</p> : null}
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
                          active ? "bg-sidebar-accent text-sidebar-foreground" : "text-sidebar-foreground/90"
                        }`
                      : "h-11 rounded-none px-4 font-mono text-[9.5px] uppercase tracking-[0.14em] text-sidebar-foreground/92"
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
              <span className="flex h-10 w-10 items-center justify-center border border-sidebar-border font-mono text-[9.5px] uppercase tracking-[0.12em]">HR</span>
              {!collapsed ? (
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-mono text-[10px] uppercase tracking-[0.14em]">Hemanth Rao</span>
                  <span className="block truncate text-[11px] text-sidebar-foreground/75">Operator</span>
                </span>
              ) : null}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align={collapsed ? "center" : "start"}
            side={collapsed ? "right" : "top"}
            className="w-52 border border-border bg-card"
            style={
              {
                "--radix-dropdown-menu-content-transform-origin": "top left",
              } as CSSProperties
            }
          >
            <DropdownMenuItem className="font-mono text-[11px] uppercase tracking-[0.12em]" onClick={() => navigateCurrentTab("/settings")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="font-mono text-[11px] uppercase tracking-[0.12em]">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
