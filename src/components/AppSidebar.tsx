import { useMemo, useState, type ReactNode } from "react";
import {
  ArchiveIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CaretRightIcon,
  ChecksIcon,
  CompassToolIcon,
  FolderOpenIcon,
  GearIcon,
  HouseIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  PushPinIcon,
  ShieldCheckIcon,
  SparkleIcon,
  StackIcon,
  StackSimpleIcon,
  StrategyIcon,
  TrayIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";

import { NavLink } from "@/components/NavLink";
import { contactCards, navigationItems, pinnedItems, recentItems, unifiedTasks } from "@/lib/ubik-data";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const iconMap: Record<string, Icon> = {
  home: HouseIcon,
  chat: StackIcon,
  inbox: TrayIcon,
  tasks: ChecksIcon,
  meetings: CalendarBlankIcon,
  projects: FolderOpenIcon,
  intelligence: CompassToolIcon,
  approvals: ShieldCheckIcon,
  workflows: StackSimpleIcon,
  agents: StrategyIcon,
  archive: ArchiveIcon,
  settings: GearIcon,
  help: LifebuoyIcon,
};

const sectionLabels = {
  navigate: "Navigate",
  playbooks: "Playbooks",
  support: "Workspace",
} as const;

const pinnedTypeIcon: Record<string, Icon> = {
  chat: StackIcon,
  project: FolderOpenIcon,
  workflow: StackSimpleIcon,
  approval: ShieldCheckIcon,
  meeting: CalendarBlankIcon,
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
    <div className="flex min-h-[32px] items-center justify-between gap-4 px-2">
      <Button variant="ghost" size="sm" className="h-auto px-0 text-[10px] font-medium uppercase tracking-[0.14em] text-sidebar-foreground/55 hover:bg-transparent hover:text-sidebar-foreground" onClick={onClick}>
        <span>{label}</span>
        {open ? <CaretDownIcon className="h-3.5 w-3.5" /> : <CaretRightIcon className="h-3.5 w-3.5" />}
      </Button>
      {extra}
    </div>
  );
}

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const { navigateCurrentTab, setCommandPaletteOpen } = useShellState();
  const location = useLocation();
  const currentUser = contactCards.find((contact) => contact.id === "contact-hemanth") ?? contactCards[0];
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
    <Sidebar collapsible="offcanvas" className="border-r border-border/70 bg-sidebar/95">
      <SidebarHeader className="h-14 gap-0 border-b border-sidebar-border/80 bg-sidebar/95 p-0">
        <div className={`${collapsed ? "px-3" : "px-4"} flex h-14 items-center`}>
          <div className={`flex w-full ${collapsed ? "items-center justify-center" : "items-center justify-between"} gap-4`}>
            <Button
              variant="ghost"
              size="sm"
              className={collapsed ? "h-auto px-0 text-center hover:bg-transparent" : "h-auto min-w-0 px-0 text-left hover:bg-transparent"}
              onClick={collapsed ? () => toggleSidebar() : undefined}
              type="button"
            >
              {!collapsed ? (
                <h2 className="whitespace-nowrap leading-none font-mono text-[1.45rem] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground">
                  [ UBIK ]
                </h2>
              ) : (
                <span className="font-mono text-[1.1rem] font-semibold uppercase tracking-[0.12em] text-sidebar-foreground">[U]</span>
              )}
            </Button>
            {!collapsed ? (
              <SidebarTrigger className="border-sidebar-border bg-background/70 text-sidebar-foreground hover:bg-sidebar-accent md:inline-flex" />
            ) : null}
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 bg-sidebar/95">
        <div className="px-4 py-4">
          <Button
            className="h-10 w-full justify-start bg-sidebar-primary text-sidebar-primary-foreground shadow-none"
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            aria-label="Open command palette"
          >
            <SparkleIcon data-icon="inline-start" />
            <span>Create</span>
            <kbd className="ml-auto rounded-md border border-sidebar-primary-foreground/20 px-1.5 py-0.5 font-mono text-[9px] tracking-wide text-sidebar-primary-foreground/90">
              ⌘K
            </kbd>
          </Button>
        </div>

        {(["navigate", "playbooks"] as const).map((sectionKey) => (
          <SidebarGroup key={sectionKey} className="gap-2 px-3 py-2">
            {!collapsed ? (
              <SidebarGroupLabel className="h-auto px-2 text-[10px] uppercase tracking-[0.14em] text-sidebar-foreground/45">
                {sectionLabels[sectionKey]}
              </SidebarGroupLabel>
            ) : null}
            {sectionState[sectionKey] && (
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {groupedNav[sectionKey].map((item) => {
                    const Icon = iconMap[item.key];
                    const active = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);

                    return (
                      <SidebarMenuItem key={item.key}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.title}
                          size="lg"
                          className={`font-mono text-[10.5px] uppercase tracking-[0.14em] ${
                            active
                              ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/95 hover:text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/78"
                          }`}
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
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                        {(item.badge || item.key === "tasks") ? (
                          <SidebarMenuBadge className={active ? "text-sidebar-primary-foreground/85" : "text-sidebar-foreground/48"}>
                            {item.key === "tasks" ? `${unifiedTasks.length}` : item.badge}
                          </SidebarMenuBadge>
                        ) : null}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            )}
          </SidebarGroup>
        ))}

        <SidebarSeparator />

        <SidebarGroup className="gap-2 px-3 py-2">
          <SectionToggle label="Pinned" open={sectionState.pinned} onClick={() => toggleSection("pinned")} />
          {sectionState.pinned ? (
            <SidebarGroupContent>
              <div className="space-y-1 rounded-xl bg-sidebar-accent/55 p-2">
                {pinnedItems.slice(0, 5).map((item) => {
                  const Icon = pinnedTypeIcon[item.type];

                  return (
                    <Button key={item.id} variant="ghost" className="h-auto w-full justify-start gap-2 rounded-lg px-2 py-2 text-left text-sidebar-foreground/78 hover:bg-sidebar-background">
                      <PushPinIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em]">{item.title}</p>
                        </div>
                        <p className="mt-1 text-[11px] text-sidebar-foreground/50">{item.subtitle}</p>
                      </div>
                    </Button>
                  );
                })}
                <Button variant="ghost" size="sm" className="h-auto justify-start px-2 text-[9px] uppercase tracking-[0.14em] text-sidebar-foreground/50 hover:bg-transparent hover:text-sidebar-foreground">More</Button>
              </div>
            </SidebarGroupContent>
          ) : null}
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup className="gap-2 px-3 py-2 pb-4">
          <SectionToggle
            label="Recents"
            open={sectionState.recents}
            onClick={() => toggleSection("recents")}
            extra={
              !collapsed ? (
                <div className="relative shrink-0">
                  <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-sidebar-foreground/45" />
                  <SidebarInput
                    value={recentSearch}
                    onChange={(event) => setRecentSearch(event.target.value)}
                    placeholder="Search"
                    className="h-9 w-[148px] border-sidebar-border/80 bg-sidebar-background pl-9 pr-3 text-[11px] text-sidebar-foreground placeholder:text-sidebar-foreground/45"
                  />
                </div>
              ) : undefined
            }
          />
          {sectionState.recents ? (
            <SidebarGroupContent>
              <div className="space-y-1 rounded-xl bg-sidebar-accent/45 p-2">
                {filteredRecents.slice(0, 6).map((item) => (
                  <Button key={item.id} variant="ghost" className="grid h-auto w-full grid-cols-[minmax(0,1fr)_82px] gap-3 rounded-lg px-2 py-2.5 text-left text-sidebar-foreground/75 hover:bg-sidebar-background">
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] leading-7">{item.title}</span>
                    <span className="text-right text-[11px] text-sidebar-foreground/45">{item.time}</span>
                  </Button>
                ))}
                {!filteredRecents.length ? (
                  <p className="px-2 py-2 text-sm text-sidebar-foreground/45">No matching chats.</p>
                ) : null}
                <Button variant="ghost" size="sm" className="h-auto justify-start px-2 text-[9px] uppercase tracking-[0.14em] text-sidebar-foreground/50 hover:bg-transparent hover:text-sidebar-foreground">More</Button>
              </div>
            </SidebarGroupContent>
          ) : null}
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="gap-0 border-t border-sidebar-border/80 bg-sidebar/95 p-0">
        <SidebarMenu className="px-3 py-3">
          {groupedNav.support.map((item) => {
            const Icon = iconMap[item.key];
            const active = location.pathname.startsWith(item.path);

            return (
              <SidebarMenuItem key={item.key}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  tooltip={item.title}
                  size="lg"
                  className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-sidebar-foreground/78"
                >
                  <NavLink
                    to={item.path}
                    onClick={(event) => {
                      event.preventDefault();
                      navigateCurrentTab(item.path);
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto w-full justify-start gap-3 rounded-none border-t border-sidebar-border/80 px-4 py-4 text-left text-sidebar-foreground hover:bg-sidebar-accent/70">
              <Avatar size="lg">
                <AvatarImage alt={currentUser.name} src={currentUser.avatarSrc} />
                <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.12em]">{currentUser.name}</p>
                <p className="mt-1 text-[11px] text-sidebar-foreground/45">Business · Prod · v1.0.4</p>
              </div>
            </Button>
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
