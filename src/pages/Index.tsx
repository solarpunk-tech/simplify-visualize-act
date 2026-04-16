import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  ArrowUpIcon,
  BooksIcon,
  BrainIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  ChatsIcon,
  EnvelopeSimpleIcon,
  FolderOpenIcon,
  MicrophoneIcon,
  PaperclipIcon,
  PlusIcon,
  SparkleIcon,
  UsersThreeIcon,
  XIcon,
} from "@phosphor-icons/react";
import { PageContainer } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
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

type ChatMode = "plan" | "research" | "model_council";

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

const connectorItems: { key: ChatSource; label: string; icon: ReactNode }[] = [
  { key: "gmail", label: "Gmail", icon: <EnvelopeSimpleIcon /> },
  { key: "slack", label: "Slack", icon: <ChatsIcon /> },
  { key: "google_drive", label: "Drive", icon: <FolderOpenIcon /> },
  { key: "salesforce", label: "Salesforce", icon: <UsersThreeIcon /> },
];

const modeItems: { key: ChatMode; label: string; icon: ReactNode }[] = [
  { key: "plan", label: "Plan", icon: <CheckCircleIcon data-icon="inline-start" /> },
  { key: "research", label: "Research", icon: <BrainIcon data-icon="inline-start" /> },
  { key: "model_council", label: "Model Council", icon: <SparkleIcon data-icon="inline-start" /> },
];

const sourceLabels: Record<ChatSource, string> = {
  org_knowledge: "Organization Knowledge",
  gmail: "Gmail",
  zoho: "Zoho",
  salesforce: "Salesforce",
  linear: "Linear",
  slack: "Slack",
  google_drive: "Google Drive",
  outlook_drive: "Outlook Drive",
};

const attachmentSeeds = ["pricing-brief.html", "supplier-scorecard.pdf", "handoff-summary.md"];

const starterIcons = {
  project: FolderOpenIcon,
  "follow-up": EnvelopeSimpleIcon,
  approval: CheckCircleIcon,
  meeting: CalendarBlankIcon,
  workflow: SparkleIcon,
  research: BrainIcon,
} as const;

const defaultSchedule: ScheduledPromptDraft = {
  title: "Recurring operator brief",
  cadence: "weekly",
  date: new Date().toISOString(),
  time: "09:00",
  mode: "plan",
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
  element.style.height = `${Math.min(Math.max(element.scrollHeight, 72), 188)}px`;
}

