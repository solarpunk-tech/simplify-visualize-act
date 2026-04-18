import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ArrowUpIcon,
  BooksIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CaretRightIcon,
  ChatsIcon,
  EnvelopeSimpleIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  PaperclipIcon,
  PlusIcon,
  ShieldCheckIcon,
  SparkleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { PageContainer } from "@/components/page-container";
import { Drive } from "@/components/ui/svgs/drive";
import { Gmail } from "@/components/ui/svgs/gmail";
import { Salesforce } from "@/components/ui/svgs/salesforce";
import { Slack } from "@/components/ui/svgs/slack";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { contactCards, inboxThreads, meetings, projects, starterActions } from "@/lib/ubik-data";
import { cn } from "@/lib/utils";

type ChatSource =
  | "org_knowledge"
  | "gmail"
  | "zoho"
  | "salesforce"
  | "linear"
  | "slack"
  | "google_drive"
  | "outlook_drive";

type ChatMode = "ask" | "plan" | "research" | "model_council";

type ContextReference = {
  id: string;
  label: string;
  kind: "project" | "meeting" | "chat" | "contact";
  href?: string;
};

type ScheduledPromptDraft = {
  title: string;
  cadence: "daily" | "weekly" | "monthly";
  date: string;
  time: string;
  mode: ChatMode;
};

type PickerState =
  | {
      kind: "mention" | "skill";
      query: string;
      start: number;
      end: number;
    }
  | null;

type ContextGroupKey = "company" | "projects" | "meetings" | "chats" | "files" | "connectors";

type ContextGroupItem = {
  id: string;
  label: string;
  meta?: string;
  icon: ReactNode;
  onSelect: () => void;
};

type ConnectorItem = {
  key: ChatSource;
  label: string;
  icon: ReactNode;
};

const connectorItems: ConnectorItem[] = [
  { key: "gmail", label: "Gmail", icon: <Gmail className="size-4" /> },
  { key: "slack", label: "Slack", icon: <Slack className="size-4" /> },
  { key: "google_drive", label: "Google Drive", icon: <Drive className="size-4" /> },
  { key: "salesforce", label: "Salesforce", icon: <Salesforce className="size-4" /> },
];

const modeItems: { key: ChatMode; label: string }[] = [
  { key: "ask", label: "Ask" },
  { key: "plan", label: "Plan" },
  { key: "research", label: "Research" },
  { key: "model_council", label: "Model Council" },
];

const sourceLabels: Record<ChatSource, string> = {
  org_knowledge: "Company knowledge",
  gmail: "Gmail",
  zoho: "Zoho",
  salesforce: "Salesforce",
  linear: "Linear",
  slack: "Slack",
  google_drive: "Google Drive",
  outlook_drive: "Outlook Drive",
};

const attachmentSeeds = ["pricing-brief.html", "supplier-scorecard.pdf", "handoff-summary.md"];

const defaultSchedule: ScheduledPromptDraft = {
  title: "Recurring operator brief",
  cadence: "weekly",
  date: new Date().toISOString(),
  time: "09:00",
  mode: "plan",
};

const defaultExpandedGroups: Record<ContextGroupKey, boolean> = {
  company: true,
  projects: true,
  meetings: false,
  chats: false,
  files: false,
  connectors: false,
};

function replaceToken(text: string, start: number, end: number, replacement: string) {
  return `${text.slice(0, start)}${replacement}${text.slice(end)}`;
}

function formatScheduleLabel(schedule: ScheduledPromptDraft | null) {
  if (!schedule) return null;
  return `${schedule.cadence} · ${new Date(schedule.date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })} · ${schedule.time}`;
}

function resizeComposerTextarea(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = "0px";
  element.style.height = `${Math.min(Math.max(element.scrollHeight, 52), 136)}px`;
}

function matchesQuery(value: string, query: string) {
  return value.toLowerCase().includes(query.trim().toLowerCase());
}

function looksLikePlanPrompt(value: string) {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return false;

  return [
    "plan",
    "roadmap",
    "strategy",
    "steps",
    "next steps",
    "outline",
    "how should",
    "what should we do",
    "create a plan",
    "draft a plan",
  ].some((needle) => trimmed.includes(needle));
}

