import { useMemo, useState } from "react";
import {
  CalendarBlankIcon,
  CaretDownIcon,
  ChatsIcon,
  ChecksIcon,
  ClockCounterClockwiseIcon,
  CompassToolIcon,
  CreditCardIcon,
  FolderOpenIcon,
  GearIcon,
  HouseIcon,
  LifebuoyIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SparkleIcon,
  StackIcon,
  StackSimpleIcon,
  TrayIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";

import { NavLink } from "@/components/NavLink";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenuAction,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { approvals, contactCards, inboxThreads, meetings, navigationItems, pinnedItems, projects, recentItems, unifiedTasks } from "@/lib/ubik-data";
import { cn } from "@/lib/utils";

type MasterItemKey =
  | "home"
  | "chat"
  | "inbox"
  | "meetings"
  | "tasks"
  | "projects"
  | "intelligence"
  | "approvals"
  | "playbooks";

type ContextChild = {
  id: string;
  label: string;
  meta: string;
  path: string;
};

type MasterNavItem = {
  key: MasterItemKey;
  title: string;
  icon: Icon;
  paths: string[];
  badge?: string;
  children?: ContextChild[];
};

const iconMap: Record<string, Icon> = {
  home: HouseIcon,
  chat: StackIcon,
  inbox: TrayIcon,
  tasks: ChecksIcon,
  projects: FolderOpenIcon,
  intelligence: CompassToolIcon,
  approvals: ShieldCheckIcon,
};

function matchesSearch(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

function truncateMeta(value: string) {
  return value.length > 42 ? `${value.slice(0, 39)}...` : value;
}

function limitChildren(children: ContextChild[]) {
  return children.slice(0, 3);
}

export function AppSidebar() {
  const { state, toggleSidebar, isMobile } = useSidebar();
  const { navigateCurrentTab, openDrawer } = useShellState();
  const location = useLocation();
  const collapsed = state === "collapsed";
  const currentUser = contactCards.find((contact) => contact.id === "contact-hemanth") ?? contactCards[0];
  const [navSearch, setNavSearch] = useWorkbenchState("sidebar-nav-search", "");
  const [openItems, setOpenItems] = useState<Record<MasterItemKey, boolean>>(() => {
    const initial = {
      home: false,
      chat: false,
      inbox: location.pathname.startsWith("/inbox"),
      meetings: location.pathname.startsWith("/meetings"),
      tasks: location.pathname.startsWith("/tasks"),
      projects: location.pathname.startsWith("/projects"),
      intelligence: location.pathname.startsWith("/intelligence"),
      approvals: location.pathname.startsWith("/approvals"),
      playbooks: false,
    };

    return initial;
  });

  const normalizedSearch = navSearch.trim().toLowerCase();
  const upcomingMeetings = meetings.filter((meeting) => meeting.stage === "Upcoming");
  const waitingOnYouCount = inboxThreads.filter((thread) => thread.waitingState === "Waiting on you").length;
  const blockedByApprovalCount = inboxThreads.filter((thread) => thread.followUpStatus === "blocked_by_approval").length;
  const urgentApprovals = approvals.filter((item) => item.status === "Urgent").length;

  const navItemsByKey = useMemo(
    () => Object.fromEntries(navigationItems.map((item) => [item.key, item])),
    [],
  );

  const masterItems = useMemo<MasterNavItem[]>(() => {
    const home = navItemsByKey.home;
    const chat = navItemsByKey.chat;
    const inbox = navItemsByKey.inbox;
    const meetingsNav = navItemsByKey.meetings;
    const tasks = navItemsByKey.tasks;
    const projectsNav = navItemsByKey.projects;
    const intelligence = navItemsByKey.intelligence;
    const approvalsNav = navItemsByKey.approvals;

    return [
      {
        key: "home",
        title: home.title,
        icon: HouseIcon,
        paths: [home.path],
      },
      {
        key: "chat",
        title: chat.title,
        icon: StackIcon,
        paths: [chat.path],
      },
      {
        key: "inbox",
        title: inbox.title,
        icon: TrayIcon,
        paths: [inbox.path],
        badge: inbox.badge,
        children: limitChildren([
          { id: "inbox-thread", label: truncateMeta(inboxThreads[0]?.subject ?? "Priority response"), meta: inboxThreads[0]?.dueRisk ?? "Due soon", path: "/inbox" },
          { id: "inbox-waiting", label: "Waiting on you", meta: `${waitingOnYouCount} active threads`, path: "/inbox" },
          { id: "inbox-approvals", label: "Approval blockers", meta: `${blockedByApprovalCount} blocked by review`, path: "/approvals" },
        ]),
      },
      {
        key: "meetings",
        title: meetingsNav.title,
        icon: CalendarBlankIcon,
        paths: [meetingsNav.path],
        children: limitChildren([
          { id: "meetings-upcoming-primary", label: upcomingMeetings[0]?.title ?? "Supplier review - Thai Union", meta: upcomingMeetings[0]?.time ?? "Today · 10:30 AM PST", path: "/meetings" },
          { id: "meetings-upcoming-secondary", label: upcomingMeetings[1]?.title ?? "Logistics sync - Maersk", meta: upcomingMeetings[1]?.time ?? "Today · 2:00 PM PST", path: "/meetings" },
          { id: "meetings-brief", label: meetings[2]?.title ?? "Morning operator brief", meta: meetings[2]?.time ?? "Today · 8:15 AM PST", path: "/meetings" },
        ]),
      },
      {
        key: "tasks",
        title: tasks.title,
        icon: ChecksIcon,
        paths: [tasks.path],
        badge: `${unifiedTasks.length}`,
        children: limitChildren([
          { id: "tasks-today", label: "Today queue", meta: `${unifiedTasks.length} linked actions`, path: "/tasks" },
          { id: "tasks-followups", label: truncateMeta(pinnedItems[3]?.title ?? "Thai Union exception"), meta: pinnedItems[3]?.subtitle ?? "Follow-through in motion", path: "/tasks" },
          { id: "tasks-approvals", label: "Approval dependencies", meta: `${urgentApprovals} urgent reviews`, path: "/approvals" },
        ]),
      },
      {
        key: "projects",
        title: projectsNav.title,
        icon: FolderOpenIcon,
        paths: [projectsNav.path],
        children: limitChildren([
          { id: "projects-primary", label: projects[0]?.name ?? "Mumbai-Rotterdam Q2", meta: projects[0]?.code ?? "Project", path: "/projects" },
          { id: "projects-secondary", label: projects[1]?.name ?? "Supplier Compliance Audit", meta: projects[1]?.code ?? "Project", path: "/projects" },
          { id: "projects-tertiary", label: projects[2]?.name ?? "Atlantic Fresh Q3", meta: projects[2]?.code ?? "Project", path: "/projects" },
        ]),
      },
      {
        key: "intelligence",
        title: intelligence.title,
        icon: CompassToolIcon,
        paths: [intelligence.path],
        children: limitChildren([
          { id: "intel-monitor", label: "Pricing monitor", meta: recentItems[2]?.time ?? "Latest run", path: "/intelligence" },
          { id: "intel-research", label: "Connector-grounded research", meta: "Drive, Gmail, Calendar", path: "/" },
          { id: "intel-watch", label: "Policy watch", meta: "Saved monitor and brief", path: "/intelligence" },
        ]),
      },
      {
        key: "approvals",
        title: approvalsNav.title,
        icon: ShieldCheckIcon,
        paths: [approvalsNav.path],
        badge: approvalsNav.badge,
        children: limitChildren([
          { id: "approvals-urgent", label: approvals[0]?.title ?? "Urgent review", meta: approvals[0]?.status ?? "Urgent", path: "/approvals" },
          { id: "approvals-queue", label: "Review queue", meta: `${approvals.length} packets active`, path: "/approvals" },
          { id: "approvals-secondary", label: approvals[1]?.title ?? "Supplier release gate", meta: approvals[1]?.status ?? "Review", path: "/approvals" },
        ]),
      },
      {
        key: "playbooks",
        title: "Playbooks",
        icon: StackSimpleIcon,
        paths: ["/workflows", "/agents"],
      },
    ];
  }, [navItemsByKey, upcomingMeetings, waitingOnYouCount, blockedByApprovalCount, urgentApprovals]);

  const visibleMasterItems = masterItems.filter((item) => {
    if (!normalizedSearch) return true;

    return (
      matchesSearch(item.title, normalizedSearch) ||
      item.children?.some((child) => matchesSearch(child.label, normalizedSearch) || matchesSearch(child.meta, normalizedSearch))
    );
  });

  const isPathActive = (path: string) => (path === "/" ? location.pathname === "/" : location.pathname.startsWith(path));
  const isMasterActive = (item: MasterNavItem) => item.paths.some((path) => isPathActive(path));

  const utilityNavItems = [
    {
      id: "support",
      label: "Support",
      icon: LifebuoyIcon,
      onSelect: () => navigateCurrentTab("/help"),
    },
    {
      id: "report-bug",
      label: "Report Bug",
      icon: ChatsIcon,
      onSelect: () =>
        openDrawer({
          title: "Report Bug",
          eyebrow: "Workspace",
          description: "Capture UI issues, broken interactions, or preset regressions for the next pass.",
          actions: ["Open bug report"],
        }),
    },
    {
      id: "history",
      label: "History",
      icon: ClockCounterClockwiseIcon,
      onSelect: () => navigateCurrentTab("/archive"),
    },
  ];

  const accountActions = [
    {
      id: "settings",
      label: "Settings",
      icon: GearIcon,
      onSelect: () => navigateCurrentTab("/settings"),
    },
    {
      id: "billing",
      label: "Billing",
      icon: CreditCardIcon,
      onSelect: () =>
        openDrawer({
          title: "Billing",
          eyebrow: "Workspace",
          description: "Review plan status, invoices, and workspace billing controls.",
          actions: ["Open billing"],
        }),
    },
    {
      id: "punk-notes",
      label: "Punk Notes",
      icon: NotePencilIcon,
      onSelect: () =>
        openDrawer({
          title: "Punk Notes",
          eyebrow: "Changelog",
          description: "Latest product notes, shipped changes, and rough-edge fixes across the workspace.",
          actions: ["Open changelog"],
        }),
    },
    {
      id: "log-out",
      label: "Log out",
      icon: SignOutIcon,
      onSelect: () =>
        openDrawer({
          title: "Session",
          eyebrow: "Workspace",
          description: "Session controls are stubbed in this prototype surface.",
          actions: ["Close session"],
        }),
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-border/70 bg-sidebar/95">
      <SidebarHeader className="gap-3 border-b border-sidebar-border/80 bg-sidebar/95 px-3 py-3">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            className={cn(
              "h-auto min-w-0 justify-start gap-3 px-1 py-1 text-left hover:bg-transparent",
              collapsed && "w-full justify-center px-0",
            )}
            onClick={collapsed ? () => toggleSidebar() : undefined}
            type="button"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-foreground text-sidebar">
              <SparkleIcon className="size-4" />
            </span>
            {!collapsed ? (
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium text-sidebar-foreground">UBIK</span>
                <span className="block truncate text-xs text-sidebar-foreground/50">Enterprise</span>
              </span>
            ) : null}
          </Button>

          {!collapsed ? (
            <SidebarTrigger className="border-sidebar-border bg-background/70 text-sidebar-foreground hover:bg-sidebar-accent" />
          ) : null}
        </div>

        {!collapsed ? (
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-sidebar-foreground/40" />
            <SidebarInput
              value={navSearch}
              onChange={(event) => setNavSearch(event.target.value)}
              placeholder="Search"
              className="h-9 border-sidebar-border/80 bg-sidebar-background pl-9 text-sm text-sidebar-foreground placeholder:text-sidebar-foreground/40"
            />
          </div>
        ) : null}
      </SidebarHeader>

      <SidebarContent className="bg-sidebar/95">
        <SidebarGroup className="gap-2 px-2 py-3">
          {!collapsed ? (
            <SidebarGroupLabel className="px-2 text-[11px] font-medium tracking-normal text-sidebar-foreground/45">
              Platform
            </SidebarGroupLabel>
          ) : null}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleMasterItems.map((item) => {
                const isActive = isMasterActive(item);
                const hasChildren = Boolean(item.children?.length);
                const isOpen = hasChildren ? (normalizedSearch ? true : isActive || openItems[item.key]) : false;
                const topLevelPath = item.paths[0];
                const buttonClassName = cn(
                  "h-9 gap-3 px-2.5 text-sm",
                  hasChildren || item.badge ? "pr-10" : null,
                  hasChildren && item.badge ? "pr-14" : null,
                );

                if (!hasChildren) {
                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        tooltip={item.title}
                        asChild
                        isActive={isActive}
                        className={buttonClassName}
                      >
                        <NavLink
                          to={topLevelPath}
                          end={topLevelPath === "/"}
                          onClick={(event) => {
                            event.preventDefault();
                            navigateCurrentTab(topLevelPath);
                          }}
                        >
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <Collapsible
                    key={item.key}
                    open={isOpen}
                    onOpenChange={(open) => setOpenItems((current) => ({ ...current, [item.key]: open }))}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip={item.title}
                        asChild
                        isActive={isActive}
                        className={buttonClassName}
                      >
                        <NavLink
                          to={topLevelPath}
                          end={topLevelPath === "/"}
                          onClick={(event) => {
                            event.preventDefault();
                            navigateCurrentTab(topLevelPath);
                          }}
                        >
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                      {item.badge ? (
                        <SidebarMenuBadge className={cn("top-2", hasChildren ? "right-8" : "right-2", isActive ? "text-sidebar-accent-foreground/85" : "text-sidebar-foreground/48")}>
                          {item.badge}
                        </SidebarMenuBadge>
                      ) : null}
                      <CollapsibleTrigger asChild>
                        <SidebarMenuAction className="right-2 top-2 text-sidebar-foreground/45 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                          <CaretDownIcon className={cn("size-3.5 transition-transform", !isOpen && "-rotate-90")} />
                          <span className="sr-only">Toggle {item.title}</span>
                        </SidebarMenuAction>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none">
                        <SidebarMenuSub>
                          {item.children?.map((child) => (
                            <SidebarMenuSubItem key={child.id}>
                              <SidebarMenuSubButton asChild className="h-auto items-start py-1.5">
                                <NavLink
                                  to={child.path}
                                  onClick={(event) => {
                                    event.preventDefault();
                                    navigateCurrentTab(child.path);
                                  }}
                                >
                                  <span className="min-w-0">
                                    <span className="block truncate text-[13px] font-medium text-sidebar-foreground">
                                      {child.label}
                                    </span>
                                    <span className="mt-0.5 block truncate text-[11px] text-sidebar-foreground/45">
                                      {child.meta}
                                    </span>
                                  </span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter className="gap-3 bg-sidebar/95 px-2 py-3">
        <SidebarMenu className="gap-1">
          {utilityNavItems.map((action) => (
            <SidebarMenuItem key={action.id}>
              <SidebarMenuButton
                tooltip={action.label}
                className="h-9 gap-3 px-2.5 text-sm"
                onClick={action.onSelect}
                type="button"
              >
                <action.icon className="size-4" />
                <span>{action.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "h-auto gap-3 border border-sidebar-border/70 px-2.5 py-2.5 text-sidebar-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                    !collapsed && "w-full justify-start",
                    collapsed && "justify-center px-2",
                  )}
                >
                  <Avatar size="lg">
                    <AvatarImage alt={currentUser.name} src={currentUser.avatarSrc} />
                    <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
                  </Avatar>
                  {!collapsed ? (
                    <>
                      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{currentUser.name}</span>
                        <span className="truncate text-xs text-sidebar-foreground/45">
                          Business · Prod · v1.0.4
                        </span>
                      </div>
                      <CaretDownIcon className="ml-auto size-3.5 text-sidebar-foreground/45" />
                    </>
                  ) : null}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={collapsed || isMobile ? "right" : "top"}
                align={collapsed || isMobile ? "end" : "start"}
                sideOffset={4}
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 p-0"
              >
                <DropdownMenuLabel className="px-3 py-3 text-foreground">
                  <div className="flex items-center gap-3">
                    <Avatar size="lg">
                      <AvatarImage alt={currentUser.name} src={currentUser.avatarSrc} />
                      <AvatarFallback>{currentUser.avatarFallback}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{currentUser.name}</p>
                      <p className="truncate text-xs font-normal text-muted-foreground">
                        hemanth@{currentUser.domain ?? "ubik.ai"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {accountActions.map((action) => (
                  <DropdownMenuItem
                    key={action.id}
                    className="gap-2 px-3 py-2 text-sm"
                    onClick={action.onSelect}
                  >
                    <action.icon className="size-4" />
                    <span>{action.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