export default function Index() {
  const { openDrawer, openRuntime } = useShellState();
  const [composer, setComposer] = useWorkbenchState("chat-composer", "");
  const [storedModeRaw, setStoredModeRaw] = useWorkbenchState<string>("chat-mode", "plan");
  const storedMode: ChatMode =
    storedModeRaw === "research" || storedModeRaw === "model_council" || storedModeRaw === "plan"
      ? storedModeRaw
      : "plan";
  const [isListening, setIsListening] = useWorkbenchState("chat-listening", false);
  const [sources, setSources] = useWorkbenchState<ChatSource[]>("chat-sources", ["org_knowledge"]);
  const [attachments, setAttachments] = useWorkbenchState<string[]>("chat-attachments", []);
  const [recentFiles, setRecentFiles] = useWorkbenchState<string[]>("chat-recent-files", attachmentSeeds);
  const [references, setReferences] = useWorkbenchState<ContextReference[]>("chat-context-references", []);
  const [scheduledPrompt, setScheduledPrompt] = useWorkbenchState<ScheduledPromptDraft | null>(
    "chat-scheduled-prompt",
    null,
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [picker, setPicker] = useState<PickerState>(null);
  const [scheduleDraft, setScheduleDraft] = useState<ScheduledPromptDraft>(scheduledPrompt ?? defaultSchedule);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    resizeComposerTextarea(textareaRef.current);
  }, [composer]);

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

  const toggleSource = (source: ChatSource) => {
    const nextSources = sources.includes(source)
      ? sources.filter((item) => item !== source)
      : [...sources, source];
    setSources(nextSources);
  };

  const addAttachment = (file: string) => {
    if (!attachments.includes(file)) {
      setAttachments([...attachments, file]);
    }
    setRecentFiles([file, ...recentFiles.filter((item) => item !== file)].slice(0, 6));
    setMenuOpen(false);
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
    setMenuOpen(false);
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
      Projects: projects.filter((project) => matches(project.name)).slice(0, 4).map((project) => ({
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
      Meetings: meetings.filter((meeting) => matches(meeting.title)).slice(0, 4).map((meeting) => ({
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
      Chats: inboxThreads.filter((thread) => matches(thread.subject)).slice(0, 4).map((thread) => ({
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
      Contacts: contactCards.filter((contact) => matches(contact.name)).slice(0, 4).map((contact) => ({
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

  const runPrompt = () => {
    const selectedSources = [
      "Organization Knowledge",
      ...sources.filter((source) => source !== "org_knowledge").map((source) => sourceLabels[source]),
      ...references.map((reference) => reference.label),
      ...attachments,
    ];

    openRuntime({
      title: "Know Anything runtime",
      status: "Ready",
      lines: [
        `> Mode: ${storedMode.toUpperCase()}`,
        `> Context: ${selectedSources.join(", ") || "Organization Knowledge"}`,
        scheduledPrompt ? `> Scheduled: ${formatScheduleLabel(scheduledPrompt)}` : "> Scheduled: None",
        "",
        composer || "Start with an operator task, a thread to continue, or a decision that needs context.",
      ],
      artifactLabel: "Prepared answer surface",
    });

    openDrawer({
      title: "Prepared answer",
      eyebrow: "Know Anything",
      description: "Composer context prepared from operator knowledge, linked work, and selected sources.",
      metadata: [
        { label: "Mode", value: storedMode.toUpperCase() },
        { label: "Context count", value: `${selectedContextItems.length + 1}` },
        { label: "Schedule", value: formatScheduleLabel(scheduledPrompt) ?? "Not scheduled" },
      ],
      actions: scheduledPrompt ? ["Background agent ready"] : ["Prompt ready to send"],
    });
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-6">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-2 pt-2 text-center">
          <p className="section-label">Know Anything</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
            Back at it, Hemanth
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Ask across projects, meetings, chats, and linked work.
          </p>
        </div>

        <Card size="sm" className="surface-card mx-auto w-full max-w-4xl overflow-hidden">
          <CardContent className="py-5">
            <input
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleFileSelection}
              type="file"
            />
            <div className="border border-border/70 bg-background shadow-sm">
              <div className="relative px-4 pt-4">
                <Textarea
                  ref={textareaRef}
                  className="min-h-[3.5rem] max-h-[10rem] resize-none border-0 bg-transparent px-0 py-0 text-[15px] leading-6 shadow-none focus-visible:ring-0"
                  onChange={(event) => {
                    setComposer(event.target.value);
                    syncPicker(event.target.value);
                    resizeComposerTextarea(event.target);
                  }}
                  onClick={(event) => syncPicker(event.currentTarget.value)}
                  onKeyUp={(event) => syncPicker(event.currentTarget.value)}
                  placeholder={isListening ? "Listening for a voice note..." : "Ask anything about operations, projects, or follow-through."}
                  value={composer}
                />

                {picker ? (
                  <div className="absolute left-0 top-full z-20 mt-3 w-full max-w-xl border border-border/70 bg-popover shadow-lg">
                    <Command className="rounded-none border-0 bg-popover p-0">
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

              <div className="border-t border-border/70 px-3 py-3">
                <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex flex-wrap items-center gap-2">
                    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                      <PopoverTrigger asChild>
                        <Button aria-label="Add context" size="sm" type="button" variant="outline" className="h-8 px-3">
                          <PlusIcon data-icon="inline-start" />
                          Add context
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="start" className="w-[26rem] gap-4 p-4">
                        <PopoverHeader>
                          <PopoverTitle>Add source context</PopoverTitle>
                          <PopoverDescription>
                            Pull in files, projects, meetings, chats, and connected apps before sending the prompt.
                          </PopoverDescription>
                        </PopoverHeader>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <p className="section-label">Recent files</p>
                            <div className="flex flex-wrap gap-2">
                              {recentFiles.map((file) => (
                                <Button key={file} onClick={() => addAttachment(file)} size="sm" type="button" variant="outline">
                                  <PaperclipIcon data-icon="inline-start" />
                                  {file}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="section-label">Projects</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {projects.slice(0, 4).map((project) => (
                                <Button
                                  key={project.id}
                                  onClick={() => addReference({ id: `project-${project.id}`, label: project.name, kind: "project", href: "/projects" })}
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                >
                                  <FolderOpenIcon data-icon="inline-start" />
                                  {project.name}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="section-label">Meetings</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {meetings.slice(0, 4).map((meeting) => (
                                <Button
                                  key={meeting.id}
                                  onClick={() => addReference({ id: `meeting-${meeting.id}`, label: meeting.title, kind: "meeting", href: `/meetings/${meeting.id}` })}
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                >
                                  <CalendarBlankIcon data-icon="inline-start" />
                                  {meeting.title}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="section-label">Chats</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {inboxThreads.slice(0, 4).map((thread) => (
                                <Button
                                  key={thread.id}
                                  onClick={() => addReference({ id: `chat-${thread.id}`, label: thread.subject, kind: "chat", href: `/inbox/${thread.id}` })}
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                >
                                  <ChatsIcon data-icon="inline-start" />
                                  {thread.subject}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <p className="section-label">Connected apps</p>
                            <div className="grid gap-2 sm:grid-cols-2">
                              {connectorItems.map((item) => (
                                <Button
                                  key={item.key}
                                  onClick={() => toggleSource(item.key)}
                                  size="sm"
                                  type="button"
                                  variant={sources.includes(item.key) ? "default" : "outline"}
                                >
                                  {item.icon}
                                  {item.label}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button onClick={openLocalFiles} size="sm" type="button" variant="outline" className="h-8 px-3">
                      <PaperclipIcon data-icon="inline-start" />
                      Attach file
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={storedMode} onValueChange={(value) => setStoredMode(value as ChatMode)}>
                      <SelectTrigger
                        size="sm"
                        className="h-8 rounded-none border-border/70 bg-background px-2.5 text-xs text-foreground"
                      >
                        {modeItems.find((item) => item.key === storedMode)?.icon}
                        <SelectValue placeholder="Mode" />
                      </SelectTrigger>
                      <SelectContent className="rounded-none">
                        {modeItems.map((item) => (
                          <SelectItem key={item.key} value={item.key}>
                            <span className="flex items-center gap-2">
                              {item.icon}
                              {item.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      type="button"
                      variant={isListening ? "default" : "outline"}
                      className="size-8 rounded-none border-border/70 px-0"
                      aria-label={isListening ? "Stop listening" : "Start listening"}
                      onClick={() => {
                        const next = !isListening;
                        setIsListening(next);
                        if (next) {
                          openDrawer({
                            title: "Listening mode",
                            eyebrow: "Know Anything",
                            description: "Voice capture is ready. Speak your operator note, then convert it into a prompt or follow-through task.",
                            actions: ["Voice note standby"],
                          });
                        }
                      }}
                    >
                      <MicrophoneIcon />
                    </Button>

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
                        <Button size="sm" type="button" variant="outline" className="h-8 px-3">
                          <CalendarBlankIcon data-icon="inline-start" />
                          Schedule
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[22rem] gap-4 p-4">
                        <PopoverHeader>
                          <PopoverTitle>Repeatable task</PopoverTitle>
                          <PopoverDescription>Turn this prompt into a background agent or recurring operator follow-through.</PopoverDescription>
                        </PopoverHeader>

                        <div className="space-y-4">
                          <Input
                            value={scheduleDraft.title}
                            onChange={(event) => setScheduleDraft({ ...scheduleDraft, title: event.target.value })}
                          />

                          <ToggleGroup
                            type="single"
                            value={scheduleDraft.cadence}
                            onValueChange={(value) => value && setScheduleDraft({ ...scheduleDraft, cadence: value as ScheduledPromptDraft["cadence"] })}
                            className="flex w-full justify-start border border-border/70 bg-muted/60 p-1"
                          >
                            <ToggleGroupItem value="daily" variant="outline">Daily</ToggleGroupItem>
                            <ToggleGroupItem value="weekly" variant="outline">Weekly</ToggleGroupItem>
                            <ToggleGroupItem value="monthly" variant="outline">Monthly</ToggleGroupItem>
                          </ToggleGroup>

                          <div className="border border-border/70 bg-background p-2">
                            <Calendar
                              mode="single"
                              selected={new Date(scheduleDraft.date)}
                              onSelect={(date) => date && setScheduleDraft({ ...scheduleDraft, date: date.toISOString() })}
                            />
                          </div>

                          <div className="space-y-3">
                            <Input
                              type="time"
                              value={scheduleDraft.time}
                              onChange={(event) => setScheduleDraft({ ...scheduleDraft, time: event.target.value })}
                            />
                            <div className="border border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                              Runs in <span className="font-medium text-foreground">{modeItems.find((item) => item.key === storedMode)?.label ?? "Plan"}</span> mode.
                            </div>
                          </div>

                          <Button
                            className="w-full"
                            type="button"
                            onClick={() => {
                              const nextSchedule = { ...scheduleDraft, mode: storedMode };
                              setScheduledPrompt(nextSchedule);
                              openDrawer({
                                title: "Background agent scheduled",
                                eyebrow: "Know Anything",
                                description: "The recurring task is prepared and can be surfaced later inside Tasks and Workflows.",
                                metadata: [
                                  { label: "Title", value: nextSchedule.title },
                                  { label: "Cadence", value: nextSchedule.cadence },
                                  { label: "Mode", value: modeItems.find((item) => item.key === storedMode)?.label ?? "Plan" },
                                ],
                              });
                            }}
                          >
                            <SparkleIcon data-icon="inline-start" />
                            Confirm schedule
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Button size="sm" type="button" onClick={runPrompt} className="h-8 px-3">
                      <ArrowUpIcon data-icon="inline-start" />
                      Send
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {selectedContextItems.map((item) => (
                    <Badge key={item.id} className="gap-2 px-2.5 py-1 text-[11px] font-medium" variant="secondary">
                      <span>{item.label}</span>
                      <button
                        aria-label={`Remove ${item.label}`}
                        className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
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
                    </Badge>
                  ))}
                  {scheduledPrompt ? (
                    <Badge variant="outline" className="gap-1.5 px-2.5 py-1 text-[11px]">
                      <CalendarBlankIcon className="size-3.5" />
                      {formatScheduleLabel(scheduledPrompt)}
                    </Badge>
                  ) : null}
                  <Badge variant="outline" className="px-2.5 py-1 text-[11px]">
                    <BooksIcon data-icon="inline-start" />
                    Organization Knowledge
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card size="sm" className="surface-card mx-auto w-full max-w-4xl">
          <CardContent className="py-4">
            <div className="flex flex-col gap-3">
              <p className="section-label">Prompt starters</p>
              <div className="flex flex-wrap gap-2">
                {starterActions.map((action) => {
                  const Icon = starterIcons[action.icon];

                  return (
                    <Button
                      key={action.id}
                      type="button"
                      variant="outline"
                      className="h-9 rounded-none border-border/70 bg-background text-sm font-medium text-foreground/84 hover:text-foreground"
                      onClick={() => setComposer(action.seedPrompt)}
                    >
                      <Icon data-icon="inline-start" />
                      {action.title}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </div>
  );
}
  const setStoredMode = (value: ChatMode) => {
    setStoredModeRaw(value);
  };