const starterCategoryIconMap: Record<string, ReactNode> = {
  All: <SparkleIcon className="size-3.5" />,
  "Project continuity": <FolderOpenIcon className="size-3.5" />,
  "Multi-app follow-up": <ChatsIcon className="size-3.5" />,
  "Approval packet": <ShieldCheckIcon className="size-3.5" />,
  "Meeting pre-read": <CalendarBlankIcon className="size-3.5" />,
  "Workflow diagnosis": <SparkleIcon className="size-3.5" />,
  "Connector-grounded research": <BooksIcon className="size-3.5" />,
};

export default function Index() {
  const { openDrawer, openRuntime } = useShellState();
  const [composer, setComposer] = useWorkbenchState("chat-composer", "");
  const [storedModeRaw, setStoredModeRaw] = useWorkbenchState<string>("chat-mode", "ask");
  const storedMode: ChatMode =
    storedModeRaw === "research" ||
    storedModeRaw === "model_council" ||
    storedModeRaw === "plan" ||
    storedModeRaw === "ask"
      ? storedModeRaw
      : "ask";
  const [isListening, setIsListening] = useWorkbenchState("chat-listening", false);
  const [sources, setSources] = useWorkbenchState<ChatSource[]>("chat-sources", ["org_knowledge"]);
  const [attachments, setAttachments] = useWorkbenchState<string[]>("chat-attachments", []);
  const [recentFiles, setRecentFiles] = useWorkbenchState<string[]>("chat-recent-files", attachmentSeeds);
  const [references, setReferences] = useWorkbenchState<ContextReference[]>("chat-context-references", []);
  const [scheduledPrompt, setScheduledPrompt] = useWorkbenchState<ScheduledPromptDraft | null>(
    "chat-scheduled-prompt",
    null,
  );
  const [picker, setPicker] = useState<PickerState>(null);
  const [contextQuery, setContextQuery] = useState("");
  const [expandedGroups, setExpandedGroups] =
    useState<Record<ContextGroupKey, boolean>>(defaultExpandedGroups);
  const [activeSuggestionCategory, setActiveSuggestionCategory] = useState("All");
  const [scheduleDraft, setScheduleDraft] = useState<ScheduledPromptDraft>(
    scheduledPrompt ?? defaultSchedule,
  );
  const [modeMenuOpen, setModeMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    resizeComposerTextarea(textareaRef.current);
  }, [composer]);

  const setStoredMode = (value: ChatMode) => {
    setStoredModeRaw(value);
  };

  const activatePlanMode = () => {
    setStoredMode("plan");
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  const syncPicker = (value: string) => {
    const caret = textareaRef.current?.selectionStart ?? value.length;
    const beforeCaret = value.slice(0, caret);
    const match = beforeCaret.match(/(?:^|\s)([@/])([^\s@/]*)$/);

    if (!match) {
      setPicker(null);
      return;
    }

    setPicker({
      kind: match[1] === "@" ? "mention" : "skill",
      query: match[2].toLowerCase(),
      start: caret - match[2].length - 1,
      end: caret,
    });
  };

  const toggleSource = (source: ChatSource, forceState?: boolean) => {
    const isEnabled = forceState ?? !sources.includes(source);
    const nextSources = isEnabled
      ? [...sources.filter((item) => item !== source), source]
      : sources.filter((item) => item !== source);
    setSources(nextSources);
  };

  const addAttachment = (file: string) => {
    if (!attachments.includes(file)) {
      setAttachments([...attachments, file]);
    }
    setRecentFiles([file, ...recentFiles.filter((item) => item !== file)].slice(0, 6));
  };

  const openLocalFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    files.forEach((file) => addAttachment(file.name));
    event.target.value = "";
  };

  const removeAttachment = (file: string) => {
    setAttachments(attachments.filter((item) => item !== file));
  };

  const addReference = (item: ContextReference) => {
    if (!references.some((reference) => reference.id === item.id)) {
      setReferences([...references, item]);
    }
  };

  const removeReference = (id: string) => {
    setReferences(references.filter((item) => item.id !== id));
  };

  const replaceComposerToken = (replacement: string) => {
    if (!picker) return;

    const nextComposer = replaceToken(composer, picker.start, picker.end, replacement);
    setComposer(nextComposer);
    setPicker(null);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      const nextCaret = picker.start + replacement.length;
      textareaRef.current?.setSelectionRange(nextCaret, nextCaret);
    });
  };

  const mentionGroups = useMemo(() => {
    const query = picker?.kind === "mention" ? picker.query : "";
    const matches = (value: string) => value.toLowerCase().includes(query);

    return {
      Projects: projects
        .filter((project) => matches(project.name))
        .slice(0, 4)
        .map((project) => ({
          id: `project-${project.id}`,
          label: project.name,
          shortcut: project.code,
          item: {
            id: `project-${project.id}`,
            label: project.name,
            kind: "project" as const,
            href: "/projects",
          },
        })),
      Meetings: meetings
        .filter((meeting) => matches(meeting.title))
        .slice(0, 4)
        .map((meeting) => ({
          id: `meeting-${meeting.id}`,
          label: meeting.title,
          shortcut: meeting.time,
          item: {
            id: `meeting-${meeting.id}`,
            label: meeting.title,
            kind: "meeting" as const,
            href: `/meetings/${meeting.id}`,
          },
        })),
      Chats: inboxThreads
        .filter((thread) => matches(thread.subject))
        .slice(0, 4)
        .map((thread) => ({
          id: `chat-${thread.id}`,
          label: thread.subject,
          shortcut: thread.company,
          item: {
            id: `chat-${thread.id}`,
            label: thread.subject,
            kind: "chat" as const,
            href: `/inbox/${thread.id}`,
          },
        })),
      Contacts: contactCards
        .filter((contact) => matches(contact.name))
        .slice(0, 4)
        .map((contact) => ({
          id: `contact-${contact.id}`,
          label: contact.name,
          shortcut: contact.company,
          item: {
            id: `contact-${contact.id}`,
            label: contact.name,
            kind: "contact" as const,
            href: "/meetings",
          },
        })),
    };
  }, [picker]);

  const skillSuggestions = useMemo(() => {
    const query = picker?.kind === "skill" ? picker.query : "";
    return starterActions
      .filter(
        (action) =>
          action.title.toLowerCase().includes(query) ||
          action.category.toLowerCase().includes(query),
      )
      .slice(0, 6);
  }, [picker]);

  const selectedContextItems = [
    ...sources
      .filter((source) => source !== "org_knowledge")
      .map((source) => ({
        id: source,
        label: sourceLabels[source],
        kind: "source" as const,
        source,
      })),
    ...attachments.map((file) => ({
      id: file,
      label: file,
      kind: "attachment" as const,
      file,
    })),
    ...references.map((reference) => ({
      id: reference.id,
      label: reference.label,
      kind: "reference" as const,
      reference,
    })),
  ];

  const categoryChips = useMemo(
    () => ["All", ...Array.from(new Set(starterActions.map((action) => action.category)))],
    [],
  );

  const visibleSuggestions = useMemo(() => {
    const filtered =
      activeSuggestionCategory === "All"
        ? starterActions
        : starterActions.filter((action) => action.category === activeSuggestionCategory);

    return filtered.slice(0, 5);
  }, [activeSuggestionCategory]);

  const showPlanNudge = useMemo(
    () => storedMode === "ask" && looksLikePlanPrompt(composer),
    [composer, storedMode],
  );

  const companyKnowledgeEnabled = sources.includes("org_knowledge");
  const runtimeContext = [
    ...(companyKnowledgeEnabled ? ["Company knowledge"] : []),
    ...sources.filter((source) => source !== "org_knowledge").map((source) => sourceLabels[source]),
    ...references.map((reference) => reference.label),
    ...attachments,
  ];

  const contextGroups = useMemo(() => {
    const query = contextQuery.trim().toLowerCase();

    const groups: Record<
      ContextGroupKey,
      {
        title: string;
        items: ContextGroupItem[];
      }
    > = {
      company: {
        title: "Company knowledge",
        items: [
          {
            id: "company-knowledge",
            label: "Company knowledge",
            meta: companyKnowledgeEnabled
              ? "On for internal docs, memory, and operating context"
              : "Off until you explicitly include internal knowledge",
            icon: <BooksIcon />,
            onSelect: () => toggleSource("org_knowledge"),
          },
        ],
      },
      projects: {
        title: "Projects",
        items: projects
          .filter((project) => !query || matchesQuery(project.name, query) || matchesQuery(project.code, query))
          .slice(0, 6)
          .map((project) => ({
            id: `project-${project.id}`,
            label: project.name,
            meta: project.code,
            icon: <FolderOpenIcon />,
            onSelect: () =>
              addReference({
                id: `project-${project.id}`,
                label: project.name,
                kind: "project",
                href: "/projects",
              }),
          })),
      },
      meetings: {
        title: "Meetings",
        items: meetings
          .filter((meeting) => !query || matchesQuery(meeting.title, query) || matchesQuery(meeting.owner, query))
          .slice(0, 6)
          .map((meeting) => ({
            id: `meeting-${meeting.id}`,
            label: meeting.title,
            meta: meeting.time,
            icon: <CalendarBlankIcon />,
            onSelect: () =>
              addReference({
                id: `meeting-${meeting.id}`,
                label: meeting.title,
                kind: "meeting",
                href: `/meetings/${meeting.id}`,
              }),
          })),
      },
      chats: {
        title: "Chats",
        items: inboxThreads
          .filter(
            (thread) =>
              !query || matchesQuery(thread.subject, query) || matchesQuery(thread.company, query),
          )
          .slice(0, 6)
          .map((thread) => ({
            id: `chat-${thread.id}`,
            label: thread.subject,
            meta: thread.company,
            icon: <ChatsIcon />,
            onSelect: () =>
              addReference({
                id: `chat-${thread.id}`,
                label: thread.subject,
                kind: "chat",
                href: `/inbox/${thread.id}`,
              }),
          })),
      },
      files: {
        title: "Files",
        items: recentFiles
          .filter((file) => !query || matchesQuery(file, query))
          .slice(0, 6)
          .map((file) => ({
            id: file,
            label: file,
            icon: <PaperclipIcon />,
            onSelect: () => addAttachment(file),
          })),
      },
      connectors: {
        title: "Connectors",
        items: connectorItems
          .filter((item) => !query || matchesQuery(item.label, query))
          .map((item) => ({
            id: item.key,
            label: item.label,
            meta: sources.includes(item.key) ? "Connected" : "Connect",
            icon: item.icon,
            onSelect: () => toggleSource(item.key),
          })),
      },
    };

    return groups;
  }, [companyKnowledgeEnabled, contextQuery, recentFiles, sources]);

  const matchingGroupKeys = useMemo(() => {
    return (Object.keys(contextGroups) as ContextGroupKey[]).filter(
      (key) => contextGroups[key].items.length > 0,
    );
  }, [contextGroups]);

  const renderGroupOpen = (key: ContextGroupKey) => {
    if (contextQuery.trim()) return matchingGroupKeys.includes(key);
    return expandedGroups[key];
  };

  const runPrompt = () => {
    openRuntime({
      title: "Know Anything runtime",
      status: "Ready",
      lines: [
        `> Mode: ${storedMode.toUpperCase()}`,
        `> Context: ${runtimeContext.join(", ") || "No linked context selected"}`,
        scheduledPrompt ? `> Scheduled: ${formatScheduleLabel(scheduledPrompt)}` : "> Scheduled: None",
        "",
        composer || "Ask anything about operations, projects, or follow-through.",
      ],
      artifactLabel: "Prepared answer surface",
    });

    openDrawer({
      title: "Prepared answer",
      eyebrow: "Know Anything",
      description: "Composer context prepared from selected knowledge sources, linked work, and attached artifacts.",
      metadata: [
        { label: "Mode", value: storedMode.toUpperCase() },
        { label: "Context count", value: `${runtimeContext.length}` },
        { label: "Schedule", value: formatScheduleLabel(scheduledPrompt) ?? "Not scheduled" },
      ],
      actions: scheduledPrompt ? ["Background agent ready"] : ["Prompt ready to send"],
    });
  };

  return (
    <div className="px-4 py-8 lg:px-8">
      <PageContainer className="flex flex-col items-center gap-6">
        <input
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileSelection}
          type="file"
        />

        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3 pt-4">
          <div className="flex justify-end">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" type="button">
                  Share
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading font-medium">Share</h3>
                    <p className="text-sm text-muted-foreground">Choose who can access this thread.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button className="justify-start" type="button">Only me</Button>
                    <Button variant="outline" className="justify-start" type="button">Team</Button>
                    <Button variant="outline" className="justify-start" type="button">Copy link</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="section-label">Know Anything</p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
              Back at it, Hemanth
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Ask across projects, meetings, chats, and linked work without losing the thread of action.
            </p>
          </div>
        </div>

        <div className="w-full max-w-4xl border border-border bg-background shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <div className="relative px-5 pt-5">
            <Textarea
              ref={textareaRef}
              className="min-h-[3.25rem] max-h-[8.5rem] resize-none border-0 bg-transparent px-0 py-0 text-[15px] leading-6 shadow-none focus-visible:ring-0"
              onChange={(event) => {
                setComposer(event.target.value);
                syncPicker(event.target.value);
                resizeComposerTextarea(event.target);
              }}
              onClick={(event) => syncPicker(event.currentTarget.value)}
              onKeyUp={(event) => syncPicker(event.currentTarget.value)}
              onKeyDown={(event) => {
                if (event.key === "Tab" && event.shiftKey && storedMode === "ask") {
                  event.preventDefault();
                  activatePlanMode();
                }
              }}
              placeholder={
                isListening
                  ? "Listening for a voice note..."
                  : "Ask anything about operations, projects, or follow-through."
              }
              value={composer}
            />

            {picker ? (
              <div className="absolute left-0 top-full z-20 mt-3 w-full max-w-xl border border-border bg-background shadow-xl">
                <Command className="rounded-none border-0 bg-background p-0">
                  <CommandList>
                    {picker.kind === "mention" ? (
                      <>
                        {Object.entries(mentionGroups).map(([group, items]) =>
                          items.length ? (
                            <CommandGroup key={group} heading={group}>
                              {items.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  value={`${group}-${item.label}`}
                                  onSelect={() => {
                                    addReference(item.item);
                                    replaceComposerToken(`@${item.label} `);
                                  }}
                                >
                                  <span>{item.label}</span>
                                  <CommandShortcut>{item.shortcut}</CommandShortcut>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          ) : null,
                        )}
                      </>
                    ) : (
                      <CommandGroup heading="Skills">
                        {skillSuggestions.map((action) => (
                          <CommandItem
                            key={action.id}
                            value={`${action.title}-${action.category}`}
                            onSelect={() => replaceComposerToken(`${action.seedPrompt} `)}
                          >
                            <span>{action.title}</span>
                            <CommandShortcut>{action.category}</CommandShortcut>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    <CommandEmpty>No matching suggestions.</CommandEmpty>
                  </CommandList>
                </Command>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 px-4 pb-4 pt-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-3 text-sm">
                  <button
                    className={cn(
                      "inline-flex items-center gap-2 border-0 bg-transparent px-0 py-1 text-sm font-medium transition-colors",
                      companyKnowledgeEnabled ? "text-primary" : "text-foreground hover:text-primary",
                    )}
                    onClick={() => toggleSource("org_knowledge")}
                    type="button"
                  >
                    <BooksIcon className="size-4" />
                    Company knowledge
                  </button>
                  <Switch
                    aria-label="Toggle company knowledge"
                    checked={companyKnowledgeEnabled}
                    onCheckedChange={(checked) => toggleSource("org_knowledge", checked)}
                    size="sm"
                  />
                </div>

                <button
                  className="inline-flex items-center gap-2 border-0 bg-transparent px-0 py-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                  onClick={openLocalFiles}
                  type="button"
                >
                  <PaperclipIcon className="size-4" />
                  Attach file
                </button>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Add context"
                      className="inline-flex size-8 items-center justify-center border-0 bg-transparent text-foreground transition-colors hover:text-primary"
                      type="button"
                    >
                      <PlusIcon className="size-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    collisionPadding={16}
                    className="w-[min(28rem,calc(100vw-2rem))] rounded-none border border-border bg-background p-0 shadow-xl"
                  >
                    <div className="flex flex-col gap-0">
                      <div className="border-b border-border px-3 py-3">
                        <div className="relative">
                          <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            className="h-9 rounded-none border-border bg-background pl-9 shadow-none focus-visible:ring-0"
                            onChange={(event) => setContextQuery(event.target.value)}
                            placeholder="Search files, projects, meetings, chats, and connectors"
                            value={contextQuery}
                          />
                        </div>
                      </div>

                      <div className="max-h-[min(28rem,calc(100vh-10rem))] overflow-y-auto px-3 py-3">
                        <div className="flex flex-col gap-3">
                          {(Object.keys(contextGroups) as ContextGroupKey[]).map((groupKey) => {
                            const group = contextGroups[groupKey];
                            const isOpen = renderGroupOpen(groupKey);
                            const hasItems = group.items.length > 0;

                            if (!hasItems && contextQuery.trim()) return null;

                            return (
                              <div key={groupKey} className="flex flex-col gap-2">
                                <button
                                  className="flex items-center justify-between border-b border-border pb-2 text-left"
                                  onClick={() =>
                                    setExpandedGroups((current) => ({
                                      ...current,
                                      [groupKey]: !current[groupKey],
                                    }))
                                  }
                                  type="button"
                                >
                                  <span className="section-label text-foreground">{group.title}</span>
                                  <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                    {hasItems ? `${group.items.length} items` : "Empty"}
                                    {isOpen ? (
                                      <CaretDownIcon className="size-3.5" />
                                    ) : (
                                      <CaretRightIcon className="size-3.5" />
                                    )}
                                  </span>
                                </button>

                                {isOpen ? (
                                  <div className="flex flex-col gap-1">
                                    {hasItems ? (
                                      group.items.map((item) => {
                                        const isConnector =
                                          groupKey === "connectors" &&
                                          connectorItems.some((connector) => connector.key === item.id);

                                        return (
                                          <button
                                            key={item.id}
                                            className="flex items-center justify-between gap-3 border border-transparent px-2 py-2 text-left transition-colors hover:border-border hover:bg-primary/5"
                                            onClick={item.onSelect}
                                            type="button"
                                          >
                                            <span className="flex min-w-0 items-center gap-3">
                                              <span className="inline-flex size-8 items-center justify-center border border-border bg-background text-foreground">
                                                {item.icon}
                                              </span>
                                              <span className="min-w-0">
                                                <span className="block truncate text-sm font-medium text-foreground">
                                                  {item.label}
                                                </span>
                                                {item.meta ? (
                                                  <span className="block truncate text-xs text-muted-foreground">
                                                    {item.meta}
                                                  </span>
                                                ) : null}
                                              </span>
                                            </span>
                                            {isConnector ? (
                                              <span
                                                className={cn(
                                                  "inline-flex items-center border px-2 py-1 text-[11px] font-medium",
                                                  sources.includes(item.id as ChatSource)
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background text-foreground",
                                                )}
                                              >
                                                {sources.includes(item.id as ChatSource) ? "On" : "Add"}
                                              </span>
                                            ) : (
                                              <CaretRightIcon className="size-3.5 text-muted-foreground" />
                                            )}
                                          </button>
                                        );
                                      })
                                    ) : (
                                      <div className="px-2 py-2 text-xs text-muted-foreground">
                                        No matching items.
                                      </div>
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Popover open={modeMenuOpen} onOpenChange={setModeMenuOpen}>
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Reasoning mode"
                      className="inline-flex items-center gap-1 border-0 bg-transparent px-1 py-1 text-sm font-medium text-foreground transition-colors hover:text-primary"
                      type="button"
                    >
                      <span
                        className={cn(
                          "transition-colors",
                          storedMode === "ask" ? "font-semibold text-primary" : "text-foreground",
                        )}
                      >
                        {modeItems.find((item) => item.key === storedMode)?.label ?? "Ask"}
                      </span>
                      <CaretDownIcon className="size-3.5 text-muted-foreground" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    className="w-44 rounded-none border border-border bg-background p-2 shadow-lg"
                  >
                    <div className="flex flex-col">
                      {modeItems.map((item, index) => (
                        <div key={item.key} className="flex flex-col">
                          <button
                            className="flex items-center justify-between px-2 py-2 text-left text-sm transition-colors hover:text-primary"
                            onClick={() => {
                              setStoredMode(item.key);
                              setModeMenuOpen(false);
                              requestAnimationFrame(() => textareaRef.current?.focus());
                            }}
                            type="button"
                          >
                            <span
                              className={cn(
                                storedMode === item.key
                                  ? "font-semibold text-primary"
                                  : "font-medium text-foreground",
                              )}
                            >
                              {item.label}
                            </span>
                            {storedMode === item.key ? (
                              <span className="text-primary">✓</span>
                            ) : null}
                          </button>
                          {index < modeItems.length - 1 ? <Separator /> : null}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                <button
                  aria-label={isListening ? "Stop listening" : "Start listening"}
                  className={cn(
                    "inline-flex size-8 items-center justify-center border-0 bg-transparent transition-colors",
                    isListening ? "text-primary" : "text-foreground hover:text-primary",
                  )}
                  onClick={() => {
                    const next = !isListening;
                    setIsListening(next);
                    if (next) {
                      const prefix = composer.trim().length
                        ? `${composer.trimEnd()}\n`
                        : "";
                      const transcriptStub = "Voice note: summarize what moved, what is blocked, and what I should do next.";
                      setComposer(`${prefix}${transcriptStub}`);
                      requestAnimationFrame(() => {
                        textareaRef.current?.focus();
                        const position = prefix.length + transcriptStub.length;
                        textareaRef.current?.setSelectionRange(position, position);
                      });
                    }
                  }}
                  type="button"
                >
                  <MicrophoneIcon className="size-4" />
                </button>

                <Popover
                  onOpenChange={(open) =>
                    open &&
                    setScheduleDraft({
                      ...(scheduledPrompt ?? defaultSchedule),
                      mode: storedMode,
                    })
                  }
                >
                  <PopoverTrigger asChild>
                    <button
                      aria-label="Schedule"
                      className="inline-flex size-8 items-center justify-center border-0 bg-transparent text-foreground transition-colors hover:text-primary"
                      type="button"
                    >
                      <CalendarBlankIcon className="size-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    collisionPadding={16}
                    sideOffset={8}
                    className="w-[min(21rem,calc(100vw-2rem))] max-h-[min(36rem,calc(100vh-2rem))] overflow-y-auto rounded-none border border-border bg-background p-4 shadow-xl"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-foreground">Repeatable task</p>
                        <p className="text-xs leading-5 text-muted-foreground">
                          Turn this prompt into a background agent or recurring follow-through.
                        </p>
                      </div>

                      <Input
                        className="rounded-none border-border bg-background"
                        onChange={(event) =>
                          setScheduleDraft({ ...scheduleDraft, title: event.target.value })
                        }
                        value={scheduleDraft.title}
                      />

                      <div className="grid grid-cols-3 gap-2">
                        {(["daily", "weekly", "monthly"] as const).map((cadence) => (
                          <button
                            key={cadence}
                            className={cn(
                              "border px-3 py-2 text-sm font-medium capitalize transition-colors",
                              scheduleDraft.cadence === cadence
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background text-foreground hover:bg-primary/5",
                            )}
                            onClick={() => setScheduleDraft({ ...scheduleDraft, cadence })}
                            type="button"
                          >
                            {cadence}
                          </button>
                        ))}
                      </div>

                      <div className="overflow-x-auto border border-border bg-background p-2">
                        <Calendar
                          className="w-full p-0"
                          classNames={{ root: "w-full" }}
                          mode="single"
                          onSelect={(date) =>
                            date && setScheduleDraft({ ...scheduleDraft, date: date.toISOString() })
                          }
                          selected={new Date(scheduleDraft.date)}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <Input
                          className="rounded-none border-border bg-background"
                          onChange={(event) =>
                            setScheduleDraft({ ...scheduleDraft, time: event.target.value })
                          }
                          type="time"
                          value={scheduleDraft.time}
                        />
                        <div className="border border-border px-3 py-2 text-xs text-muted-foreground">
                          Runs in{" "}
                          <span className="font-medium text-foreground">
                            {modeItems.find((item) => item.key === storedMode)?.label ?? "Plan"}
                          </span>{" "}
                          mode.
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => {
                          const nextSchedule = { ...scheduleDraft, mode: storedMode };
                          setScheduledPrompt(nextSchedule);
                          openDrawer({
                            title: "Background agent scheduled",
                            eyebrow: "Know Anything",
                            description:
                              "The recurring task is prepared and can be surfaced later inside Tasks and Workflows.",
                            metadata: [
                              { label: "Title", value: nextSchedule.title },
                              { label: "Cadence", value: nextSchedule.cadence },
                              {
                                label: "Mode",
                                value:
                                  modeItems.find((item) => item.key === storedMode)?.label ?? "Plan",
                              },
                            ],
                          });
                        }}
                        type="button"
                      >
                        <SparkleIcon data-icon="inline-start" />
                        Confirm schedule
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <button
                  aria-label="Send"
                  className="inline-flex size-9 items-center justify-center bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
                  onClick={runPrompt}
                  type="button"
                >
                  <ArrowUpIcon className="size-4" />
                </button>
              </div>
            </div>

            {showPlanNudge ? (
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                <button
                  className="inline-flex items-center gap-2 border border-border bg-background px-2.5 py-1 font-medium text-foreground transition-colors hover:text-primary"
                  onClick={activatePlanMode}
                  type="button"
                >
                  <SparkleIcon className="size-3.5 text-primary" />
                  Create a plan
                  <span className="text-[11px] text-muted-foreground">Shift + Tab</span>
                </button>
                <button
                  className="text-muted-foreground transition-colors hover:text-primary"
                  onClick={activatePlanMode}
                  type="button"
                >
                  Use plan mode
                </button>
              </div>
            ) : null}

            {selectedContextItems.length || scheduledPrompt ? (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedContextItems.map((item) => (
                  <div
                    key={item.id}
                    className="inline-flex items-center gap-2 border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground"
                  >
                    <span>{item.label}</span>
                    <button
                      aria-label={`Remove ${item.label}`}
                      className="inline-flex size-4 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => {
                        if (item.kind === "attachment") {
                          removeAttachment(item.file);
                          return;
                        }
                        if (item.kind === "reference") {
                          removeReference(item.reference.id);
                          return;
                        }
                        setSources(sources.filter((source) => source !== item.source));
                      }}
                      type="button"
                    >
                      <XIcon className="size-3" />
                    </button>
                  </div>
                ))}
                {scheduledPrompt ? (
                  <div className="inline-flex items-center gap-2 border border-primary bg-primary text-[11px] font-medium text-primary-foreground px-2 py-1">
                    <CalendarBlankIcon className="size-3.5" />
                    {formatScheduleLabel(scheduledPrompt)}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="w-full max-w-4xl border border-border bg-background shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Suggested asks</p>
              <button
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setActiveSuggestionCategory("All")}
                type="button"
              >
                Reset
              </button>
            </div>

            <div className="-mx-1 overflow-x-auto px-1">
              <div className="flex min-w-max items-center gap-1.5 whitespace-nowrap">
                {categoryChips.map((category) => (
                  <button
                    key={category}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      activeSuggestionCategory === category
                        ? "bg-primary text-primary-foreground"
                        : "bg-transparent text-muted-foreground hover:text-foreground",
                    )}
                    onClick={() => setActiveSuggestionCategory(category)}
                    type="button"
                  >
                    {starterCategoryIconMap[category] ?? <SparkleIcon className="size-3.5" />}
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col">
              {visibleSuggestions.map((action, index) => (
                <button
                  key={action.id}
                  className={cn(
                    "flex items-start justify-between gap-4 px-0 py-3 text-left transition-colors hover:text-primary",
                    index > 0 ? "border-t border-border" : "",
                  )}
                  onClick={() => setComposer(action.seedPrompt)}
                  type="button"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{action.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                      {action.description}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{action.category}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
