import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ArrowUpIcon,
  CalendarBlankIcon,
  ChartBarIcon,
  CheckSquareIcon,
  FolderOpenIcon,
  MagnifyingGlassIcon,
  PaperclipIcon,
  PaperPlaneTiltIcon,
  PlusIcon,
  SidebarSimpleIcon,
  SquareIcon,
  TagIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { RichOperatorEditor } from "@/components/rich-operator-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import { SidebarInput } from "@/components/ui/sidebar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { StatusPill, Surface } from "@/components/ubik-primitives";
import { Drive } from "@/components/ui/svgs/drive";
import { FileMark } from "@/components/ui/svgs/file-marks";
import { Gmail } from "@/components/ui/svgs/gmail";
import { Salesforce } from "@/components/ui/svgs/salesforce";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { findContactCard, getInitials } from "@/lib/contact-helpers";
import { contactCards, inboxThreads } from "@/lib/ubik-data";
import { cn } from "@/lib/utils";

type AddedTask = {
  id: string;
  title: string;
  status: string;
  due: string;
  priority: string;
  source: (typeof inboxThreads)[number]["source"];
  provenance: string;
  owner: string;
  project: string;
  label: string;
};

type NormalizedInboxThread = Omit<(typeof inboxThreads)[number], "provenance"> & {
  provenance: string[];
  status: "Action required" | "Waiting" | "Reviewed";
  approvalRequired: boolean;
  isUnread: boolean;
  domainTag?: string;
  intentTag?: string;
};

type RailScope = "unread" | "sent";
type ComposerMode = "reply" | "compose";
type RecipientSlot = "cc" | "bcc";
type QuickTaskDraft = {
  project: string;
  status: string;
  priority: string;
  due: string;
  label: string;
  assigneeId: string;
  assigneeQuery: string;
};

type ArtifactSuggestion = {
  id: string;
  title: string;
  subtitle: string;
  hint: string;
  icon: "drive" | "salesforce";
  kindLabel: string;
  template: string;
  preview?: "chart";
};

type RecipientPreview = {
  key: string;
  name: string;
  role: string;
  avatarSrc?: string;
  avatarFallback: string;
};

function synthesizeThreadInsights(thread: NormalizedInboxThread) {
  return [
    `${thread.priority} priority signal from ${thread.sender}.`,
    thread.whatChanged,
    thread.whatIsBlocked,
  ];
}

function buildInitialDraft(thread: NormalizedInboxThread) {
  const recipientName = thread.sender.split(" ")[0] ?? thread.sender;
  if (!thread.recommendedReply.trim() || /^No /i.test(thread.recommendedReply.trim())) {
    return thread.recommendedReply;
  }

  if (thread.id === "thread-1") {
    return [
      `${recipientName},`,
      "",
      "Approved to send with clause 4.2 preserved. Please keep Legal copied on the outbound note and do not extend detention coverage beyond the current window.",
      "",
      "Once the reply is out, update the Mumbai-Rotterdam Q2 thread with the final wording and release timing so the team can release the PO immediately.",
      "",
      "Thanks,",
      thread.owner,
    ].join("\n");
  }

  return [
    `${recipientName},`,
    "",
    thread.recommendedReply,
    "",
    thread.nextAction,
    "",
    "Thanks,",
    thread.owner,
  ].join("\n");
}

function toRecipientPreview(name: string, fallbackRole: string): RecipientPreview {
  const contact = findContactCard(name);
  return {
    key: name.toLowerCase().replace(/\s+/g, "-"),
    name: contact?.name ?? name,
    role: contact?.role ?? fallbackRole,
    avatarSrc: contact?.avatarSrc,
    avatarFallback: contact?.avatarFallback ?? getInitials(name),
  };
}

function buildRecipientPreviews(
  thread: NormalizedInboxThread,
  slot: RecipientSlot,
  contacts: (typeof contactCards)[number][],
): RecipientPreview[] {
  if (contacts.length) {
    return contacts.map((contact) => ({
      key: contact.id,
      name: contact.name,
      role: `${contact.role} · ${contact.company}`,
      avatarSrc: contact.avatarSrc,
      avatarFallback: contact.avatarFallback,
    }));
  }

  const suggestedNames =
    slot === "cc"
      ? thread.participants.filter((name) => name !== thread.sender).slice(0, 1)
      : [thread.owner];

  return Array.from(new Set(suggestedNames)).map((name) =>
    toRecipientPreview(name, slot === "cc" ? "Suggested reviewer" : "Suggested hidden recipient"),
  );
}

function buildArtifactSuggestions(thread: NormalizedInboxThread): ArtifactSuggestion[] {
  const attachmentSuggestions = thread.attachments.slice(0, 3).map((attachment, index) => {
    const extension = attachment.split(".").pop()?.toUpperCase() ?? "FILE";
    const attachLine =
      extension === "PDF"
        ? `Attaching ${attachment} so the redlined clause language stays with the reply.`
        : extension === "XLSX"
          ? `Adding ${attachment} for the latest rate sheet reference.`
          : `Attaching ${attachment} for reference before release.`;

    return {
      id: `${thread.id}-attachment-${index}`,
      title: attachment,
      subtitle:
        extension === "PDF"
          ? "Reference the marked-up contract in the reply."
          : extension === "XLSX"
            ? "Mention the revised rate sheet inline."
            : "Pull this artifact into the outbound note.",
      hint: "Click to append attachment context. Hover to preview.",
      icon: "drive" as const,
      kindLabel: extension,
      template: attachLine,
    };
  });

  const chartSuggestion = thread.attachments.some((attachment) => attachment.toLowerCase().endsWith(".xlsx"))
    ? [
        {
          id: `${thread.id}-chart`,
          title: "Rate variance chart.png",
          subtitle: "Inline the rate graph as an image instead of the spreadsheet.",
          hint: "Click to reference the image-based rate delta in the reply.",
          icon: "drive" as const,
          kindLabel: "IMAGE",
          template: "Adding the latest rate variance chart inline so Redwood can review the delta without opening the workbook.",
          preview: "chart" as const,
        },
      ]
    : [];

  const trackingSuggestion =
    thread.id === "thread-1"
      ? [
          {
            id: `${thread.id}-tracking`,
            title: "Shipment tracking link",
            subtitle: "Insert the ERP tracking link for the revised booking.",
            hint: "Click to add the live Salesforce shipment tracking link.",
            icon: "salesforce" as const,
            kindLabel: "TRACK",
            template: "Adding the live shipment tracking link from Salesforce so Redwood can follow the revised booking without leaving the thread.",
          },
        ]
      : [];

  return [...attachmentSuggestions, ...chartSuggestion, ...trackingSuggestion];
}

function defaultReplyTo(thread: NormalizedInboxThread) {
  return thread.sender;
}

