import { useMemo, useState } from "react";
import {
  CalendarBlankIcon,
  ChatsIcon,
  CheckSquareIcon,
  FilesIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  SparkleIcon,
  StackSimpleIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import { useLocation, useNavigate } from "react-router-dom";

import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { Badge } from "@/components/ui/badge";
import { useShellState } from "@/hooks/use-shell-state";
import {
  activeOrders,
  approvals,
  cargoMovements,
  chatRecentWork,
  contactCards,
  homeActivityFeed,
  inboxThreads,
  meetings,
  projects,
  starterActions,
} from "@/lib/ubik-data";
import { findContactCard } from "@/lib/contact-helpers";
import type { ContextualSearchItem, RouteMeta } from "@/lib/ubik-types";

type SearchItem = ContextualSearchItem & {
  keywords?: string;
  icon: React.ReactNode;
  onSelect: () => void;
};

type SearchSection = {
  id: string;
  label: string;
  items: SearchItem[];
};

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function matchesQuery(query: string, item: SearchItem) {
  if (!query) return true;
  return [item.label, item.supportingText, item.keywords]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function TopBarSearch({
  route,
  onAction,
}: {
  route: RouteMeta | undefined;
  onAction: (label: string) => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeTabId,
    getPageState,
    openDrawer,
    openFreshKnowAnything,
    openRuntime,
    setPageState,
  } = useShellState();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const routeKey = route?.key ?? "chat";
  const normalizedQuery = normalizeQuery(query);
  const delayedFleet = cargoMovements.filter((cargo) => cargo.delayDays > 3).length;
  const urgentApprovals = approvals.filter((item) => item.status === "Urgent").length;
  const actionRequiredCount = inboxThreads.filter(
    (thread) =>
      thread.priorityBand === "needs_attention" ||
      thread.priorityBand === "waiting_on_you" ||
      thread.followUpStatus === "due_soon" ||
      thread.followUpStatus === "overdue" ||
      thread.followUpStatus === "blocked_by_approval",
  ).length;

  const currentInboxThreadId = useMemo(() => {
    if (location.pathname.startsWith("/inbox/")) {
      return location.pathname.split("/")[2] ?? inboxThreads[0]?.id;
    }

    return getPageState(`${activeTabId}:inbox-selected-thread`, inboxThreads[0]?.id ?? "");
  }, [activeTabId, getPageState, location.pathname]);
  const currentInboxThread = inboxThreads.find((thread) => thread.id === currentInboxThreadId) ?? inboxThreads[0];

  const currentMeetingId = useMemo(() => {
    if (location.pathname.startsWith("/meetings/")) {
      return location.pathname.split("/")[2] ?? meetings[0]?.id;
    }

    return getPageState(`${activeTabId}:meeting-id`, meetings[0]?.id ?? "");
  }, [activeTabId, getPageState, location.pathname]);
  const currentMeeting = meetings.find((meeting) => meeting.id === currentMeetingId) ?? meetings[0];

  const currentProjectId = getPageState(`${activeTabId}:project-id`, projects[0]?.id ?? "");
  const currentProject = projects.find((project) => project.id === currentProjectId) ?? projects[0];

  const openPromptInKnowAnything = (prompt: string, artifactLabel?: string) => {
    const tabId = openFreshKnowAnything();
    if (!tabId) return;

    setPageState(`${tabId}:chat-composer`, prompt);
    setPageState(`${tabId}:chat-mode`, "plan");
    setPageState(`${tabId}:chat-sources`, ["org_knowledge", "files"]);

    if (artifactLabel) {
      openRuntime({
        title: "Prepared context",
        status: "Ready",
        lines: [
          `> Route: ${route?.title ?? "Workspace"}`,
          `> Artifact: ${artifactLabel}`,
          "",
          prompt,
        ],
        artifactLabel,
      });
    }
  };

  const sections = useMemo<SearchSection[]>(() => {
    const buildSections = () => {
      if (routeKey === "home") {
        const widgetItems: SearchItem[] = [
          {
            id: "widget-revenue-pulse",
            section: "Widgets",
            kind: "record",
            label: "Revenue Pulse",
            supportingText: `${activeOrders.length} active orders · Weekly trend`,
            keywords: "sales revenue pulse weekly trend",
            icon: <StackSimpleIcon className="h-4 w-4" />,
            onSelect: () =>
              openDrawer({
                title: "Revenue Pulse",
                eyebrow: "Sales",
                description: "Weekly trend widget for active orders and revenue movement.",
                metadata: [
                  { label: "Metric", value: `$${(activeOrders.reduce((sum, order) => sum + order.value, 0) / 1000).toFixed(1)}K` },
                  { label: "Orders", value: `${activeOrders.length}` },
                ],
                actions: ["Ask UBIK", "Open Inbox"],
              }),
          },
          {
            id: "widget-pricing-ticker",
            section: "Widgets",
            kind: "record",
            label: "Pricing Ticker",
            supportingText: "$6.84/kg optimal bid · 18h buy window",
            keywords: "pricing ticker market intel commodity bid research",
            icon: <CheckSquareIcon className="h-4 w-4" />,
            onSelect: () =>
              openDrawer({
                title: "Pricing Ticker",
                eyebrow: "Market Intel",
                description: "Commodity bid guidance built from market range, cargo pressure, and buyer timing.",
                metadata: [
                  { label: "Optimal bid", value: "$6.84/kg" },
                  { label: "Buy window", value: "18h" },
                ],
                actions: ["Open Projects", "Inspect pricing"],
              }),
          },
          {
            id: "widget-fleet-continuity",
            section: "Widgets",
            kind: "record",
            label: "Fleet Continuity",
            supportingText: `${cargoMovements.length - delayedFleet}/${cargoMovements.length} healthy · ${delayedFleet} delayed`,
            keywords: "fleet continuity containers delays plant ops",
            icon: <CalendarBlankIcon className="h-4 w-4" />,
            onSelect: () =>
              openDrawer({
                title: "Fleet Continuity",
                eyebrow: "Plant Ops",
                description: "Container movement health and delay exposure for the current operating window.",
                metadata: [
                  { label: "Healthy", value: `${cargoMovements.length - delayedFleet}/${cargoMovements.length}` },
                  { label: "Delayed", value: `${delayedFleet}` },
                ],
                actions: ["Open Meetings", "Inspect movement log"],
              }),
          },
          {
            id: "widget-compliance-risk",
            section: "Widgets",
            kind: "artifact",
            label: "Packaging & Finance",
            supportingText: `${urgentApprovals} urgent approvals · ${actionRequiredCount} follow-ups`,
            keywords: "packaging finance approvals follow-up risk",
            icon: <SparkleIcon className="h-4 w-4" />,
            onSelect: () =>
              openDrawer({
                title: "Packaging & Finance",
                eyebrow: "Sustainability / Finance",
                description: "Approval pressure, follow-up risk, and expiring certification coverage.",
                metadata: [
                  { label: "Urgent approvals", value: `${urgentApprovals}` },
                  { label: "Follow-ups", value: `${actionRequiredCount}` },
                ],
                actions: ["Open Approvals", "Open Inbox"],
              }),
          },
        ];

        const activityItems: SearchItem[] = homeActivityFeed.map((item) => ({
          id: item.id,
          section: "Activity",
          kind: item.type === "artifact" ? "artifact" : "record",
          label: item.title,
          supportingText: `${item.source} · ${item.owner} · ${item.time}`,
          keywords: `${item.insight} ${item.priority} ${item.ctaLabel}`,
          icon: item.type === "meeting" ? <CalendarBlankIcon className="h-4 w-4" /> : <NotePencilIcon className="h-4 w-4" />,
          onSelect: () =>
            openDrawer({
              title: item.title,
              eyebrow: item.source,
              description: item.insight,
              metadata: [
                { label: "Priority", value: item.priority },
                { label: "Owner", value: item.owner },
              ],
              actions: [item.ctaLabel],
            }),
        }));

        return [
          { id: "home-widgets", label: "Widgets", items: widgetItems },
          { id: "home-activity", label: "Activity", items: activityItems },
        ];
      }

      if (routeKey === "chat") {
        const historyItems: SearchItem[] = chatRecentWork.map((item) => ({
          id: item.id,
          section: "History",
          kind: "record",
          label: item.title,
          supportingText: item.summary,
          keywords: `${item.title} ${item.summary}`,
          icon: <ChatsIcon className="h-4 w-4" />,
          onSelect: () => openPromptInKnowAnything(`Continue this thread:\n${item.title}\n\nContext:\n${item.summary}`),
        }));

        const artifactItems: SearchItem[] = homeActivityFeed
          .filter((item) => item.type === "artifact")
          .map((item) => ({
            id: `artifact-${item.id}`,
            section: "Artifacts",
            kind: "artifact" as const,
            label: item.title,
            supportingText: item.insight,
            keywords: `${item.owner} ${item.source} ${item.ctaLabel}`,
            icon: <FilesIcon className="h-4 w-4" />,
            onSelect: () =>
              openPromptInKnowAnything(
                `Review the artifact "${item.title}" and summarize the key findings, owner, and next recommended action.`,
                item.ctaLabel,
              ),
          }));

        const promptItems: SearchItem[] = starterActions.map((item) => ({
          id: item.id,
          section: "Prompts",
          kind: "prompt",
          label: item.title,
          supportingText: item.description,
          keywords: `${item.title} ${item.description}`,
          icon: <SparkleIcon className="h-4 w-4" />,
          onSelect: () => openPromptInKnowAnything(`${item.title}\n\n${item.description}`),
        }));

        return [
          { id: "chat-history", label: "History", items: historyItems },
          { id: "chat-artifacts", label: "Artifacts", items: artifactItems },
          { id: "chat-prompts", label: "Prompts", items: promptItems },
        ];
      }

      if (routeKey === "inbox") {
        const threadItems: SearchItem[] = inboxThreads.map((thread) => ({
          id: thread.id,
          section: "Threads",
          kind: "record",
          label: thread.subject,
          supportingText: `${thread.sender} · ${thread.company} · ${thread.time}`,
          keywords: `${thread.preview} ${thread.recommendedReply} ${thread.tags.join(" ")}`,
          icon: <ChatsIcon className="h-4 w-4" />,
          onSelect: () => {
            setPageState(`${activeTabId}:inbox-selected-thread`, thread.id);
            navigate({ pathname: `/inbox/${thread.id}`, search: `tab=${activeTabId}` });
          },
        }));

        const artifactItems: SearchItem[] = (currentInboxThread?.attachments ?? []).map((attachment) => ({
          id: `inbox-attachment-${attachment}`,
          section: "Artifacts",
          kind: "artifact",
          label: attachment,
          supportingText: `${currentInboxThread?.subject ?? "Selected thread"} · attachment`,
          keywords: `${attachment} ${currentInboxThread?.sender ?? ""}`,
          icon: <FilesIcon className="h-4 w-4" />,
          onSelect: () =>
            openDrawer({
              title: attachment,
              eyebrow: "Inbox artifact",
              description: currentInboxThread?.preview ?? "Attachment linked to the selected inbox thread.",
              metadata: [
                { label: "Thread", value: currentInboxThread?.subject ?? "Unknown thread" },
                { label: "Sender", value: currentInboxThread?.sender ?? "Unknown sender" },
              ],
              actions: ["Open in Email", "Discuss"],
            }),
        }));

        const promptItems: SearchItem[] = [
          {
            id: "inbox-prompt-reply",
            section: "Prompts",
            kind: "prompt",
            label: `Open reply editor for ${currentInboxThread?.sender ?? "selected thread"}`,
            supportingText: "Expand the reply metadata row and keep the draft in context.",
            keywords: "reply editor draft respond outbound",
            icon: <NotePencilIcon className="h-4 w-4" />,
            onSelect: () => {
              const current = getPageState<Record<string, boolean>>(`${activeTabId}:inbox-email-meta-open`, {});
              setPageState(`${activeTabId}:inbox-email-meta-open`, {
                ...current,
                [currentInboxThread.id]: true,
              });
            },
          },
          {
            id: "inbox-prompt-approval",
            section: "Prompts",
            kind: "prompt",
            label: "Assign for approval",
            supportingText: "Open the approval handoff panel for the selected thread.",
            keywords: "approval handoff assign review",
            icon: <CheckSquareIcon className="h-4 w-4" />,
            onSelect: () => {
              const current = getPageState<Record<string, boolean>>(`${activeTabId}:inbox-approval-open`, {});
              setPageState(`${activeTabId}:inbox-approval-open`, {
                ...current,
                [currentInboxThread.id]: true,
              });
            },
          },
          {
            id: "inbox-prompt-discuss",
            section: "Prompts",
            kind: "prompt",
            label: "Discuss with teammate",
            supportingText: "Open the discuss panel and route the current thread with context.",
            keywords: "discuss teammate share thread",
            icon: <UsersIcon className="h-4 w-4" />,
            onSelect: () => {
              const current = getPageState<Record<string, boolean>>(`${activeTabId}:inbox-discuss-open`, {});
              setPageState(`${activeTabId}:inbox-discuss-open`, {
                ...current,
                [currentInboxThread.id]: true,
              });
            },
          },
        ];

        return [
          { id: "inbox-threads", label: "Threads", items: threadItems },
          { id: "inbox-artifacts", label: "Artifacts", items: artifactItems },
          { id: "inbox-prompts", label: "Prompts", items: promptItems },
        ];
      }

      if (routeKey === "meetings") {
        const historyItems: SearchItem[] = meetings.map((meeting) => ({
          id: meeting.id,
          section: "History",
          kind: "record",
          label: meeting.title,
          supportingText: `${meeting.time} · ${meeting.owner}`,
          keywords: `${meeting.summary} ${meeting.participants.join(" ")} ${meeting.actionItems.join(" ")}`,
          icon: <CalendarBlankIcon className="h-4 w-4" />,
          onSelect: () => {
            setPageState(`${activeTabId}:meeting-id`, meeting.id);
            navigate({ pathname: `/meetings/${meeting.id}`, search: `tab=${activeTabId}` });
          },
        }));

        const artifactItems: SearchItem[] = meetings.map((meeting) => ({
          id: `meeting-artifact-${meeting.id}`,
          section: "Artifacts",
          kind: "artifact",
          label: `${meeting.title} notes.md`,
          supportingText: `${meeting.time} · generated meeting note`,
          keywords: `${meeting.title} notes transcript decisions action items`,
          icon: <FilesIcon className="h-4 w-4" />,
          onSelect: () => {
            setPageState(`${activeTabId}:meeting-id`, meeting.id);
            setPageState(`${activeTabId}:meetings-folder-tab`, "files");
            navigate({ pathname: `/meetings/${meeting.id}`, search: `tab=${activeTabId}` });
          },
        }));

        const peopleItems: SearchItem[] = Array.from(new Set(meetings.flatMap((meeting) => meeting.participants))).map((person) => {
          const matchedMeeting = meetings.find((meeting) => meeting.participants.includes(person)) ?? currentMeeting;
          const card = findContactCard(person);

          return {
            id: `meeting-person-${person}`,
            section: "People",
            kind: "person" as const,
            label: person,
            supportingText: card ? `${card.role} · ${card.company}` : `${matchedMeeting.title} participant`,
            keywords: `${person} ${card?.company ?? ""} ${matchedMeeting.title}`,
            icon: <UsersIcon className="h-4 w-4" />,
            onSelect: () => {
              setPageState(`${activeTabId}:meeting-id`, matchedMeeting.id);
              setPageState(`${activeTabId}:meetings-folder-tab`, "people");
              navigate({ pathname: `/meetings/${matchedMeeting.id}`, search: `tab=${activeTabId}` });
            },
          };
        });

        return [
          { id: "meetings-history", label: "History", items: historyItems },
          { id: "meetings-artifacts", label: "Artifacts", items: artifactItems },
          { id: "meetings-people", label: "People", items: peopleItems },
        ];
      }

      if (routeKey === "projects") {
        const projectItems: SearchItem[] = projects.map((project) => ({
          id: project.id,
          section: "Projects",
          kind: "record",
          label: project.name,
          supportingText: `${project.code} · ${project.status} · ${project.owner}`,
          keywords: `${project.summary} ${project.team.join(" ")} ${project.nextActions.join(" ")}`,
          icon: <FolderOpenIcon className="h-4 w-4" />,
          onSelect: () => {
            setPageState(`${activeTabId}:project-id`, project.id);
          },
        }));

        const artifactItems: SearchItem[] = projects.flatMap((project) =>
          project.linked.map((item) => ({
            id: `${project.id}-${item.label}`,
            section: "Artifacts",
            kind: item.kind === "chat" ? "record" : "artifact",
            label: item.label,
            supportingText: `${project.name} · ${item.kind}`,
            keywords: `${project.code} ${project.summary} ${item.kind}`,
            icon: item.kind === "meeting" ? <CalendarBlankIcon className="h-4 w-4" /> : <FilesIcon className="h-4 w-4" />,
            onSelect: () => {
              setPageState(`${activeTabId}:project-id`, project.id);
              openDrawer({
                title: item.label,
                eyebrow: "Linked context",
                description: `Linked ${item.kind} for ${project.name}.`,
                metadata: [
                  { label: "Project", value: project.name },
                  { label: "Type", value: item.kind },
                ],
                actions: ["Inspect", "Open project"],
              });
            },
          })),
        );

        const nextActionItems: SearchItem[] = currentProject.nextActions.map((action, index) => ({
          id: `project-next-action-${index}`,
          section: "Next actions",
          kind: "prompt",
          label: action,
          supportingText: `${currentProject.name} · next action`,
          keywords: `${currentProject.name} ${currentProject.owner} ${action}`,
          icon: <SparkleIcon className="h-4 w-4" />,
          onSelect: () =>
            openDrawer({
              title: currentProject.name,
              eyebrow: "Next action",
              description: action,
              metadata: [
                { label: "Owner", value: currentProject.owner },
                { label: "Status", value: currentProject.status },
              ],
              actions: [action],
            }),
        }));

        return [
          { id: "projects-list", label: "Projects", items: projectItems },
          { id: "projects-artifacts", label: "Artifacts", items: artifactItems },
          { id: "projects-next-actions", label: "Next actions", items: nextActionItems },
        ];
      }

      return [
        {
          id: `${routeKey}-actions`,
          label: route?.search.sections[0] ?? "Actions",
          items: (route?.actions ?? []).map((action) => ({
            id: `${routeKey}-${action.label}`,
            section: route?.search.sections[0] ?? "Actions",
            kind: "action" as const,
            label: action.label,
            supportingText: `${route?.title ?? "Workspace"} action`,
            keywords: `${route?.title ?? ""} ${action.label}`,
            icon: <SparkleIcon className="h-4 w-4" />,
            onSelect: () => onAction(action.label),
          })),
        },
      ];
    };

    return buildSections()
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => matchesQuery(normalizedQuery, item)).slice(0, normalizedQuery ? 6 : 4),
      }))
      .filter((section) => section.items.length > 0);
  }, [
    activeTabId,
    actionRequiredCount,
    currentInboxThread,
    currentInboxThreadId,
    currentMeeting,
    currentProject,
    delayedFleet,
    getPageState,
    navigate,
    normalizedQuery,
    onAction,
    openDrawer,
    openFreshKnowAnything,
    openRuntime,
    route?.search.sections,
    route?.title,
    routeKey,
    setPageState,
    urgentApprovals,
  ]);

  const flatItems = sections.flatMap((section) => section.items);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="w-full max-w-3xl">
          <InputGroup
            className="h-11 border-border/70 bg-background shadow-none"
            onFocusCapture={() => setOpen(true)}
          >
            <InputGroupAddon>
              <InputGroupText>
                <MagnifyingGlassIcon />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              placeholder={route?.search.placeholder ?? "Search"}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  setOpen(false);
                  return;
                }

                if (event.key === "Enter" && flatItems[0]) {
                  event.preventDefault();
                  flatItems[0].onSelect();
                  setOpen(false);
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText className="rounded-lg border border-border/70 bg-secondary/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                {route?.title ?? "Workspace"}
              </InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(var(--radix-popover-trigger-width),48rem)] border-border/70 p-0 shadow-xl"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <Command shouldFilter={false} className="rounded-xl bg-popover p-0">
          <CommandList className="max-h-[24rem] p-1">
            {sections.map((section, index) => (
              <div key={section.id}>
                <CommandGroup heading={section.label}>
                  {section.items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.id}
                      onSelect={() => {
                        item.onSelect();
                        setOpen(false);
                      }}
                      className="items-start gap-3 rounded-lg px-3 py-3"
                    >
                      <span className="mt-0.5 text-muted-foreground">{item.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="line-clamp-1 text-sm font-medium">{item.label}</span>
                          <Badge variant="outline" className="px-1.5 py-0 text-[10px] uppercase tracking-[0.1em]">
                            {item.kind}
                          </Badge>
                        </div>
                        {item.supportingText ? (
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{item.supportingText}</p>
                        ) : null}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {index < sections.length - 1 ? <CommandSeparator /> : null}
              </div>
            ))}
            {!sections.length ? (
              <CommandEmpty className="py-8 text-left">
                <p className="px-3 text-sm font-medium">No matches in {route?.title ?? "this workspace"}.</p>
                <p className="px-3 pt-1 text-xs text-muted-foreground">Try a person, artifact, thread subject, or action prompt.</p>
              </CommandEmpty>
            ) : null}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
