import { useCallback, useEffect, useMemo } from "react";
import {
  CalendarBlankIcon,
  CaretDownIcon,
  CaretUpIcon,
  ChatCircleTextIcon,
  CheckSquareIcon,
  DotsThreeVerticalIcon,
  EnvelopeSimpleIcon,
  FunnelIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  PaperclipIcon,
  PaperPlaneTiltIcon,
  SquareIcon,
} from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { RichOperatorEditor } from "@/components/rich-operator-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { toast } from "@/components/ui/sonner";
import { Separator } from "@/components/ui/separator";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { findContactCard, getInitials } from "@/lib/contact-helpers";
import { contactCards, inboxThreads } from "@/lib/ubik-data";

type QuickFilter = "all" | "unread" | "attention" | "waiting" | "approval";

type AddedTask = {
  id: string;
  title: string;
  status: "Open";
  due: "Today";
  priority: (typeof inboxThreads)[number]["priority"];
  source: (typeof inboxThreads)[number]["source"];
  provenance: string;
};

type NormalizedInboxThread = Omit<(typeof inboxThreads)[number], "provenance"> & {
  provenance: string[];
  status: "Action required" | "Waiting" | "Reviewed";
  approvalRequired: boolean;
  isUnread: boolean;
  domainTag?: string;
  intentTag?: string;
};

function synthesizeThreadInsights(thread: NormalizedInboxThread) {
  return [
    `${thread.priority} priority signal from ${thread.sender}.`,
    `Thread includes ${thread.attachments.length} attachment${thread.attachments.length === 1 ? "" : "s"} and ${thread.provenance.length} linked context signal${thread.provenance.length === 1 ? "" : "s"}.`,
    `Action intent: ${thread.intentTag ?? "Follow-up"}. Domain: ${thread.domainTag ?? "General"}.`,
    ...thread.extractedTasks.map((task) => `Task extracted: ${task}`),
  ];
}

function buildInsightBlocks(thread: NormalizedInboxThread) {
  return [
    {
      id: "why",
      title: "Why this matters",
      body: thread.extractedTasks[0] ?? "Requires immediate operator action.",
      tone: "neutral" as const,
    },
    {
      id: "changed",
      title: "What changed",
      body: thread.provenance[1] ?? thread.provenance[0] ?? "No change signal.",
      tone: "neutral" as const,
    },
    {
      id: "blocked",
      title: "What is blocked",
      body:
        thread.priority === "Critical" || thread.priority === "High"
          ? "Outbound reply and release path remain blocked until this thread is resolved."
          : "No immediate blocker; monitor for follow-up risk.",
      tone: "critical" as const,
    },
    {
      id: "next",
      title: "Recommended next step",
      body: thread.recommendedReply || "Draft and route a clear next-step response.",
      tone: "inverted" as const,
    },
  ];
}

function buildThreadBubbles(thread: NormalizedInboxThread) {
  return [
    {
      id: `${thread.id}-source`,
      role: "source" as const,
      label: `${thread.sender} · ${thread.source}`,
      text: thread.preview,
    },
    {
      id: `${thread.id}-context`,
      role: "source" as const,
      label: "Thread context",
      text: thread.provenance[0] ?? "No linked provenance available.",
    },
    {
      id: `${thread.id}-suggested`,
      role: "operator" as const,
      label: "Suggested response",
      text: thread.recommendedReply,
    },
  ];
}

function defaultReplyTo(thread: NormalizedInboxThread) {
  return thread.sender;
}