export default function Inbox() {
  const navigate = useNavigate();
  const { activeTabId, setPageState } = useShellState();
  const { threadId } = useParams();
  const replySectionRef = useRef<HTMLDivElement | null>(null);

  const [railScope, setRailScope] = useWorkbenchState<RailScope>("inbox-rail-scope", "unread");
  const [filterPrompt, setFilterPrompt] = useWorkbenchState<string>("inbox-filter-prompt", "");
  const [lastSelectedThreadId, setLastSelectedThreadId] = useWorkbenchState<string>("inbox-selected-thread", inboxThreads[0]?.id ?? "");
  const [secondaryRailCollapsed, setSecondaryRailCollapsed] = useWorkbenchState<boolean>("inbox-secondary-rail-collapsed", false);

  const [emailMetaByThread, setEmailMetaByThread] = useWorkbenchState<Record<string, { to: string; subject: string }>>("inbox-email-meta", {});
  const [emailCcByThread, setEmailCcByThread] = useWorkbenchState<Record<string, string[]>>("inbox-email-cc", {});
  const [emailBccByThread, setEmailBccByThread] = useWorkbenchState<Record<string, string[]>>("inbox-email-bcc", {});
  const [recipientPickerByThread, setRecipientPickerByThread] = useWorkbenchState<Record<string, RecipientSlot | null>>("inbox-recipient-picker", {});
  const [recipientQueryByThread, setRecipientQueryByThread] = useWorkbenchState<Record<string, string>>("inbox-recipient-query", {});
  const [subjectEditingByThread, setSubjectEditingByThread] = useWorkbenchState<Record<string, boolean>>("inbox-subject-editing", {});
  const [composerModeByThread, setComposerModeByThread] = useWorkbenchState<Record<string, ComposerMode>>("inbox-composer-mode", {});
  const [draftByThread, setDraftByThread] = useWorkbenchState<Record<string, string>>("inbox-draft-by-thread", {});
  const [olderMessagesOpenByThread, setOlderMessagesOpenByThread] = useWorkbenchState<Record<string, boolean>>("inbox-older-messages-open", {});

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

  const [taskInputByThread, setTaskInputByThread] = useWorkbenchState<Record<string, string>>("inbox-task-input", {});
  const [addedTasksByThread, setAddedTasksByThread] = useWorkbenchState<Record<string, AddedTask[]>>("inbox-added-tasks", {});
  const [expandedSuggestedTaskByThread, setExpandedSuggestedTaskByThread] = useWorkbenchState<Record<string, string | null>>("inbox-expanded-suggested-task", {});
  const [quickTaskDraftsByThread, setQuickTaskDraftsByThread] = useWorkbenchState<Record<string, Record<string, QuickTaskDraft>>>(
    "inbox-quick-task-drafts",
    {},
  );

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

  const activeThreads = useMemo(
    () => normalizedThreads.filter((thread) => !archiveStateByThread[thread.id]),
    [archiveStateByThread, normalizedThreads],
  );

  const railCounts = useMemo(
    () => ({
      unread: activeThreads.filter((thread) => isThreadUnread(thread)).length,
      sent: activeThreads.filter((thread) => !isThreadUnread(thread)).length,
    }),
    [activeThreads, isThreadUnread],
  );
  const promptTokens = filterPrompt.toLowerCase().split(" ").filter(Boolean);
  const filteredByRailScope = useMemo(
    () => activeThreads.filter((thread) => (railScope === "unread" ? isThreadUnread(thread) : !isThreadUnread(thread))),
    [activeThreads, isThreadUnread, railScope],
  );

  const filtered = useMemo(() => {
    if (!promptTokens.length) return filteredByRailScope;
    return filteredByRailScope.filter((thread) => {
      const hay = `${thread.subject} ${thread.preview} ${thread.sender} ${thread.source} ${thread.domainTag} ${thread.intentTag}`.toLowerCase();
      return promptTokens.every((token) => hay.includes(token));
    });
  }, [filteredByRailScope, promptTokens]);

  const visibleFiltered = filtered;

  const requestedThreadId = threadId ?? lastSelectedThreadId;
  const selectedThread = visibleFiltered.find((thread) => thread.id === requestedThreadId) ?? visibleFiltered[0] ?? null;
  const selectedRawThread = inboxThreads.find((thread) => thread.id === selectedThread?.id) ?? null;

  const emailMeta = selectedThread
    ? emailMetaByThread[selectedThread.id] ?? { to: defaultReplyTo(selectedThread), subject: `Re: ${selectedThread.subject}` }
    : { to: "", subject: "" };
  const emailCc = selectedThread ? emailCcByThread[selectedThread.id] ?? [] : [];
  const emailBcc = selectedThread ? emailBccByThread[selectedThread.id] ?? [] : [];
  const recipientPicker = selectedThread ? recipientPickerByThread[selectedThread.id] ?? null : null;
  const recipientQuery = selectedThread ? recipientQueryByThread[selectedThread.id] ?? "" : "";
  const isSubjectEditing = selectedThread ? Boolean(subjectEditingByThread[selectedThread.id]) : false;
  const composerMode = selectedThread ? composerModeByThread[selectedThread.id] ?? "reply" : "reply";
  const currentDraftText = selectedThread ? draftByThread[selectedThread.id] ?? "" : "";
  const threadInsights = selectedThread ? synthesizeThreadInsights(selectedThread) : [];
  const artifactSuggestions = selectedThread ? buildArtifactSuggestions(selectedThread) : [];
  const olderMessagesOpen = selectedThread ? Boolean(olderMessagesOpenByThread[selectedThread.id]) : false;

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
  const selectedThreadIsWatched = selectedThread
    ? Boolean(watchStateByThread[selectedThread.id])
    : false;
  const selectedThreadHasReminder = selectedThread
    ? Boolean(reminderByThreadId[selectedThread.id])
    : false;

  const taskInput = selectedThread ? taskInputByThread[selectedThread.id] ?? "" : "";
  const addedTasks = selectedThread ? addedTasksByThread[selectedThread.id] ?? [] : [];
  const suggestedTasks = selectedThread
    ? selectedThread.extractedTasks
        .filter((task) => task.toLowerCase() !== "none")
        .filter((task) => !addedTasks.some((addedTask) => addedTask.title === task))
        .slice(0, 3)
    : [];
  const expandedSuggestedTask = selectedThread ? expandedSuggestedTaskByThread[selectedThread.id] ?? null : null;
  const quickTaskDrafts = selectedThread ? quickTaskDraftsByThread[selectedThread.id] ?? {} : {};

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
  const selectableRecipientContacts = useMemo(() => {
    const q = recipientQuery.toLowerCase().trim();
    const taken = new Set([...emailCc, ...emailBcc]);
    return contactCards.filter((contact) => {
      if (taken.has(contact.id)) return false;
      if (!q) return true;
      return `${contact.name} ${contact.role} ${contact.company}`.toLowerCase().includes(q);
    });
  }, [emailBcc, emailCc, recipientQuery]);

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

  useEffect(() => {
    if (!selectedThread) return;
    const currentDraft = draftByThread[selectedThread.id];
    const nextSeed = composerModeByThread[selectedThread.id] === "compose" ? "" : buildInitialDraft(selectedThread);
    if (currentDraft !== undefined && currentDraft !== selectedThread.recommendedReply) return;
    setDraftByThread({
      ...draftByThread,
      [selectedThread.id]: nextSeed,
    });
  }, [composerModeByThread, draftByThread, selectedThread, setDraftByThread]);

  const setCurrentDraftText = (next: string) => {
    if (!selectedThread) return;
    setDraftByThread({ ...draftByThread, [selectedThread.id]: next });
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

  const setRecipientPicker = (slot: RecipientSlot | null) => {
    if (!selectedThread) return;
    setRecipientPickerByThread({
      ...recipientPickerByThread,
      [selectedThread.id]: slot,
    });
  };

  const setSubjectEditing = (open: boolean) => {
    if (!selectedThread) return;
    setSubjectEditingByThread({
      ...subjectEditingByThread,
      [selectedThread.id]: open,
    });
  };

  const selectThread = useCallback((nextThreadId: string) => {
    setLastSelectedThreadId(nextThreadId);
    navigate(`/inbox/${nextThreadId}`);
  }, [navigate, setLastSelectedThreadId]);

  const navigateVisibleThreads = useCallback((delta: number) => {
    if (!visibleFiltered.length || !selectedThread) return;

    const currentIndex = visibleFiltered.findIndex((thread) => thread.id === selectedThread.id);
    const nextIndex = currentIndex < 0
      ? 0
      : (currentIndex + delta + visibleFiltered.length) % visibleFiltered.length;

    const nextThread = visibleFiltered[nextIndex];
    if (!nextThread) return;
    selectThread(nextThread.id);
  }, [selectedThread, selectThread, visibleFiltered]);

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

  const toggleThreadWatch = (targetThreadId?: string) => {
    const threadIdToWatch = targetThreadId ?? selectedThread?.id;
    if (!threadIdToWatch) return;
    setWatchStateByThread({
      ...watchStateByThread,
      [threadIdToWatch]: !Boolean(watchStateByThread[threadIdToWatch]),
    });
  };

  const toggleApprovalAction = (targetThreadId?: string) => {
    const threadIdToToggle = targetThreadId ?? selectedThread?.id;
    if (!threadIdToToggle) return;
    setApprovalOpenByThread({
      ...approvalOpenByThread,
      [threadIdToToggle]: !Boolean(approvalOpenByThread[threadIdToToggle]),
    });
  };

  const toggleDiscussAction = (targetThreadId?: string) => {
    const threadIdToToggle = targetThreadId ?? selectedThread?.id;
    if (!threadIdToToggle) return;
    setDiscussOpenByThread({
      ...discussOpenByThread,
      [threadIdToToggle]: !Boolean(discussOpenByThread[threadIdToToggle]),
    });
  };

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (!selectedThread) return;

      if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        if (!visibleFiltered.length) return;
        event.preventDefault();
        navigateVisibleThreads(event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1);
        return;
      }

      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "n") {
        event.preventDefault();
        setComposerMode("compose");
        return;
      }

      if ((event.metaKey || event.ctrlKey) && key === "d") {
        event.preventDefault();
        archiveThread(selectedThread.id);
        return;
      }

      if (event.altKey || event.shiftKey || event.metaKey || event.ctrlKey) return;

      if (key === "a") {
        event.preventDefault();
        toggleApprovalAction(selectedThread.id);
        return;
      }

      if (key === "d") {
        event.preventDefault();
        toggleDiscussAction(selectedThread.id);
        return;
      }

      if (key === "r") {
        event.preventDefault();
        setReminder("1h", selectedThread.id);
        return;
      }

      if (key === "w") {
        event.preventDefault();
        toggleThreadWatch(selectedThread.id);
        return;
      }

      if (key === "s") {
        event.preventDefault();
        markThreadReviewed(selectedThread.id);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [
    approvalOpenByThread,
    archiveThread,
    discussOpenByThread,
    markThreadReviewed,
    navigateVisibleThreads,
    selectedThread,
    visibleFiltered,
    watchStateByThread,
  ]);

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

  const createDefaultQuickTaskDraft = useCallback(
    (taskTitle: string): QuickTaskDraft => ({
      project: selectedThread?.project ?? "Project",
      status: "Open",
      priority: selectedThread?.priority ?? "High",
      due: "Today",
      label: selectedThread?.intentTag ?? selectedThread?.tags[0] ?? "Follow-up",
      assigneeId: contactCards.find((contact) => contact.name === selectedThread?.owner)?.id ?? contactCards[0]?.id ?? "",
      assigneeQuery: "",
    }),
    [selectedThread],
  );

  const getQuickTaskDraft = useCallback(
    (taskTitle: string) => quickTaskDrafts[taskTitle] ?? createDefaultQuickTaskDraft(taskTitle),
    [createDefaultQuickTaskDraft, quickTaskDrafts],
  );

  const updateQuickTaskDraft = (taskTitle: string, updates: Partial<QuickTaskDraft>) => {
    if (!selectedThread) return;
    const current = getQuickTaskDraft(taskTitle);

    setQuickTaskDraftsByThread({
      ...quickTaskDraftsByThread,
      [selectedThread.id]: {
        ...quickTaskDrafts,
        [taskTitle]: {
          ...current,
          ...updates,
        },
      },
    });
  };

  const addQuickTask = (titleOverride?: string) => {
    if (!selectedThread) return;
    const title = (titleOverride ?? taskInput).trim();
    if (!title) return;

    const nextTask: AddedTask = {
      id: `${selectedThread.id}-${Date.now()}`,
      title,
      status: "Open",
      due: "Today",
      priority: selectedThread.priority,
      source: selectedThread.source,
      provenance: selectedThread.provenance[0] ?? "Thread context",
      owner: selectedThread.owner,
      project: selectedThread.project,
      label: selectedThread.intentTag ?? selectedThread.tags[0] ?? "Follow-up",
    };

    setAddedTasksByThread({
      ...addedTasksByThread,
      [selectedThread.id]: [nextTask, ...addedTasks],
    });
    setTaskInputByThread({ ...taskInputByThread, [selectedThread.id]: "" });
    setExpandedSuggestedTaskByThread({ ...expandedSuggestedTaskByThread, [selectedThread.id]: null });
    toast("Task added");
  };

  const addConfiguredQuickTask = (taskTitle: string) => {
    if (!selectedThread) return;

    const draft = getQuickTaskDraft(taskTitle);
    const assignee = contactCards.find((contact) => contact.id === draft.assigneeId);
    const nextTask: AddedTask = {
      id: `${selectedThread.id}-${Date.now()}`,
      title: taskTitle,
      status: draft.status,
      due: draft.due,
      priority: draft.priority,
      source: selectedThread.source,
      provenance: `${draft.project} · ${draft.label}`,
      owner: assignee?.name ?? selectedThread.owner,
      project: draft.project,
      label: draft.label,
    };

    setAddedTasksByThread({
      ...addedTasksByThread,
      [selectedThread.id]: [nextTask, ...addedTasks],
    });
    setExpandedSuggestedTaskByThread({ ...expandedSuggestedTaskByThread, [selectedThread.id]: null });
    toast("Task added", {
      description: `${draft.status} · ${draft.priority} · ${draft.due}`,
    });
  };

  const toggleSuggestedTaskTray = (taskTitle: string) => {
    if (!selectedThread) return;
    setExpandedSuggestedTaskByThread({
      ...expandedSuggestedTaskByThread,
      [selectedThread.id]: expandedSuggestedTask === taskTitle ? null : taskTitle,
    });
  };

  const applyArtifactSuggestion = (artifact: ArtifactSuggestion) => {
    if (!selectedThread) return;

    const nextDraft = currentDraftText.trim()
      ? artifact.id.endsWith("-draft")
        ? `${currentDraftText.trim()}\n\n${artifact.template}`
        : currentDraftText.includes(artifact.title)
          ? currentDraftText
          : `${currentDraftText.trim()}\n\nAttaching ${artifact.title} for reference.`
      : artifact.template;

    setCurrentDraftText(nextDraft);
    toast("Composer updated", {
      description: artifact.id.endsWith("-draft") ? "Suggested draft inserted." : `${artifact.title} referenced in the reply.`,
    });
  };

  const addRecipientContact = (slot: RecipientSlot, contactId: string) => {
    if (!selectedThread) return;

    const updater = slot === "cc" ? setEmailCcByThread : setEmailBccByThread;
    const nextByThread = slot === "cc" ? emailCcByThread : emailBccByThread;
    const currentIds = slot === "cc" ? emailCc : emailBcc;
    updater({
      ...nextByThread,
      [selectedThread.id]: currentIds.includes(contactId) ? currentIds : [...currentIds, contactId],
    });
    setRecipientQueryByThread({
      ...recipientQueryByThread,
      [selectedThread.id]: "",
    });
    setRecipientPicker(null);
  };

  const removeRecipientContact = (slot: RecipientSlot, contactId: string) => {
    if (!selectedThread) return;

    const updater = slot === "cc" ? setEmailCcByThread : setEmailBccByThread;
    const nextByThread = slot === "cc" ? emailCcByThread : emailBccByThread;
    const currentIds = slot === "cc" ? emailCc : emailBcc;
    updater({
      ...nextByThread,
      [selectedThread.id]: currentIds.filter((id) => id !== contactId),
    });
  };

  const focusReplyComposer = () => {
    replySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => {
      const textarea = replySectionRef.current?.querySelector("textarea");
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus();
      }
    });
  };

  const setComposerMode = (mode: ComposerMode) => {
    if (!selectedThread) return;

    setComposerModeByThread({
      ...composerModeByThread,
      [selectedThread.id]: mode,
    });
    setEmailMetaByThread({
      ...emailMetaByThread,
      [selectedThread.id]: {
        to: emailMeta.to,
        subject: mode === "compose" ? selectedThread.subject : `Re: ${selectedThread.subject}`,
      },
    });
    focusReplyComposer();
  };

  const sendEmailReply = () => {
    if (!selectedThread) return;
    const recipient = emailMeta.to.trim() || defaultReplyTo(selectedThread);
    const recipientCount = 1 + emailCc.length + emailBcc.length;
    toast("Email draft ready", {
      description: `Prepared for ${recipient} (${recipientCount} recipient${recipientCount === 1 ? "" : "s"}).`,
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

  const senderContact = selectedThread ? findContactCard(selectedThread.sender) : undefined;
  const threadContacts = useMemo(() => {
    if (!selectedThread) return [];

    const orderedNames = Array.from(new Set([selectedThread.sender, selectedThread.owner, ...selectedThread.participants]));
    return orderedNames.map((name) => ({
      name,
      contact: findContactCard(name),
    }));
  }, [selectedThread]);
  const ccContacts = useMemo(
    () =>
      emailCc
        .map((id) => contactCards.find((contact) => contact.id === id))
        .filter((contact): contact is (typeof contactCards)[number] => Boolean(contact)),
    [emailCc],
  );
  const bccContacts = useMemo(
    () =>
      emailBcc
        .map((id) => contactCards.find((contact) => contact.id === id))
        .filter((contact): contact is (typeof contactCards)[number] => Boolean(contact)),
    [emailBcc],
  );
  const ccPreviews = useMemo(
    () => (selectedThread ? buildRecipientPreviews(selectedThread, "cc", ccContacts) : []),
    [ccContacts, selectedThread],
  );
  const bccPreviews = useMemo(
    () => (selectedThread ? buildRecipientPreviews(selectedThread, "bcc", bccContacts) : []),
    [bccContacts, selectedThread],
  );
  const latestThreadMessage = selectedThread?.timeline[0] ?? null;
  const olderThreadMessages = useMemo(
    () => (selectedThread?.timeline.slice(1) ?? []).reverse(),
    [selectedThread],
  );
  const composerMinHeight = useMemo(() => {
    const draft = currentDraftText.trim();
    if (!draft) return 180;
    const estimatedLines = draft.split("\n").length + Math.ceil(draft.length / 130);
    return Math.min(320, Math.max(180, 72 + estimatedLines * 18));
  }, [currentDraftText]);

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
      <Card size="sm" className="surface-card">
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

  const commandRailClass =
    "flex w-full items-center gap-1 overflow-x-auto border border-border/70 bg-muted/30 px-1.5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  const commandRailGroupClass =
    "flex shrink-0 items-center gap-1";
  const commandRailDividerClass = "h-4 w-px shrink-0 bg-border/80";
  const commandRailButtonClass =
    "inline-flex h-7 shrink-0 items-center gap-1 border border-transparent px-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-background hover:text-foreground motion-reduce:transition-none";
  const commandRailIconButtonClass =
    "inline-flex size-7 shrink-0 items-center justify-center border border-transparent text-foreground/75 transition-colors hover:bg-background hover:text-foreground motion-reduce:transition-none";
  const commandRailActiveButtonClass =
    "border-border/70 bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground";
  const commandRailPrimaryButtonClass =
    "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground";
  const commandRailShortcutClass =
    "inline-flex min-w-[1.3rem] items-center justify-center border border-border/70 bg-background px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground";
  const quickTaskStripButtonClass =
    "inline-flex h-8 items-center gap-2 border border-border/70 bg-background px-2.5 text-xs text-foreground transition-colors hover:bg-secondary/35";
  const quickTaskStatusOptions = ["Open", "In progress", "Waiting"];
  const quickTaskPriorityOptions = ["Critical", "High", "Medium", "Low"];
  const quickTaskDueOptions = ["Today", "Tomorrow", "This week"];
  const quickTaskLabelOptions = Array.from(new Set([selectedThread?.intentTag, ...(selectedThread?.tags ?? []), "Follow-up"].filter(Boolean)));

  const renderThreadBubble = (message: NormalizedInboxThread["timeline"][number], muted = false) => {
    const messageContact = findContactCard(message.sender);

    return (
      <div key={message.id} className="flex items-start gap-3">
        <Avatar className="mt-1 border border-border/70 bg-background" size="lg">
          <AvatarImage alt={message.sender} src={messageContact?.avatarSrc} />
          <AvatarFallback>{messageContact?.avatarFallback ?? getInitials(message.sender)}</AvatarFallback>
        </Avatar>
        <div className={cn("min-w-0 flex-1 border border-border/70 px-4 py-3", muted ? "bg-muted/20" : "bg-background")}>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{message.sender}</p>
            <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{message.role}</span>
            <span className="ml-auto text-xs text-muted-foreground">{message.time}</span>
          </div>
          <p className="mt-3 text-sm leading-7 text-foreground">{message.body}</p>
          {message.summary ? <p className="mt-2 text-sm text-muted-foreground">{message.summary}</p> : null}
          {message.attachments?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.attachments.map((attachment) => (
                <Badge key={attachment} variant="outline" className="gap-2 px-2.5 py-1 text-foreground">
                  <FileMark filename={attachment} />
                  {attachment}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden px-3 py-4 lg:px-6 lg:py-5">
      <PageContainer className="h-full min-h-0">
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div
            className={cn(
              "grid min-h-0 flex-1 gap-4",
              secondaryRailCollapsed ? "xl:grid-cols-[minmax(0,1fr)]" : "xl:grid-cols-[320px_minmax(0,1fr)]",
            )}
          >
	            {!secondaryRailCollapsed ? (
	              <aside className="flex min-h-0 flex-col overflow-hidden border border-border/70 bg-card shadow-sm">
	                <div className="border-b border-border/60 px-4 py-4">
	                  <ToggleGroup
	                    type="single"
	                    value={railScope}
	                    onValueChange={(value) => value && setRailScope(value as RailScope)}
	                    className="flex w-full"
	                  >
                    <ToggleGroupItem value="unread" className="flex flex-1 items-center justify-between gap-2 px-3">
                      <span>Unread</span>
                      <span className="text-[11px] text-current/70">{railCounts.unread}</span>
                    </ToggleGroupItem>
                    <ToggleGroupItem value="sent" className="flex flex-1 items-center justify-between gap-2 px-3">
                      <span>Sent</span>
                      <span className="text-[11px] text-current/70">{railCounts.sent}</span>
                    </ToggleGroupItem>
                  </ToggleGroup>

                  <SidebarInput
                    aria-label="Search inbox threads"
                    className="mt-3 h-10"
                    placeholder="Type to search..."
                    value={filterPrompt}
                    onChange={(event) => setFilterPrompt(event.target.value)}
                  />
                </div>

                <ScrollArea className="min-h-0 flex-1">
                  {visibleFiltered.length ? (
                    <div className="flex flex-col">
                      {visibleFiltered.map((thread) => {
                        const selected = selectedThread?.id === thread.id;
                        const isUnread = isThreadUnread(thread);
                        const isWatched = Boolean(watchStateByThread[thread.id] || reminderByThreadId[thread.id]);
                        return (
                          <div
                            key={thread.id}
                            className={cn(
                              "group border-b border-border/60 px-4 py-4 transition-colors",
                              selected ? "bg-primary/5" : "hover:bg-secondary/35",
                            )}
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
                            <div className="flex items-start gap-3">
                              <span className={cn("mt-2 size-2 shrink-0 rounded-full", isUnread ? "bg-primary" : "bg-border")} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-[15px] text-foreground">{thread.sender}</p>
                                  <span className="ml-auto text-sm text-foreground/70">{thread.time}</span>
                                </div>
                                <p className="mt-1 line-clamp-2 text-[17px] font-medium leading-6 text-foreground">{thread.subject}</p>
                                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">{thread.preview}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                  <Badge variant="outline">{thread.account}</Badge>
                                  {thread.approvalRequired ? <StatusPill tone="alert">Needs approval</StatusPill> : null}
                                  {isWatched ? <StatusPill tone="muted">Watched</StatusPill> : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="px-4 py-6">
                      <p className="text-sm text-muted-foreground">No emails match this view yet.</p>
                    </div>
                  )}
                </ScrollArea>
              </aside>
            ) : null}

            <section className="flex min-h-0 flex-col overflow-hidden border border-border/70 bg-card shadow-sm">
              {selectedThread ? (
                <div className="grid min-h-0 flex-1 gap-4 overflow-hidden px-4 py-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                  <ScrollArea className="min-h-0">
                    <div className="flex flex-col gap-4 pr-2">
                      <div className="border-b border-border/60 pb-4">
                        <div className="flex flex-col gap-4">
                          <div className="flex w-full">
                            <p className="sr-only">Actions</p>
                            <div className={commandRailClass}>
                              <div className={commandRailGroupClass}>
                                <button
                                  aria-label={secondaryRailCollapsed ? "Expand inbox sidebar" : "Collapse inbox sidebar"}
                                  className={commandRailIconButtonClass}
                                  onClick={() => setSecondaryRailCollapsed(!secondaryRailCollapsed)}
                                  type="button"
                                >
                                  <SidebarSimpleIcon className="size-4" />
                                </button>
                                <span className={commandRailDividerClass} aria-hidden="true" />
                                <div className={cn(commandRailButtonClass, "cursor-default hover:bg-transparent hover:text-foreground/80")}>
                                  <span>Navigate</span>
                                  <span className={commandRailShortcutClass}>←→</span>
                                </div>
                              </div>

                              <span className={commandRailDividerClass} aria-hidden="true" />

                              <div className={cn(commandRailGroupClass, "min-w-0 flex-1 justify-between pr-1")}>
                                <button
                                  className={cn(commandRailButtonClass, composerMode === "reply" && commandRailActiveButtonClass)}
                                  onClick={() => setComposerMode("reply")}
                                  type="button"
                                >
                                  Reply
                                </button>
                                <button
                                  className={cn(commandRailButtonClass, commandRailPrimaryButtonClass)}
                                  onClick={() => setComposerMode("compose")}
                                  type="button"
                                >
                                  <span>New</span>
                                  <span className={cn(commandRailShortcutClass, "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground")}>⌘N</span>
                                </button>
                                <button
                                  className={commandRailButtonClass}
                                  onClick={() => archiveThread(selectedThread.id)}
                                  type="button"
                                >
                                  <span>Delete</span>
                                  <span className={commandRailShortcutClass}>⌘D</span>
                                </button>
                                <button
                                  className={commandRailButtonClass}
                                  onClick={() => archiveThread(selectedThread.id)}
                                  type="button"
                                >
                                  <span>Arch</span>
                                </button>
                                <button
                                  className={cn(commandRailButtonClass, selectedThreadHasReminder && commandRailActiveButtonClass)}
                                  onClick={() => setReminder("1h", selectedThread.id)}
                                  type="button"
                                >
                                  <span>Remind</span>
                                  <span className={commandRailShortcutClass}>R</span>
                                </button>
                                <button
                                  className={cn(commandRailButtonClass, selectedThreadIsWatched && commandRailActiveButtonClass)}
                                  onClick={() => toggleThreadWatch(selectedThread.id)}
                                  type="button"
                                >
                                  <span>Watch</span>
                                  <span className={commandRailShortcutClass}>W</span>
                                </button>
                                <button
                                  className={cn(commandRailButtonClass, isRead && commandRailActiveButtonClass)}
                                  onClick={() => markThreadReviewed(selectedThread.id)}
                                  type="button"
                                >
                                  <span>Done</span>
                                  <span className={commandRailShortcutClass}>S</span>
                                </button>
                                <button
                                  aria-label={approvalOpen ? "Close approval and assign" : "Open approval and assign"}
                                  className={cn(commandRailButtonClass, approvalOpen && commandRailActiveButtonClass)}
                                  onClick={() => toggleApprovalAction(selectedThread.id)}
                                  type="button"
                                >
                                  <span>Approve</span>
                                  <span className={commandRailShortcutClass}>A</span>
                                </button>
                                <button
                                  aria-label={discussOpen ? "Close discuss panel" : "Open discuss panel"}
                                  className={cn(commandRailButtonClass, discussOpen && commandRailActiveButtonClass)}
                                  onClick={() => toggleDiscussAction(selectedThread.id)}
                                  type="button"
                                >
                                  <span>Discuss</span>
                                  <span className={commandRailShortcutClass}>D</span>
                                </button>
                              </div>

                              <span className={commandRailDividerClass} aria-hidden="true" />

                              <div className={commandRailGroupClass}>
                                <button
                                  aria-label="Open in Gmail"
                                  className={commandRailIconButtonClass}
                                  onClick={() => openInGmail(selectedThread.id)}
                                  type="button"
                                >
                                  <Gmail className="size-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <h2 className="max-w-4xl text-[22px] leading-tight text-foreground md:text-[26px]">{selectedThread.subject}</h2>
                        </div>

                        <div className="mt-4 grid gap-4 border border-border/70 bg-background px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
                          <div className="flex min-w-0 items-center gap-3">
                            <Avatar size="lg">
                              <AvatarImage alt={selectedThread.sender} src={senderContact?.avatarSrc} />
                              <AvatarFallback>{senderContact?.avatarFallback ?? getInitials(selectedThread.sender)}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">{selectedThread.sender}</p>
                              <p className="text-sm text-muted-foreground">{selectedThread.company}</p>
                            </div>
                          </div>

                          <div className="justify-self-center text-center">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">People on thread</p>
                            <AvatarGroup className="mt-2 justify-center">
                              {threadContacts.slice(0, 4).map((person) => (
                                <Avatar key={person.name} size="sm">
                                  <AvatarImage alt={person.name} src={person.contact?.avatarSrc} />
                                  <AvatarFallback>{person.contact?.avatarFallback ?? getInitials(person.name)}</AvatarFallback>
                                </Avatar>
                              ))}
                              {threadContacts.length > 4 ? <AvatarGroupCount className="size-6 text-xs">+{threadContacts.length - 4}</AvatarGroupCount> : null}
                            </AvatarGroup>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Received</p>
                            <p className="mt-1 text-sm text-foreground">{selectedThread.time}</p>
                          </div>
                        </div>

                        {approvalOpen || discussOpen ? (
                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
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
                          </div>
                        ) : null}
                      </div>

                      <div className="surface-well p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className={sectionLabelClass}>Ubik analysis</p>
                            <p className="mt-2 text-sm leading-6 text-foreground">{selectedThread.whyThisMatters}</p>
                          </div>
                          {selectedThread.approvalRequired ? <StatusPill tone="alert">Approval required</StatusPill> : null}
                        </div>
                        <div className="mt-3 flex flex-col gap-1 text-sm leading-6 text-foreground">
                          {threadInsights.map((line) => (
                            <p key={line}>- {line}</p>
                          ))}
                        </div>
                      </div>

                      <div className="surface-well p-4">
                        <div className="flex flex-col gap-3">
                          {olderThreadMessages.length ? (
                            <Collapsible
                              open={olderMessagesOpen}
                              onOpenChange={(open) =>
                                setOlderMessagesOpenByThread({
                                  ...olderMessagesOpenByThread,
                                  [selectedThread.id]: open,
                                })
                              }
                            >
                              <CollapsibleTrigger asChild>
                                <button className="flex w-fit items-center gap-2 border border-border/70 bg-background px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-secondary/35" type="button">
                                  {olderMessagesOpen ? "Hide older messages" : `View ${olderThreadMessages.length} older message${olderThreadMessages.length === 1 ? "" : "s"}`}
                                </button>
                              </CollapsibleTrigger>
                              <CollapsibleContent className="overflow-hidden pt-3 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down motion-reduce:data-[state=closed]:animate-none motion-reduce:data-[state=open]:animate-none">
                                <div className="flex flex-col gap-3">
                                  {olderThreadMessages.map((message) => renderThreadBubble(message, true))}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ) : null}
                          {latestThreadMessage ? renderThreadBubble(latestThreadMessage) : null}
                        </div>
                      </div>

	                      <div ref={replySectionRef} className="surface-well p-4">
	                        <div className="overflow-hidden border border-border/70 bg-background">
	                          <div className="border-b border-border/60 p-3">
	                            <div className="flex flex-wrap items-start justify-between gap-3">
	                              <div className="min-w-0 flex-1">
                                <p className={sectionLabelClass}>Subject</p>
                                {isSubjectEditing ? (
                                  <InputGroup className="mt-2 h-10 bg-background">
                                    <InputGroupInput onChange={(event) => setEmailSubject(event.target.value)} value={emailMeta.subject} />
                                    <InputGroupAddon align="inline-end">
                                      <InputGroupButton variant="ghost" size="icon-sm" onClick={() => setSubjectEditing(false)} type="button">
                                        <CheckSquareIcon />
                                      </InputGroupButton>
                                    </InputGroupAddon>
                                  </InputGroup>
                                ) : (
                                  <button className="mt-2 text-left text-sm text-foreground transition-colors hover:text-primary" onClick={() => setSubjectEditing(true)} type="button">
                                    {emailMeta.subject}
                                  </button>
                                )}
                              </div>
                              <Button variant="outline" size="sm" onClick={() => setSubjectEditing(!isSubjectEditing)} type="button">
                                {isSubjectEditing ? "Done" : "Edit"}
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-2 border-b border-border/60 p-3 md:grid-cols-2">
                            {([
                              ["Cc", "cc", ccContacts, ccPreviews],
                              ["Bcc", "bcc", bccContacts, bccPreviews],
                            ] as const).map(([label, slot, contacts]) => (
                              <div key={label} className="border border-border/60 bg-muted/20 px-3 py-2.5">
                                <div className="flex min-h-10 items-center justify-between gap-3">
                                  <div className="flex min-w-0 flex-1 items-center gap-3">
                                    <p className={cn(sectionLabelClass, "shrink-0")}>{label}</p>
                                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                                      {(slot === "cc" ? ccPreviews : bccPreviews).map((preview) => {
                                        const isActualRecipient = contacts.some((contact) => contact.name === preview.name);
                                        return (
                                          <button
                                            key={preview.key}
                                            className={cn(
                                              "inline-flex max-w-full items-center gap-2 border px-2 py-1 text-xs transition-colors",
                                              isActualRecipient
                                                ? "border-border bg-background text-foreground hover:border-primary/40"
                                                : "border-dashed border-border/70 bg-background/70 text-muted-foreground",
                                            )}
                                            onClick={() =>
                                              isActualRecipient ? removeRecipientContact(slot as RecipientSlot, contacts.find((contact) => contact.name === preview.name)?.id ?? "") : undefined
                                            }
                                            type="button"
                                          >
                                            <Avatar size="sm">
                                              <AvatarImage alt={preview.name} src={preview.avatarSrc} />
                                              <AvatarFallback>{preview.avatarFallback}</AvatarFallback>
                                            </Avatar>
                                            <span className="truncate">{preview.name}</span>
                                            {isActualRecipient ? <XIcon className="size-3 text-muted-foreground" /> : null}
                                          </button>
                                        );
                                      })}
                                      {!contacts.length ? <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Suggested</span> : null}
                                    </div>
                                  </div>
                                  <Popover key={slot} open={recipientPicker === slot} onOpenChange={(open) => setRecipientPicker(open ? slot : null)}>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="sm" type="button">
                                        Add {label}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent align="end" className="w-72">
                                      <div className="flex flex-col gap-3">
                                        <InputGroup className="h-10 bg-background">
                                          <InputGroupAddon>
                                            <InputGroupText>
                                              <MagnifyingGlassIcon />
                                            </InputGroupText>
                                          </InputGroupAddon>
                                          <InputGroupInput
                                            onChange={(event) =>
                                              setRecipientQueryByThread({
                                                ...recipientQueryByThread,
                                                [selectedThread.id]: event.target.value,
                                              })
                                            }
                                            value={recipientQuery}
                                          />
                                        </InputGroup>
                                        <div className="flex max-h-56 flex-col gap-1.5 overflow-auto">
                                          {selectableRecipientContacts.map((contact) => (
                                            <Button
                                              key={contact.id}
                                              variant="ghost"
                                              className="h-auto w-full justify-start gap-3 px-3 py-2 text-left"
                                              onClick={() => addRecipientContact(slot, contact.id)}
                                              type="button"
                                            >
                                              <Avatar size="sm">
                                                <AvatarImage alt={contact.name} src={contact.avatarSrc} />
                                                <AvatarFallback>{contact.avatarFallback}</AvatarFallback>
                                              </Avatar>
                                              <div className="min-w-0">
                                                <p className="text-sm text-foreground">{contact.name}</p>
                                                <p className="text-xs text-muted-foreground">{contact.role} · {contact.company}</p>
                                              </div>
                                            </Button>
                                          ))}
                                          {!selectableRecipientContacts.length ? (
                                            <p className="px-3 py-2 text-sm text-muted-foreground">No contacts match this search.</p>
                                          ) : null}
                                        </div>
                                      </div>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>
                            ))}
                          </div>

	                          <RichOperatorEditor
	                            className="border-0 bg-transparent shadow-none"
	                            minHeight={composerMinHeight}
                            onChange={setCurrentDraftText}
                            placeholder=""
                            showCopyActions={false}
                            showMarkdownCopy={false}
	                            showInsertBlock={false}
	                            value={currentDraftText}
	                          />

	                          <div className="border-t border-border/60 bg-background px-3 py-2.5">
	                            <div className="flex flex-wrap items-center gap-1.5 text-xs text-foreground/75">
	                              <Button variant="outline" size="sm" type="button">
	                                <PaperclipIcon data-icon="inline-start" /> Attach file
	                              </Button>
	                              <Button variant="outline" size="sm" type="button">
	                                <CalendarBlankIcon data-icon="inline-start" /> Meeting
	                              </Button>
	                              <Button variant="outline" size="sm" type="button">
	                                <FolderOpenIcon data-icon="inline-start" /> Drive
	                              </Button>
	                              <Button size="sm" className="ml-auto" onClick={sendEmailReply} type="button">
	                                <PaperPlaneTiltIcon data-icon="inline-start" /> Send
	                              </Button>
	                            </div>
	                          </div>

	                          <div className="border-t border-border/60 bg-muted/20 p-3">
	                            <div className="flex items-center justify-between gap-2">
	                              <p className={sectionLabelClass}>Suggested insertions</p>
                              <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Click to prefill</p>
                            </div>
                            <div className="mt-3 grid gap-2 md:grid-cols-2">
                              {artifactSuggestions.map((artifact) => {
                                const IconComponent = artifact.icon === "salesforce" ? Salesforce : Drive;
                                return (
                                  <HoverCard key={artifact.id} openDelay={100} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                      <button
                                        className="flex min-h-[76px] items-start gap-3 border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:border-primary/30 hover:bg-secondary/35"
                                        onClick={() => applyArtifactSuggestion(artifact)}
                                        type="button"
                                      >
                                        {artifact.preview === "chart" ? (
                                          <ChartBarIcon className="mt-0.5 size-5 shrink-0 text-foreground" />
                                        ) : artifact.kindLabel === "PDF" || artifact.kindLabel === "XLSX" ? (
                                          <FileMark filename={artifact.title} className="mt-0.5 size-5" />
                                        ) : (
                                          <IconComponent className="mt-0.5 size-5 shrink-0 text-foreground" />
                                        )}
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="truncate text-sm text-foreground">{artifact.title}</p>
                                            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{artifact.kindLabel}</span>
                                          </div>
                                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{artifact.subtitle}</p>
                                        </div>
                                      </button>
                                    </HoverCardTrigger>
                                    <HoverCardContent align="start" className="w-72">
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                          {artifact.preview === "chart" ? (
                                            <ChartBarIcon className="size-4 text-foreground" />
                                          ) : artifact.kindLabel === "PDF" || artifact.kindLabel === "XLSX" ? (
                                            <FileMark filename={artifact.title} className="size-4" />
                                          ) : (
                                            <IconComponent className="size-4 text-foreground" />
                                          )}
                                          <p className="text-sm font-medium text-foreground">{artifact.title}</p>
                                        </div>
                                        <p className="text-sm leading-6 text-muted-foreground">{artifact.hint}</p>
                                        <p className="text-xs leading-5 text-foreground/70">{artifact.template}</p>
                                      </div>
                                    </HoverCardContent>
                                  </HoverCard>
                                );
                              })}
	                            </div>
	                          </div>
	                        </div>
	                      </div>
	                    </div>
	                  </ScrollArea>

                  <ScrollArea className="min-h-0">
                    <div className="flex flex-col gap-3 pr-2">
                      <Surface className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className={sectionLabelClass}>Quick task</p>
                            <p className="mt-1 text-sm text-muted-foreground">Capture follow-through without leaving the thread.</p>
                          </div>
                          <Badge variant="outline">{suggestedTasks.length + addedTasks.length} items</Badge>
                        </div>
                        <div className="mt-3 flex flex-col gap-2">
                          {suggestedTasks.map((task) => {
                            const expanded = expandedSuggestedTask === task;
                            const taskDraft = getQuickTaskDraft(task);
                            const assignee = contactCards.find((contact) => contact.id === taskDraft.assigneeId);
                            const matchingAssignees = contactCards
                              .filter((contact) =>
                                `${contact.name} ${contact.role} ${contact.company}`
                                  .toLowerCase()
                                  .includes(taskDraft.assigneeQuery.toLowerCase().trim()),
                              )
                              .slice(0, taskDraft.assigneeQuery.trim() ? 4 : 0);
                            return (
                              <Card key={task} size="sm" className="surface-card border-border/70 bg-background">
                                <CardContent className="pt-0">
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                      <p className="text-sm text-foreground">{task}</p>
                                      <p className="mt-1 text-xs text-muted-foreground">Detected from this thread. Add it directly or route it into project follow-through.</p>
                                    </div>
                                    <Button
                                      aria-label={expanded ? "Hide task actions" : "Show task actions"}
                                      variant={expanded ? "secondary" : "outline"}
                                      size="icon-sm"
                                      onClick={() => toggleSuggestedTaskTray(task)}
                                      type="button"
                                    >
                                      {expanded ? <CheckSquareIcon /> : <PlusIcon />}
                                    </Button>
                                  </div>
                                  {expanded ? (
                                    <div className="mt-3 flex flex-col gap-3">
                                      <div className="border border-border/60 bg-muted/20 p-2.5">
                                        <InputGroup className="h-9 bg-background">
                                          <InputGroupAddon>
                                            {assignee ? (
                                              <Avatar size="sm">
                                                <AvatarImage alt={assignee.name} src={assignee.avatarSrc} />
                                                <AvatarFallback>{assignee.avatarFallback}</AvatarFallback>
                                              </Avatar>
                                            ) : (
                                              <InputGroupText>
                                                <MagnifyingGlassIcon />
                                              </InputGroupText>
                                            )}
                                          </InputGroupAddon>
                                          <InputGroupInput
                                            onChange={(event) => updateQuickTaskDraft(task, { assigneeQuery: event.target.value })}
                                            placeholder="Search owner"
                                            value={taskDraft.assigneeQuery}
                                          />
                                        </InputGroup>
                                        {assignee ? (
                                          <p className="mt-2 text-xs text-muted-foreground">
                                            Assigned by Ubik to <span className="text-foreground">{assignee.name}</span>
                                          </p>
                                        ) : null}
                                        {matchingAssignees.length ? (
                                          <div className="mt-2 flex flex-wrap gap-1.5">
                                            {matchingAssignees.map((contact) => (
                                              <button
                                                key={contact.id}
                                                className="inline-flex items-center gap-1.5 border border-border/70 bg-background px-2 py-1 text-xs text-foreground transition-colors hover:bg-secondary/35"
                                                onClick={() => updateQuickTaskDraft(task, { assigneeId: contact.id, assigneeQuery: "" })}
                                                type="button"
                                              >
                                                <Avatar size="sm">
                                                  <AvatarImage alt={contact.name} src={contact.avatarSrc} />
                                                  <AvatarFallback>{contact.avatarFallback}</AvatarFallback>
                                                </Avatar>
                                                <span>{contact.name}</span>
                                              </button>
                                            ))}
                                          </div>
                                        ) : null}
                                      </div>

                                      <div className="flex flex-wrap gap-1.5">
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button className={quickTaskStripButtonClass} type="button">
                                              <FolderOpenIcon className="size-4" />
                                              <span>{taskDraft.project}</span>
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="start">
                                            {[
                                              selectedThread.project,
                                              selectedThread.account,
                                              "Inbox follow-through",
                                            ].map((option) => (
                                              <DropdownMenuItem key={option} onSelect={() => updateQuickTaskDraft(task, { project: option })}>
                                                {option}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>

                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button className={quickTaskStripButtonClass} type="button">
                                              <SquareIcon className="size-4" />
                                              <span>{taskDraft.status}</span>
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="start">
                                            {quickTaskStatusOptions.map((option) => (
                                              <DropdownMenuItem key={option} onSelect={() => updateQuickTaskDraft(task, { status: option })}>
                                                {option}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>

                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button className={quickTaskStripButtonClass} type="button">
                                              <ArrowUpIcon className="size-4" />
                                              <span>{taskDraft.priority}</span>
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="start">
                                            {quickTaskPriorityOptions.map((option) => (
                                              <DropdownMenuItem key={option} onSelect={() => updateQuickTaskDraft(task, { priority: option })}>
                                                {option}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>

                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button className={quickTaskStripButtonClass} type="button">
                                              <CalendarBlankIcon className="size-4" />
                                              <span>{taskDraft.due}</span>
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="start">
                                            {quickTaskDueOptions.map((option) => (
                                              <DropdownMenuItem key={option} onSelect={() => updateQuickTaskDraft(task, { due: option })}>
                                                {option}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>

                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <button className={quickTaskStripButtonClass} type="button">
                                              <TagIcon className="size-4" />
                                              <span>{taskDraft.label}</span>
                                            </button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="start">
                                            {quickTaskLabelOptions.map((option) => (
                                              <DropdownMenuItem key={option} onSelect={() => updateQuickTaskDraft(task, { label: option })}>
                                                {option}
                                              </DropdownMenuItem>
                                            ))}
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>

                                      <Button size="sm" variant="outline" onClick={() => addConfiguredQuickTask(task)} type="button">
                                        <CheckSquareIcon data-icon="inline-start" /> Add task
                                      </Button>
                                    </div>
                                  ) : null}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>

                        <InputGroup className="mt-2 h-10 bg-background">
                          <InputGroupInput
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
                            placeholder="Capture another task"
                            value={taskInput}
                          />
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton variant="ghost" size="icon-sm" onClick={addQuickTask} type="button">
                              <PaperPlaneTiltIcon />
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                        {addedTasks.length ? (
                          <div className="mt-3 flex flex-col gap-1.5">
                            {addedTasks.map((task) => (
                              <Card key={task.id} size="sm" className="surface-card">
                                <CardContent className="pt-0">
                                  <p className="line-clamp-2 text-sm text-foreground">{task.title}</p>
                                  <p className="mt-1 text-foreground/70">
                                    {task.status} · Due {task.due} · <span className="font-medium text-primary">{task.priority}</span>
                                  </p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {task.project} · {task.label} · {task.owner}
                                  </p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-3 text-xs text-muted-foreground">No tasks added yet. Use the detected items above or capture a new one.</p>
                        )}
                      </Surface>
                    </div>
                  </ScrollArea>
              </div>
            ) : (
              <div className="px-5 py-6">
                <p className="text-sm text-muted-foreground">No selected thread.</p>
              </div>
            )}
          </section>
        </div>
      </div>
      </PageContainer>
    </div>
  );
}