export default function Inbox() {
  const navigate = useNavigate();
  const { activeTabId, createTab, setPageState } = useShellState();
  const { threadId } = useParams();

  const [quickFilter, setQuickFilter] = useWorkbenchState<QuickFilter>("inbox-quick-filter", "all");
  const [filterPromptOpen, setFilterPromptOpen] = useWorkbenchState<boolean>("inbox-filter-prompt-open", false);
  const [filterPrompt, setFilterPrompt] = useWorkbenchState<string>("inbox-filter-prompt", "");
  const [lastSelectedThreadId, setLastSelectedThreadId] = useWorkbenchState<string>("inbox-selected-thread", inboxThreads[0]?.id ?? "");

  const [emailMetaByThread, setEmailMetaByThread] = useWorkbenchState<Record<string, { to: string; subject: string }>>("inbox-email-meta", {});
  const [emailCcByThread, setEmailCcByThread] = useWorkbenchState<Record<string, string>>("inbox-email-cc", {});
  const [emailBccByThread, setEmailBccByThread] = useWorkbenchState<Record<string, string>>("inbox-email-bcc", {});
  const [emailMetaOpenByThread, setEmailMetaOpenByThread] = useWorkbenchState<Record<string, boolean>>("inbox-email-meta-open", {});
  const [draftByThread, setDraftByThread] = useWorkbenchState<Record<string, string>>("inbox-draft-by-thread", {});

  const [reviewedStateByThread, setReviewedStateByThread] = useWorkbenchState<Record<string, boolean>>("inbox-reviewed-state", {});
  const [watchStateByThread, setWatchStateByThread] = useWorkbenchState<Record<string, boolean>>("inbox-watch-state", {});
  const [archiveStateByThread, setArchiveStateByThread] = useWorkbenchState<Record<string, boolean>>("inbox-archive-state", {});
  const [reminderByThreadId, setReminderByThreadId] = useWorkbenchState<Record<string, string | null>>("inbox-reminder-by-thread", {});

  const [approvalOpenByThread, setApprovalOpenByThread] = useWorkbenchState<Record<string, boolean>>("inbox-approval-open", {});
  const [approvalQueryByThread, setApprovalQueryByThread] = useWorkbenchState<Record<string, string>>("inbox-approval-query", {});
  const [approvalSelectedByThread, setApprovalSelectedByThread] = useWorkbenchState<Record<string, string>>("inbox-approval-selected", {});
  const [approvalSentByThread, setApprovalSentByThread] = useWorkbenchState<Record<string, boolean>>("inbox-approval-sent", {});
  const [discussOpenByThread, setDiscussOpenByThread] = useWorkbenchState<Record<string, boolean>>("inbox-discuss-open", {});
  const [discussQueryByThread, setDiscussQueryByThread] = useWorkbenchState<Record<string, string>>("inbox-discuss-query", {});
  const [discussSelectedByThread, setDiscussSelectedByThread] = useWorkbenchState<Record<string, string>>("inbox-discuss-selected", {});
  const [discussSentByThread, setDiscussSentByThread] = useWorkbenchState<Record<string, boolean>>("inbox-discuss-sent", {});

  const [taskInputEnabledByThread, setTaskInputEnabledByThread] = useWorkbenchState<Record<string, boolean>>("inbox-task-input-enabled", {});
  const [taskInputByThread, setTaskInputByThread] = useWorkbenchState<Record<string, string>>("inbox-task-input", {});
  const [addedTasksByThread, setAddedTasksByThread] = useWorkbenchState<Record<string, AddedTask[]>>("inbox-added-tasks", {});

  const normalizedThreads = useMemo<NormalizedInboxThread[]>(
    () =>
      inboxThreads.map((thread) => {
        const approvalRequired = thread.approvalRequired ?? thread.approvalStatus === "approval_required";
        const status =
          thread.status ??
          (thread.followUpStatus === "auto_handled" || thread.approvalStatus === "approved"
            ? "Reviewed"
            : thread.waitingState.toLowerCase().includes("watch") || thread.delegationStatus === "delegated"
              ? "Waiting"
              : "Action required");

        return {
          ...thread,
          provenance: thread.provenance.map((item) => (typeof item === "string" ? item : item.value)),
          status,
          approvalRequired,
          isUnread:
            thread.isUnread ??
            (thread.priority === "Critical" ||
              thread.priority === "High" ||
              thread.followUpStatus === "due_soon" ||
              thread.followUpStatus === "overdue" ||
              thread.followUpStatus === "blocked_by_approval"),
          domainTag: thread.domainTag ?? thread.tags[0],
          intentTag:
            thread.intentTag ??
            (approvalRequired
              ? "Approval"
              : thread.followUpStatus === "overdue" || thread.followUpStatus === "due_soon"
                ? "Follow-up"
                : thread.delegationStatus === "delegated"
                  ? "Delegated"
                  : "Review"),
        };
      }),
    [],
  );

  const isThreadUnread = useCallback(
    (thread: NormalizedInboxThread) => Boolean(thread.isUnread) && !reviewedStateByThread[thread.id],
    [reviewedStateByThread],
  );

  const promptTokens = filterPrompt.toLowerCase().split(" ").filter(Boolean);

  const filteredByQuick = useMemo(() => {
    if (quickFilter === "all") return normalizedThreads;
    if (quickFilter === "unread") return normalizedThreads.filter((thread) => isThreadUnread(thread));
    if (quickFilter === "attention") return normalizedThreads.filter((thread) => thread.priority === "Critical" || thread.priority === "High");
    if (quickFilter === "waiting") return normalizedThreads.filter((thread) => thread.status === "Waiting");
    return normalizedThreads.filter((thread) => thread.approvalRequired);
  }, [isThreadUnread, normalizedThreads, quickFilter]);

  const filtered = useMemo(() => {
    if (!promptTokens.length) return filteredByQuick;
    return filteredByQuick.filter((thread) => {
      const hay = `${thread.subject} ${thread.preview} ${thread.sender} ${thread.source} ${thread.domainTag} ${thread.intentTag}`.toLowerCase();
      return promptTokens.every((token) => hay.includes(token));
    });
  }, [filteredByQuick, promptTokens]);

  const visibleFiltered = useMemo(
    () => filtered.filter((thread) => !archiveStateByThread[thread.id]),
    [archiveStateByThread, filtered],
  );

  const requestedThreadId = threadId ?? lastSelectedThreadId;
  const selectedThread = visibleFiltered.find((thread) => thread.id === requestedThreadId) ?? visibleFiltered[0] ?? null;
  const selectedRawThread = inboxThreads.find((thread) => thread.id === selectedThread?.id) ?? null;

  const emailMeta = selectedThread
    ? emailMetaByThread[selectedThread.id] ?? { to: defaultReplyTo(selectedThread), subject: `Re: ${selectedThread.subject}` }
    : { to: "", subject: "" };
  const emailCc = selectedThread ? emailCcByThread[selectedThread.id] ?? "" : "";
  const emailBcc = selectedThread ? emailBccByThread[selectedThread.id] ?? "" : "";
  const currentDraftText = selectedThread ? draftByThread[selectedThread.id] ?? "" : "";
  const suggestedReply = selectedThread?.recommendedReply ?? "";
  const threadInsights = selectedThread ? synthesizeThreadInsights(selectedThread) : [];
  const insightBlocks = selectedThread ? buildInsightBlocks(selectedThread) : [];
  const threadBubbles = selectedThread ? buildThreadBubbles(selectedThread) : [];
  const emailMetaOpen = selectedThread ? Boolean(emailMetaOpenByThread[selectedThread.id]) : false;

  const isRead = selectedThread ? Boolean(reviewedStateByThread[selectedThread.id]) || !selectedThread.isUnread : false;
  const approvalOpen = selectedThread ? Boolean(approvalOpenByThread[selectedThread.id]) : false;
  const approvalQuery = selectedThread ? approvalQueryByThread[selectedThread.id] ?? "" : "";
  const approvalSelectedId = selectedThread ? approvalSelectedByThread[selectedThread.id] : undefined;
  const approvalSent = selectedThread ? Boolean(approvalSentByThread[selectedThread.id]) : false;
  const selectedContact = contactCards.find((contact) => contact.id === approvalSelectedId);
  const discussOpen = selectedThread ? Boolean(discussOpenByThread[selectedThread.id]) : false;
  const discussQuery = selectedThread ? discussQueryByThread[selectedThread.id] ?? "" : "";
  const discussSelectedId = selectedThread ? discussSelectedByThread[selectedThread.id] : undefined;
  const discussSent = selectedThread ? Boolean(discussSentByThread[selectedThread.id]) : false;
  const selectedDiscussContact = contactCards.find((contact) => contact.id === discussSelectedId);

  const taskInputEnabled = selectedThread ? Boolean(taskInputEnabledByThread[selectedThread.id]) : false;
  const taskInput = selectedThread ? taskInputByThread[selectedThread.id] ?? "" : "";
  const addedTasks = selectedThread ? addedTasksByThread[selectedThread.id] ?? [] : [];

  const matchingContacts = useMemo(() => {
    const q = approvalQuery.toLowerCase().trim();
    if (!q) return contactCards;
    return contactCards.filter((contact) => `${contact.name} ${contact.role} ${contact.company}`.toLowerCase().includes(q));
  }, [approvalQuery]);
  const matchingDiscussContacts = useMemo(() => {
    const q = discussQuery.toLowerCase().trim();
    if (!q) return contactCards;
    return contactCards.filter((contact) => `${contact.name} ${contact.role} ${contact.company}`.toLowerCase().includes(q));
  }, [discussQuery]);

  useEffect(() => {
    if (!selectedThread) {
      if (threadId) {
        navigate("/inbox", { replace: true });
      }
      return;
    }

    if (lastSelectedThreadId !== selectedThread.id) {
      setLastSelectedThreadId(selectedThread.id);
    }
    if (threadId !== selectedThread.id) {
      navigate(`/inbox/${selectedThread.id}`, { replace: true });
    }
  }, [lastSelectedThreadId, navigate, selectedThread, setLastSelectedThreadId, threadId]);

  useEffect(() => {
    setPageState(`${activeTabId}:inbox-threads`, inboxThreads);
  }, [activeTabId]);

  useEffect(() => {
    if (!selectedRawThread) return;
    setPageState(`${activeTabId}:inbox-thread`, selectedRawThread.id);
  }, [activeTabId, selectedRawThread]);

  const setCurrentDraftText = (next: string) => {
    if (!selectedThread) return;
    setDraftByThread({ ...draftByThread, [selectedThread.id]: next });
  };

  const setEmailTo = (next: string) => {
    if (!selectedThread) return;
    setEmailMetaByThread({
      ...emailMetaByThread,
      [selectedThread.id]: {
        to: next,
        subject: emailMeta.subject,
      },
    });
  };

  const setEmailSubject = (next: string) => {
    if (!selectedThread) return;
    setEmailMetaByThread({
      ...emailMetaByThread,
      [selectedThread.id]: {
        to: emailMeta.to,
        subject: next,
      },
    });
  };

  const setEmailCc = (next: string) => {
    if (!selectedThread) return;
    setEmailCcByThread({
      ...emailCcByThread,
      [selectedThread.id]: next,
    });
  };

  const setEmailBcc = (next: string) => {
    if (!selectedThread) return;
    setEmailBccByThread({
      ...emailBccByThread,
      [selectedThread.id]: next,
    });
  };

  const selectThread = useCallback((nextThreadId: string) => {
    setLastSelectedThreadId(nextThreadId);
    navigate(`/inbox/${nextThreadId}`);
  }, [navigate, setLastSelectedThreadId]);

  const markThreadReviewed = (targetThreadId?: string) => {
    const threadIdToReview = targetThreadId ?? selectedThread?.id;
    if (!threadIdToReview) return;

    setReviewedStateByThread({ ...reviewedStateByThread, [threadIdToReview]: true });
    toast("Thread marked reviewed");
  };

  const archiveThread = (targetThreadId?: string) => {
    const threadIdToArchive = targetThreadId ?? selectedThread?.id;
    if (!threadIdToArchive) return;
    setArchiveStateByThread({ ...archiveStateByThread, [threadIdToArchive]: true });
    toast("Thread archived");
  };

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      if (!visibleFiltered.length || !selectedThread) return;

      event.preventDefault();

      const currentIndex = visibleFiltered.findIndex((thread) => thread.id === selectedThread.id);
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = currentIndex < 0
        ? 0
        : (currentIndex + delta + visibleFiltered.length) % visibleFiltered.length;

      const nextThread = visibleFiltered[nextIndex];
      if (!nextThread) return;
      selectThread(nextThread.id);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [selectedThread, selectThread, visibleFiltered]);

  const sendApprovalAssign = () => {
    if (!selectedThread || !approvalSelectedId) return;
    setApprovalSentByThread({ ...approvalSentByThread, [selectedThread.id]: true });
  };
  const sendDiscuss = () => {
    if (!selectedThread || !discussSelectedId) return;
    setDiscussSentByThread({ ...discussSentByThread, [selectedThread.id]: true });
    toast("Shared with team", {
      description: `Discuss thread sent to ${selectedDiscussContact?.name ?? "teammate"}.`,
    });
  };

  const addQuickTask = () => {
    if (!selectedThread) return;
    const title = taskInput.trim();
    if (!title) return;

    const nextTask: AddedTask = {
      id: `${selectedThread.id}-${Date.now()}`,
      title,
      status: "Open",
      due: "Today",
      priority: selectedThread.priority,
      source: selectedThread.source,
      provenance: selectedThread.provenance[0] ?? "Thread context",
    };

    setAddedTasksByThread({
      ...addedTasksByThread,
      [selectedThread.id]: [nextTask, ...addedTasks],
    });
    setTaskInputByThread({ ...taskInputByThread, [selectedThread.id]: "" });
  };

  const sendEmailReply = () => {
    if (!selectedThread) return;
    const recipient = emailMeta.to.trim() || defaultReplyTo(selectedThread);
    toast("Email draft ready", {
      description: `Prepared for ${recipient}`,
    });
  };

  const setReminder = (preset: "1h" | "3h" | "tomorrow", targetThreadId?: string) => {
    const threadIdForReminder = targetThreadId ?? selectedThread?.id;
    if (!threadIdForReminder) return;
    const now = new Date();
    const next = new Date(now);
    const label = preset === "1h" ? "1 hour" : preset === "3h" ? "3 hours" : "Tomorrow 9:00 AM";

    if (preset === "1h") {
      next.setHours(next.getHours() + 1);
    } else if (preset === "3h") {
      next.setHours(next.getHours() + 3);
    } else {
      next.setDate(next.getDate() + 1);
      next.setHours(9, 0, 0, 0);
    }

    setReminderByThreadId({ ...reminderByThreadId, [threadIdForReminder]: next.toISOString() });

    toast("Reminder set", {
      description: `This thread will return in ${label}.`,
    });
  };

  const openInGmail = (_targetThreadId?: string) => {
    toast("Opening Gmail soon", {
      description: "Gmail deep link unavailable in mock mode.",
    });
  };

  const openInChat = () => {
    if (!selectedThread) return;
    const tabId = createTab("/");
    if (!tabId) return;

    const recipient = emailMeta.to.trim() || defaultReplyTo(selectedThread);
    const subject = emailMeta.subject.trim() || `Re: ${selectedThread.subject}`;
    const cc = emailCc.trim();
    const bcc = emailBcc.trim();
    const body = currentDraftText.trim() || suggestedReply;
    const prompt = [
      "Email assist (Gmail): review and improve this outbound draft.",
      "",
      `Thread subject: ${selectedThread.subject}`,
      `Sender: ${selectedThread.sender}`,
      `To: ${recipient}`,
      cc ? `Cc: ${cc}` : null,
      bcc ? `Bcc: ${bcc}` : null,
      `Subject: ${subject}`,
      "",
      "Current draft:",
      body || "(empty draft)",
      "",
      "Return one polished final email and one concise alternate.",
    ].filter(Boolean).join("\n");

    setPageState(`${tabId}:chat-composer`, prompt);
    setPageState(`${tabId}:chat-sources`, ["org_knowledge", "files", "gmail"]);
    setPageState(`${tabId}:chat-mode`, "plan");
    toast("Opened in Chat", {
      description: "Email context and Gmail source were prefilled.",
    });
  };

  const sectionLabelClass = "section-label";

  const renderContactPickerPanel = (opts: {
    open: boolean;
    query: string;
    placeholder: string;
    selectedId?: string;
    sent: boolean;
    selectedName?: string;
    contacts: typeof contactCards;
    onQueryChange: (value: string) => void;
    onSelect: (id: string) => void;
    onSend: () => void;
    sendLabel: string;
    sentLabel: string;
  }) => {
    if (!opts.open) return null;
    return (
      <Card size="sm" className="mt-3 surface-card">
        <CardHeader className="border-b border-border/60 pb-3">
          <CardTitle className="text-sm">
            {opts.sendLabel === "Send" ? "Approval and assignment" : "Discuss with teammate"}
          </CardTitle>
          <CardDescription>
            {opts.sendLabel === "Send"
              ? "Route this thread to the right owner with one explicit handoff."
              : "Share the thread with context instead of copying the details manually."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <InputGroup className="mt-3 h-10 bg-background">
            <InputGroupAddon>
              <InputGroupText>
                <MagnifyingGlassIcon />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              onChange={(event) => opts.onQueryChange(event.target.value)}
              placeholder={opts.placeholder}
              value={opts.query}
            />
          </InputGroup>
        <div className="mt-3 flex max-h-32 flex-col gap-1.5 overflow-auto">
          {opts.contacts.map((contact) => (
            <Button
              key={contact.id}
              variant={opts.selectedId === contact.id ? "secondary" : "ghost"}
              className="h-auto w-full justify-start gap-3 px-3 py-2 text-left text-xs"
              onClick={() => opts.onSelect(contact.id)}
              type="button"
            >
              <Avatar>
                <AvatarImage alt={contact.name} src={contact.avatarSrc} />
                <AvatarFallback>{contact.avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm text-foreground">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.role} · {contact.company}</p>
              </div>
            </Button>
          ))}
        </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {opts.selectedName ? `Selected: ${opts.selectedName}` : "No teammate selected"}
          </div>
          <Button size="sm" disabled={!opts.selectedName} onClick={opts.onSend}>
            <PaperPlaneTiltIcon data-icon="inline-start" /> {opts.sendLabel}
          </Button>
        </CardFooter>
        {opts.sent ? <p className="px-3 pb-3 text-xs text-foreground">{opts.sentLabel}</p> : null}
      </Card>
    );
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-4">
        <Surface className="overflow-hidden px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
            <ToggleGroup
              type="single"
              value={quickFilter}
              onValueChange={(value) => {
                if (value) setQuickFilter(value as QuickFilter);
              }}
              variant="outline"
              spacing={1}
              className="flex-wrap"
            >
              {([
                ["all", "All"],
                ["unread", "Unread"],
                ["attention", "Needs attention"],
                ["waiting", "Waiting"],
                ["approval", "Approval"],
              ] as [QuickFilter, string][]).map(([key, label]) => (
                <ToggleGroupItem key={key} value={key} className="px-3 text-xs">
                  {label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setFilterPromptOpen((open) => !open)}>
                <FunnelIcon data-icon="inline-start" /> Filter
              </Button>
              <StatusPill tone="muted">{visibleFiltered.length} threads</StatusPill>
            </div>
          </div>

          {filterPromptOpen ? (
            <InputGroup className="mt-4 h-10 bg-background transition-all duration-200">
              <InputGroupAddon>
                <InputGroupText>
                  <MagnifyingGlassIcon />
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Filter by sender, subject, domain, or intent"
                value={filterPrompt}
                onChange={(event) => setFilterPrompt(event.target.value)}
              />
            </InputGroup>
          ) : null}
        </Surface>

        <div className="grid gap-4 xl:grid-cols-[0.95fr_1.52fr_0.92fr]">
          <Surface className="overflow-hidden">
            {visibleFiltered.length ? (
              <div className="flex flex-col gap-2 p-3">
                {visibleFiltered.map((thread) => {
                  const selected = selectedThread?.id === thread.id;
                  const isUnread = isThreadUnread(thread);
                  const isWatched = Boolean(watchStateByThread[thread.id]);
                  const highSignalLabel = thread.approvalRequired
                    ? "Awaiting approval"
                    : thread.priority === "Critical" || thread.priority === "High"
                      ? "Action required"
                      : null;
                  return (
                    <div
                      key={thread.id}
                      className={`group w-full rounded-xl border px-4 py-4 text-left transition-all duration-200 ${
                        selected
                          ? "surface-active"
                          : "border-border/60 bg-background/80 hover:border-border hover:bg-secondary/70"
                      }`}
                      onClick={() => selectThread(thread.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectThread(thread.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <p className="line-clamp-2 text-[17px] leading-6 text-foreground">{thread.subject}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-sm text-foreground">{thread.sender}</span>
                        <span className="text-sm text-foreground/70">{thread.time}</span>
                        {isUnread ? <Badge variant="default">Unread</Badge> : null}
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-foreground/80">{thread.preview}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">{thread.source}</Badge>
                        {thread.domainTag ? (
                          <Badge variant="outline">{thread.domainTag}</Badge>
                        ) : null}
                        {thread.intentTag ? (
                          <Badge variant="outline">{thread.intentTag}</Badge>
                        ) : null}
                        {highSignalLabel ? (
                          <StatusPill tone="alert">{highSignalLabel}</StatusPill>
                        ) : null}
                      </div>
                      <div className="relative mt-3 border-t border-border/60 pt-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            aria-label={`Mark reviewed for ${thread.subject}`}
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-foreground"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              markThreadReviewed(thread.id);
                            }}
                            type="button"
                          >
                            {isUnread ? "Mark reviewed" : "Reviewed"}
                          </Button>
                          <Button
                            aria-label={isWatched ? `Unwatch ${thread.subject}` : `Watch ${thread.subject}`}
                            variant={isWatched ? "secondary" : "ghost"}
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setWatchStateByThread({ ...watchStateByThread, [thread.id]: !isWatched });
                            }}
                            type="button"
                          >
                            Watch
                          </Button>
                          <Button
                            aria-label={`Open in Email for ${thread.subject}`}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              openInGmail(thread.id);
                            }}
                            type="button"
                          >
                            <EnvelopeSimpleIcon data-icon="inline-start" /> Open in Email
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                aria-label={`Open thread actions for ${thread.subject}`}
                                variant={reminderByThreadId[thread.id] ? "secondary" : "outline"}
                                size="icon-sm"
                                className="ml-auto"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                }}
                                type="button"
                              >
                                <DotsThreeVerticalIcon />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              onClick={(event) => event.stopPropagation()}
                              onCloseAutoFocus={(event) => event.preventDefault()}
                              className="w-52"
                            >
                              <DropdownMenuLabel>Thread actions</DropdownMenuLabel>
                              <DropdownMenuGroup>
                                <DropdownMenuItem onSelect={() => markThreadReviewed(thread.id)}>
                                  {isUnread ? "Mark reviewed" : "Already reviewed"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onSelect={() =>
                                    setWatchStateByThread({ ...watchStateByThread, [thread.id]: !isWatched })
                                  }
                                >
                                  {isWatched ? "Unwatch thread" : "Watch thread"}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => archiveThread(thread.id)}>Archive</DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Schedule reminder</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  <DropdownMenuItem onSelect={() => setReminder("1h", thread.id)}>In 1 hour</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => setReminder("3h", thread.id)}>In 3 hours</DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => setReminder("tomorrow", thread.id)}>
                                    Tomorrow 9 AM
                                  </DropdownMenuItem>
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4">
                <p className="text-sm text-foreground/70">No active threads in this filter.</p>
              </div>
            )}
          </Surface>

          <Surface className="p-4 lg:p-5">
            {selectedThread ? (
              <>
                <p className={sectionLabelClass}>
                  {selectedThread.sender} · {selectedThread.source} · {selectedThread.time}
                </p>
                <h2 className="mt-2 text-[34px] leading-[1.12] text-foreground">{selectedThread.subject}</h2>
                <p className="mt-2 text-[15px] text-foreground">{selectedThread.preview}</p>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {insightBlocks.map((block) => (
                    <Card
                      key={block.id}
                      size="sm"
                      className={`overflow-hidden ${
                        block.tone === "critical"
                          ? "support-surface surface-card"
                          : block.tone === "inverted"
                            ? "surface-card border-primary/30 bg-primary/6"
                            : "surface-card bg-card"
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center">
                          <Badge
                            variant={block.tone === "inverted" ? "default" : "outline"}
                            className={
                              block.tone === "critical"
                                ? "support-chip"
                                : block.tone === "inverted"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary/70 text-muted-foreground"
                            }
                          >
                            {block.title}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-[15px] leading-7 text-foreground">{block.body}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="surface-well mt-4 rounded-xl p-4">
                  <p className={sectionLabelClass}>UBIK analysis</p>
                  <div className="mt-2 space-y-1 text-sm leading-6 text-foreground">
                    {threadInsights.map((line) => (
                      <p key={line}>- {line}</p>
                    ))}
                  </div>
                </div>

                <div className="surface-well mt-4 rounded-xl p-4">
                  <p className={sectionLabelClass}>Thread messages</p>
                  <div className="mt-3 space-y-2">
                    {threadBubbles.map((bubble) => (
                      <div
                        key={bubble.id}
                        className={`max-w-[88%] rounded-xl border px-3 py-3 text-sm ${
                          bubble.role === "operator"
                            ? "ml-auto border-primary/30 bg-primary/5 text-foreground"
                            : "mr-auto border-border/70 bg-background text-foreground"
                        }`}
                      >
                        <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/65">{bubble.label}</p>
                        <p className="mt-1 leading-6">{bubble.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {selectedThread.attachments.map((file) => (
                    <StatusPill key={file} tone="muted">{file}</StatusPill>
                  ))}
                </div>

                <Separator className="my-4" />

                <div className="surface-well space-y-2 rounded-xl p-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-between px-0 text-left hover:bg-transparent"
                    onClick={() =>
                      setEmailMetaOpenByThread({
                        ...emailMetaOpenByThread,
                        [selectedThread.id]: !emailMetaOpen,
                      })
                    }
                    type="button"
                  >
                    <p className={sectionLabelClass}>Recipients and subject</p>
                    {emailMetaOpen ? <CaretUpIcon className="h-4 w-4 text-foreground/60" /> : <CaretDownIcon className="h-4 w-4 text-foreground/60" />}
                  </Button>
                  {emailMetaOpen ? (
                    <div className="grid gap-2">
                      {([
                        ["To", emailMeta.to, setEmailTo, "Recipient"],
                        ["Cc", emailCc, setEmailCc, "Add Cc recipients"],
                        ["Bcc", emailBcc, setEmailBcc, "Add Bcc recipients"],
                        ["Subject", emailMeta.subject, setEmailSubject, "Subject"],
                      ] as const).map(([label, value, onChange, placeholder]) => (
                        <InputGroup key={label} className="h-10 bg-background">
                          <InputGroupAddon className="min-w-14 justify-start">
                            <InputGroupText>{label}</InputGroupText>
                          </InputGroupAddon>
                          <InputGroupInput
                            onChange={(event) => onChange(event.target.value)}
                            placeholder={placeholder}
                            value={value}
                          />
                        </InputGroup>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/80">
                      <Badge variant="outline" className="px-2.5 py-1">To: {emailMeta.to || "Recipient"}</Badge>
                      {emailCc ? <Badge variant="outline" className="px-2.5 py-1">Cc</Badge> : null}
                      {emailBcc ? <Badge variant="outline" className="px-2.5 py-1">Bcc</Badge> : null}
                    </div>
                  )}
                </div>

                <div className="mt-3">
                  <RichOperatorEditor
                    compactCopyActions
                    minHeight={116}
                    onChange={setCurrentDraftText}
                    placeholder={`Draft your outbound reply. Suggestion: ${suggestedReply}`}
                    showMarkdownCopy={false}
                    showInsertBlock={false}
                    value={currentDraftText}
                  />
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-foreground/75">
                    <Button variant="outline" size="sm">
                      <PaperclipIcon data-icon="inline-start" /> Attach file
                    </Button>
                    <Button variant="outline" size="sm">
                      <CalendarBlankIcon data-icon="inline-start" /> Meeting
                    </Button>
                    <Button variant="outline" size="sm">
                      <FolderOpenIcon data-icon="inline-start" /> Drive
                    </Button>
                    <span className="ml-auto text-[11px] text-foreground/65">Connected: Gmail, Calendar, Drive</span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Button size="sm" onClick={sendEmailReply}>
                      <PaperPlaneTiltIcon data-icon="inline-start" /> Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-foreground/70">No selected thread.</p>
            )}
          </Surface>

          <div className="space-y-3 xl:sticky xl:top-4 xl:max-h-[calc(100vh-8rem)] xl:overflow-auto">
            {selectedThread ? (
              <>
                <Surface className="p-4">
                  <p className={sectionLabelClass}>Actions</p>
                  <div className="mt-2.5">
                    <div className="grid grid-cols-2 gap-2">
                    <Button
                      aria-label={approvalOpen ? "Close approval and assign" : "Open approval and assign"}
                      variant={approvalOpen ? "default" : "outline"}
                      size="sm"
                      className="h-10"
                      onClick={() =>
                        setApprovalOpenByThread({
                          ...approvalOpenByThread,
                          [selectedThread.id]: !approvalOpen,
                        })
                      }
                      type="button"
                    >
                      Approval/Assign
                    </Button>
                    <Button
                      aria-label={discussOpen ? "Close discuss panel" : "Open discuss panel"}
                      variant={discussOpen ? "default" : "outline"}
                      size="sm"
                      className="h-10"
                      onClick={() =>
                        setDiscussOpenByThread({
                          ...discussOpenByThread,
                          [selectedThread.id]: !discussOpen,
                        })
                      }
                      type="button"
                    >
                      Discuss
                    </Button>
                    <Button
                      aria-label="Open this thread in chat"
                      variant="outline"
                      size="sm"
                      className="h-10"
                      onClick={openInChat}
                      type="button"
                    >
                      <ChatCircleTextIcon data-icon="inline-start" /> Chat
                    </Button>
                    <Button
                      aria-label={isRead ? "Thread already read" : "Mark thread as read"}
                      variant={isRead ? "secondary" : "outline"}
                      size="sm"
                      className="h-10"
                      onClick={() => markThreadReviewed(selectedThread.id)}
                      type="button"
                    >
                      {isRead ? "Marked as Read" : "Mark as Read"}
                    </Button>
                    </div>
                  </div>
                  {renderContactPickerPanel({
                    open: approvalOpen,
                    query: approvalQuery,
                    placeholder: "Search contact to assign",
                    selectedId: approvalSelectedId,
                    sent: approvalSent,
                    selectedName: selectedContact?.name,
                    contacts: matchingContacts,
                    onQueryChange: (value) =>
                      setApprovalQueryByThread({
                        ...approvalQueryByThread,
                        [selectedThread.id]: value,
                      }),
                    onSelect: (id) => {
                      setApprovalSelectedByThread({
                        ...approvalSelectedByThread,
                        [selectedThread.id]: id,
                      });
                      setApprovalSentByThread({ ...approvalSentByThread, [selectedThread.id]: false });
                    },
                    onSend: sendApprovalAssign,
                    sendLabel: "Send",
                    sentLabel: `Sent to ${selectedContact?.name ?? "assignee"}.`,
                  })}
                  {renderContactPickerPanel({
                    open: discussOpen,
                    query: discussQuery,
                    placeholder: "Search teammate to discuss",
                    selectedId: discussSelectedId,
                    sent: discussSent,
                    selectedName: selectedDiscussContact?.name,
                    contacts: matchingDiscussContacts,
                    onQueryChange: (value) =>
                      setDiscussQueryByThread({
                        ...discussQueryByThread,
                        [selectedThread.id]: value,
                      }),
                    onSelect: (id) => {
                      setDiscussSelectedByThread({
                        ...discussSelectedByThread,
                        [selectedThread.id]: id,
                      });
                      setDiscussSentByThread({ ...discussSentByThread, [selectedThread.id]: false });
                    },
                    onSend: sendDiscuss,
                    sendLabel: "Share",
                    sentLabel: `Shared with ${selectedDiscussContact?.name ?? "teammate"}.`,
                  })}
                </Surface>

                <Surface className="p-4">
                  <p className={sectionLabelClass}>Quick task</p>
                  <InputGroup className="mt-2 h-10 bg-background">
                  <InputGroupAddon>
                    <InputGroupButton
                      aria-label={taskInputEnabled ? "Disable task input" : "Enable task input"}
                      variant={taskInputEnabled ? "secondary" : "ghost"}
                      size="icon-sm"
                      onClick={() =>
                        setTaskInputEnabledByThread({
                          ...taskInputEnabledByThread,
                          [selectedThread.id]: !taskInputEnabled,
                        })
                      }
                      type="button"
                    >
                      {taskInputEnabled ? <CheckSquareIcon /> : <SquareIcon />}
                    </InputGroupButton>
                  </InputGroupAddon>
                  <InputGroupInput
                    disabled={!taskInputEnabled}
                    onChange={(event) =>
                      setTaskInputByThread({
                        ...taskInputByThread,
                        [selectedThread.id]: event.target.value,
                      })
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addQuickTask();
                      }
                    }}
                    placeholder="Add task line and press Enter"
                    value={taskInput}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton variant="ghost" size="icon-sm" onClick={addQuickTask} type="button">
                      <PaperPlaneTiltIcon />
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>

                {addedTasks.length ? (
                  <div className="mt-3 space-y-1.5">
                    {addedTasks.map((task) => (
                      <Card key={task.id} size="sm" className="surface-card">
                        <CardContent className="pt-0">
                          <p className="line-clamp-2 text-sm text-foreground">{task.title}</p>
                          <p className="mt-1 text-foreground/70">
                            {task.status} · Due {task.due} · <span className="font-medium text-primary">{task.priority}</span>
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-foreground/70">No tasks added for this thread yet.</p>
                )}
                </Surface>

                <Surface className="p-4">
                  <p className={sectionLabelClass}>Provenance</p>
                  <Card size="sm" className="mt-2 surface-card">
                    <CardContent className="pt-0">
                      <div className="space-y-1.5 text-sm text-foreground/75">
                        {selectedThread.provenance.slice(0, 3).map((entry) => (
                          <p key={entry} className="line-clamp-1">{entry}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Surface>

                <Surface className="p-4">
                  <p className={sectionLabelClass}>People</p>
                  <Card size="sm" className="mt-2 surface-card">
                    <CardContent className="space-y-3 pt-0 text-sm">
                    {[
                      {
                        label: "Sender",
                        name: selectedThread.sender,
                        meta: selectedThread.company,
                        contact: findContactCard(selectedThread.sender),
                      },
                      {
                        label: "Owner",
                        name: selectedThread.owner,
                        meta: "Thread owner",
                        contact: findContactCard(selectedThread.owner),
                      },
                    ].map((person) => (
                      <div key={`${person.label}-${person.name}`} className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage alt={person.name} src={person.contact?.avatarSrc} />
                          <AvatarFallback>{person.contact?.avatarFallback ?? getInitials(person.name)}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{person.label}</p>
                          <p className="text-foreground">{person.name}</p>
                          <p className="text-foreground/70">{person.meta}</p>
                        </div>
                      </div>
                    ))}
                    </CardContent>
                  </Card>
                </Surface>
              </>
            ) : (
              <p className="text-sm text-foreground/70">No selected thread.</p>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
