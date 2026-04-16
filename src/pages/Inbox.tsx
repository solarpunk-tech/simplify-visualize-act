import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Archive,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock3,
  EllipsisVertical,
  FolderOpen,
  Mail,
  MessageSquare,
  Paperclip,
  Plus,
  Search,
  SendHorizontal,
  Square,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { RichOperatorEditor } from "@/components/rich-operator-editor";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "@/components/ui/sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { contactCards, inboxThreads } from "@/lib/ubik-data";
import type { ContactCard, InboxThread } from "@/lib/ubik-types";
import { cn } from "@/lib/utils";

type BuiltInBucketId =
  | "all"
  | "unread"
  | "attention"
  | "approval"
  | "waiting"
  | "watched"
  | "reviewed"
  | "attachments"
  | "delegated";

type InboxBucketSelection =
  | { kind: "system"; id: BuiltInBucketId }
  | { kind: "customer"; id: string };

type CustomerBucket = {
  id: string;
  name: string;
  normalizedName: string;
  createdAt: number;
};

type AddedTask = {
  id: string;
  title: string;
  status: "Open";
  due: "Today";
  priority: InboxThread["priority"];
  source: InboxThread["source"];
  provenance: string;
};

type NormalizedInboxThread = Omit<InboxThread, "provenance"> & {
  provenance: string[];
  status: "Action required" | "Waiting" | "Reviewed";
  approvalRequired: boolean;
  isUnread: boolean;
  domainTag?: string;
  intentTag?: string;
  searchIndex: string;
};

const sectionLabelClass = "font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/70";
const railRowBaseClass =
  "group flex w-full items-center border-b pl-3 pr-2 transition-colors";
const denseActionButtonClass =
  "inline-flex h-9 items-center justify-center gap-1.5 border border-border bg-background px-3 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-[hsl(var(--foreground)/0.03)]";
const rowActionButtonClass =
  "inline-flex h-7 items-center gap-1 font-mono text-[10px] uppercase tracking-[0.08em] text-foreground/68 transition-colors hover:text-foreground";
const squareTagClass =
  "inline-flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em]";
const roundedMetaPillClass =
  "inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-3 py-1.5 text-[13px] text-foreground/78";
const workspaceCountClass =
  "inline-flex items-center border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/62";

function normalizeBucketText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function buildCustomerBucketId(name: string) {
  const slug = normalizeBucketText(name).replace(/\s+/g, "-").slice(0, 32) || "bucket";
  return `customer-${slug}-${Date.now()}`;
}

function buildCustomerBucket(name: string): CustomerBucket {
  return {
    id: buildCustomerBucketId(name),
    name: name.trim(),
    normalizedName: normalizeBucketText(name),
    createdAt: Date.now(),
  };
}

function parseClockValue(value: string) {
  const trimmed = value.trim();
  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    const hourBase = Number(ampmMatch[1]) % 12;
    const minute = Number(ampmMatch[2]);
    const isPm = ampmMatch[3].toUpperCase() === "PM";
    return (hourBase + (isPm ? 12 : 0)) * 60 + minute;
  }

  const clockMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (clockMatch) {
    return Number(clockMatch[1]) * 60 + Number(clockMatch[2]);
  }

  return 0;
}

function buildThreadStatus(thread: InboxThread) {
  return (
    thread.status ??
    (thread.followUpStatus === "auto_handled" || thread.approvalStatus === "approved"
      ? "Reviewed"
      : thread.waitingState.toLowerCase().includes("watch") || thread.delegationStatus === "delegated"
        ? "Waiting"
        : "Action required")
  );
}

function buildThreadSearchIndex(
  thread: InboxThread,
  normalizedProvenance: string[],
  domainTag?: string,
  intentTag?: string,
) {
  return normalizeBucketText(
    [
      thread.sender,
      thread.company,
      thread.subject,
      thread.preview,
      thread.account,
      thread.project,
      thread.source,
      thread.waitingState,
      thread.tags.join(" "),
      domainTag ?? "",
      intentTag ?? "",
      normalizedProvenance.join(" "),
    ].join(" "),
  );
}

function defaultReplyTo(thread: NormalizedInboxThread) {
  return thread.sender;
}

function synthesizeThreadInsights(thread: NormalizedInboxThread) {
  const lines = [
    `${thread.priority} priority signal in ${thread.account}. Queue posture: ${thread.waitingState}.`,
    `${thread.dueRisk}. Last material change at ${thread.lastMaterialChangeAt}, last reviewed ${thread.lastReviewedAt}.`,
  ];

  if (thread.linkedWorkflow) {
    lines.push(
      `Linked workflow ${thread.linkedWorkflow.label} is ${thread.linkedWorkflow.status}. Next step: ${thread.linkedWorkflow.nextStep}.`,
    );
  }

  if (thread.linkedTask) {
    lines.push(`Linked task ${thread.linkedTask.label} is ${thread.linkedTask.status}.`);
  }

  if (thread.actionRecommendations.length) {
    lines.push(
      ...thread.actionRecommendations
        .slice(0, 2)
        .map((action) => `${action.label}: ${action.description}`),
    );
  }

  return lines;
}

function matchesCustomerBucket(thread: NormalizedInboxThread, normalizedName: string) {
  return normalizeBucketText(`${thread.account} ${thread.company}`).includes(normalizedName);
}

function SquareTag({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "alert" | "inverted";
  className?: string;
}) {
  const toneClass =
    tone === "alert"
      ? "border-primary text-primary"
      : tone === "inverted"
        ? "border-foreground bg-foreground text-background"
        : "border-border text-foreground/62";

  return <span className={cn(squareTagClass, toneClass, className)}>{children}</span>;
}

export default function Inbox() {
  const navigate = useNavigate();
  const location = useLocation();
  const { threadId } = useParams();
  const isMobile = useIsMobile();
  const { activeTabId, createTab, setPageState } = useShellState();
  const rowMenuRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);

  const [selectedBucket, setSelectedBucket] = useWorkbenchState<InboxBucketSelection>("inbox-bucket-selection", {
    kind: "system",
    id: "all",
  });
  const [searchQuery, setSearchQuery] = useWorkbenchState<string>("inbox-search", "");
  const [lastSelectedThreadId, setLastSelectedThreadId] = useWorkbenchState<string>(
    "inbox-selected-thread",
    inboxThreads[0]?.id ?? "",
  );
  const [customerBuckets, setCustomerBuckets] = useWorkbenchState<CustomerBucket[]>("inbox-customer-buckets", []);
  const [isCreateBucketOpen, setIsCreateBucketOpen] = useWorkbenchState<boolean>("inbox-create-bucket-open", false);
  const [newBucketName, setNewBucketName] = useWorkbenchState<string>("inbox-new-bucket-name", "");

  const [emailMetaByThread, setEmailMetaByThread] = useWorkbenchState<Record<string, { to: string; subject: string }>>(
    "inbox-email-meta",
    {},
  );
  const [emailCcByThread, setEmailCcByThread] = useWorkbenchState<Record<string, string>>("inbox-email-cc", {});
  const [emailBccByThread, setEmailBccByThread] = useWorkbenchState<Record<string, string>>("inbox-email-bcc", {});
  const [emailMetaOpenByThread, setEmailMetaOpenByThread] = useWorkbenchState<Record<string, boolean>>(
    "inbox-email-meta-open",
    {},
  );
  const [draftByThread, setDraftByThread] = useWorkbenchState<Record<string, string>>("inbox-draft-by-thread", {});

  const [reviewedStateByThread, setReviewedStateByThread] = useWorkbenchState<Record<string, boolean>>(
    "inbox-reviewed-state",
    {},
  );
  const [watchStateByThread, setWatchStateByThread] = useWorkbenchState<Record<string, boolean>>("inbox-watch-state", {});
  const [archiveStateByThread, setArchiveStateByThread] = useWorkbenchState<Record<string, boolean>>(
    "inbox-archive-state",
    {},
  );
  const [reminderByThreadId, setReminderByThreadId] = useWorkbenchState<Record<string, string | null>>(
    "inbox-reminder-by-thread",
    {},
  );
  const [rowRemindMenuThreadId, setRowRemindMenuThreadId] = useWorkbenchState<string | null>(
    "inbox-row-remind-menu-thread-id",
    null,
  );

  const [approvalOpenByThread, setApprovalOpenByThread] = useWorkbenchState<Record<string, boolean>>(
    "inbox-approval-open",
    {},
  );
  const [approvalQueryByThread, setApprovalQueryByThread] = useWorkbenchState<Record<string, string>>(
    "inbox-approval-query",
    {},
  );
  const [approvalSelectedByThread, setApprovalSelectedByThread] = useWorkbenchState<Record<string, string>>(
    "inbox-approval-selected",
    {},
  );
  const [approvalSentByThread, setApprovalSentByThread] = useWorkbenchState<Record<string, boolean>>(
    "inbox-approval-sent",
    {},
  );
  const [discussOpenByThread, setDiscussOpenByThread] = useWorkbenchState<Record<string, boolean>>(
    "inbox-discuss-open",
    {},
  );
  const [discussQueryByThread, setDiscussQueryByThread] = useWorkbenchState<Record<string, string>>(
    "inbox-discuss-query",
    {},
  );
  const [discussSelectedByThread, setDiscussSelectedByThread] = useWorkbenchState<Record<string, string>>(
    "inbox-discuss-selected",
    {},
  );
  const [discussSentByThread, setDiscussSentByThread] = useWorkbenchState<Record<string, boolean>>(
    "inbox-discuss-sent",
    {},
  );

  const [taskInputEnabledByThread, setTaskInputEnabledByThread] = useWorkbenchState<Record<string, boolean>>(
    "inbox-task-input-enabled",
    {},
  );
  const [taskInputByThread, setTaskInputByThread] = useWorkbenchState<Record<string, string>>("inbox-task-input", {});
  const [addedTasksByThread, setAddedTasksByThread] = useWorkbenchState<Record<string, AddedTask[]>>(
    "inbox-added-tasks",
    {},
  );
  const [threadMessagesOpenByThread, setThreadMessagesOpenByThread] = useWorkbenchState<Record<string, boolean>>(
    "inbox-thread-messages-open",
    {},
  );

  const normalizedThreads = useMemo<NormalizedInboxThread[]>(
    () =>
      inboxThreads.map((thread) => {
        const approvalRequired = thread.approvalRequired ?? thread.approvalStatus === "approval_required";
        const status = buildThreadStatus(thread);
        const normalizedProvenance = thread.provenance.map((item) => item.value);
        const domainTag = thread.domainTag ?? thread.tags[0];
        const intentTag =
          thread.intentTag ??
          (approvalRequired
            ? "Approval"
            : thread.followUpStatus === "overdue" || thread.followUpStatus === "due_soon"
              ? "Follow-up"
              : thread.delegationStatus === "delegated"
                ? "Delegated"
                : "Review");

        return {
          ...thread,
          provenance: normalizedProvenance,
          status,
          approvalRequired,
          isUnread:
            thread.isUnread ??
            (thread.priority === "Critical" ||
              thread.priority === "High" ||
              thread.followUpStatus === "due_soon" ||
              thread.followUpStatus === "overdue" ||
              thread.followUpStatus === "blocked_by_approval"),
          domainTag,
          intentTag,
          searchIndex: buildThreadSearchIndex(thread, normalizedProvenance, domainTag, intentTag),
        };
      }),
    [],
  );

  const isThreadUnread = useCallback(
    (thread: NormalizedInboxThread) => Boolean(thread.isUnread) && !reviewedStateByThread[thread.id],
    [reviewedStateByThread],
  );

  const isThreadWatched = useCallback(
    (thread: NormalizedInboxThread) =>
      Boolean(watchStateByThread[thread.id]) || thread.waitingState.toLowerCase().includes("watch"),
    [watchStateByThread],
  );

  const isThreadReviewed = useCallback(
    (thread: NormalizedInboxThread) =>
      Boolean(reviewedStateByThread[thread.id]) || !thread.isUnread || thread.status === "Reviewed",
    [reviewedStateByThread],
  );

  const isThreadDelegated = useCallback(
    (thread: NormalizedInboxThread) =>
      thread.delegationStatus === "delegated" || thread.waitingState.toLowerCase().includes("delegated"),
    [],
  );

  const filterThreadsBySystemBucket = useCallback(
    (threads: NormalizedInboxThread[], bucketId: BuiltInBucketId) => {
      if (bucketId === "all") return threads;
      if (bucketId === "unread") return threads.filter((thread) => isThreadUnread(thread));
      if (bucketId === "attention") {
        return threads.filter((thread) => thread.priority === "Critical" || thread.priority === "High");
      }
      if (bucketId === "approval") return threads.filter((thread) => thread.approvalRequired);
      if (bucketId === "waiting") return threads.filter((thread) => thread.status === "Waiting");
      if (bucketId === "watched") return threads.filter((thread) => isThreadWatched(thread));
      if (bucketId === "reviewed") return threads.filter((thread) => isThreadReviewed(thread));
      if (bucketId === "attachments") {
        return threads.filter((thread) => thread.attachmentPresence || thread.attachments.length > 0);
      }
      return threads.filter((thread) => isThreadDelegated(thread));
    },
    [isThreadDelegated, isThreadReviewed, isThreadUnread, isThreadWatched],
  );

  const activeThreads = useMemo(
    () => normalizedThreads.filter((thread) => !archiveStateByThread[thread.id]),
    [archiveStateByThread, normalizedThreads],
  );

  const builtInBuckets = useMemo(
    () =>
      ([
        ["all", "All mail"],
        ["unread", "Unread"],
        ["attention", "Needs attention"],
        ["approval", "Approval required"],
        ["waiting", "Waiting"],
        ["watched", "Watched"],
        ["reviewed", "Reviewed"],
        ["attachments", "With attachments"],
        ["delegated", "Delegated"],
      ] as [BuiltInBucketId, string][]).map(([id, label]) => ({
        id,
        label,
        count: filterThreadsBySystemBucket(activeThreads, id).length,
      })),
    [activeThreads, filterThreadsBySystemBucket],
  );

  const customerBucketsWithCounts = useMemo(
    () =>
      customerBuckets.map((bucket) => ({
        ...bucket,
        count: activeThreads.filter((thread) => matchesCustomerBucket(thread, bucket.normalizedName)).length,
      })),
    [activeThreads, customerBuckets],
  );

  const selectedCustomerBucket =
    selectedBucket.kind === "customer"
      ? customerBucketsWithCounts.find((bucket) => bucket.id === selectedBucket.id) ?? null
      : null;

  const selectedBucketLabel =
    selectedBucket.kind === "system"
      ? builtInBuckets.find((bucket) => bucket.id === selectedBucket.id)?.label ?? "All mail"
      : selectedCustomerBucket?.name ?? "Customer bucket";

  const searchTokens = useMemo(
    () => normalizeBucketText(searchQuery).split(" ").filter(Boolean),
    [searchQuery],
  );

  const bucketedThreads = useMemo(() => {
    if (selectedBucket.kind === "system") {
      return filterThreadsBySystemBucket(activeThreads, selectedBucket.id);
    }

    if (!selectedCustomerBucket) return activeThreads;
    return activeThreads.filter((thread) => matchesCustomerBucket(thread, selectedCustomerBucket.normalizedName));
  }, [activeThreads, filterThreadsBySystemBucket, selectedBucket, selectedCustomerBucket]);

  const visibleThreads = useMemo(() => {
    const filtered = !searchTokens.length
      ? bucketedThreads
      : bucketedThreads.filter((thread) => searchTokens.every((token) => thread.searchIndex.includes(token)));

    return [...filtered].sort((left, right) => {
      const leftRank =
        left.priority === "Critical"
          ? 0
          : left.approvalRequired
            ? 1
            : left.priority === "High"
              ? 2
              : left.followUpStatus === "overdue"
                ? 3
                : left.followUpStatus === "due_soon"
                  ? 4
                  : left.status === "Waiting"
                    ? 5
                    : isThreadDelegated(left)
                      ? 6
                      : isThreadWatched(left)
                        ? 7
                        : isThreadReviewed(left)
                          ? 8
                          : 9;

      const rightRank =
        right.priority === "Critical"
          ? 0
          : right.approvalRequired
            ? 1
            : right.priority === "High"
              ? 2
              : right.followUpStatus === "overdue"
                ? 3
                : right.followUpStatus === "due_soon"
                  ? 4
                  : right.status === "Waiting"
                    ? 5
                    : isThreadDelegated(right)
                      ? 6
                      : isThreadWatched(right)
                        ? 7
                        : isThreadReviewed(right)
                          ? 8
                          : 9;

      if (leftRank !== rightRank) return leftRank - rightRank;

      const leftChange = parseClockValue(left.lastMaterialChangeAt) || parseClockValue(left.time);
      const rightChange = parseClockValue(right.lastMaterialChangeAt) || parseClockValue(right.time);
      if (leftChange !== rightChange) return rightChange - leftChange;

      return normalizedThreads.findIndex((thread) => thread.id === left.id) - normalizedThreads.findIndex((thread) => thread.id === right.id);
    });
  }, [bucketedThreads, isThreadDelegated, isThreadReviewed, isThreadWatched, normalizedThreads, searchTokens]);

  const focusedThread = useMemo(
    () => visibleThreads.find((thread) => thread.id === lastSelectedThreadId) ?? visibleThreads[0] ?? null,
    [lastSelectedThreadId, visibleThreads],
  );

  const isDetailRoute = Boolean(threadId);
  const selectedThread = isDetailRoute
    ? visibleThreads.find((thread) => thread.id === threadId) ?? null
    : focusedThread;
  const selectedRawThread = inboxThreads.find((thread) => thread.id === selectedThread?.id) ?? null;

  const emailMeta = selectedThread
    ? emailMetaByThread[selectedThread.id] ?? {
        to: defaultReplyTo(selectedThread),
        subject: `Re: ${selectedThread.subject}`,
      }
    : { to: "", subject: "" };
  const emailCc = selectedThread ? emailCcByThread[selectedThread.id] ?? "" : "";
  const emailBcc = selectedThread ? emailBccByThread[selectedThread.id] ?? "" : "";
  const currentDraftText = selectedThread ? draftByThread[selectedThread.id] ?? "" : "";
  const emailMetaOpen = selectedThread ? Boolean(emailMetaOpenByThread[selectedThread.id]) : false;
  const suggestedReply = selectedThread?.recommendedReply ?? "";

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
  const addedTasks = useMemo(
    () => (selectedThread ? addedTasksByThread[selectedThread.id] ?? [] : []),
    [addedTasksByThread, selectedThread],
  );

  const matchingContacts = useMemo(() => {
    const normalizedQuery = approvalQuery.toLowerCase().trim();
    if (!normalizedQuery) return contactCards;
    return contactCards.filter((contact) =>
      `${contact.name} ${contact.role} ${contact.company}`.toLowerCase().includes(normalizedQuery),
    );
  }, [approvalQuery]);

  const matchingDiscussContacts = useMemo(() => {
    const normalizedQuery = discussQuery.toLowerCase().trim();
    if (!normalizedQuery) return contactCards;
    return contactCards.filter((contact) =>
      `${contact.name} ${contact.role} ${contact.company}`.toLowerCase().includes(normalizedQuery),
    );
  }, [discussQuery]);

  const selectedThreadInsights = selectedThread ? synthesizeThreadInsights(selectedThread) : [];
  const threadMessagesOpen =
    selectedThread ? threadMessagesOpenByThread[selectedThread.id] ?? !isMobile : false;

  const selectedDetailIndex = selectedThread
    ? visibleThreads.findIndex((thread) => thread.id === selectedThread.id)
    : -1;
  const previousThread =
    selectedDetailIndex >= 0 && visibleThreads.length > 1
      ? visibleThreads[(selectedDetailIndex - 1 + visibleThreads.length) % visibleThreads.length]
      : null;
  const nextThread =
    selectedDetailIndex >= 0 && visibleThreads.length > 1
      ? visibleThreads[(selectedDetailIndex + 1) % visibleThreads.length]
      : null;

  const setCurrentDraftText = useCallback(
    (nextValue: string) => {
      if (!selectedThread) return;
      setDraftByThread({ ...draftByThread, [selectedThread.id]: nextValue });
    },
    [draftByThread, selectedThread, setDraftByThread],
  );

  const setEmailTo = (nextValue: string) => {
    if (!selectedThread) return;
    setEmailMetaByThread({
      ...emailMetaByThread,
      [selectedThread.id]: {
        to: nextValue,
        subject: emailMeta.subject,
      },
    });
  };

  const setEmailSubject = (nextValue: string) => {
    if (!selectedThread) return;
    setEmailMetaByThread({
      ...emailMetaByThread,
      [selectedThread.id]: {
        to: emailMeta.to,
        subject: nextValue,
      },
    });
  };

  const setEmailCc = (nextValue: string) => {
    if (!selectedThread) return;
    setEmailCcByThread({ ...emailCcByThread, [selectedThread.id]: nextValue });
  };

  const setEmailBcc = (nextValue: string) => {
    if (!selectedThread) return;
    setEmailBccByThread({ ...emailBccByThread, [selectedThread.id]: nextValue });
  };

  const openThreadDetail = useCallback(
    (nextThreadId: string) => {
      setLastSelectedThreadId(nextThreadId);
      setRowRemindMenuThreadId(null);
      navigate({
        pathname: `/inbox/${nextThreadId}`,
        search: location.search,
      });
    },
    [location.search, navigate, setLastSelectedThreadId, setRowRemindMenuThreadId],
  );

  const returnToList = useCallback(() => {
    navigate({
      pathname: "/inbox",
      search: location.search,
    });
  }, [location.search, navigate]);

  const navigateBetweenThreads = useCallback(
    (direction: -1 | 1) => {
      if (!selectedThread || visibleThreads.length < 2) return;
      const currentIndex = visibleThreads.findIndex((thread) => thread.id === selectedThread.id);
      if (currentIndex < 0) return;
      const nextIndex = (currentIndex + direction + visibleThreads.length) % visibleThreads.length;
      const nextTarget = visibleThreads[nextIndex];
      if (!nextTarget) return;
      openThreadDetail(nextTarget.id);
    },
    [openThreadDetail, selectedThread, visibleThreads],
  );

  const markThreadReviewed = useCallback(
    (targetThreadId?: string) => {
      const threadIdToReview = targetThreadId ?? selectedThread?.id;
      if (!threadIdToReview) return;
      setReviewedStateByThread({ ...reviewedStateByThread, [threadIdToReview]: true });
      toast("Thread marked reviewed");
    },
    [reviewedStateByThread, selectedThread, setReviewedStateByThread],
  );

  const toggleWatchThread = useCallback(
    (targetThreadId?: string) => {
      const threadIdToWatch = targetThreadId ?? selectedThread?.id;
      if (!threadIdToWatch) return;
      const nextWatched = !watchStateByThread[threadIdToWatch];
      setWatchStateByThread({ ...watchStateByThread, [threadIdToWatch]: nextWatched });
      toast(nextWatched ? "Watching thread" : "Removed from watch", {
        description: nextWatched ? "This thread will stay visible in the Watched bucket." : "The manual watch has been removed.",
      });
    },
    [selectedThread, setWatchStateByThread, watchStateByThread],
  );

  const archiveThread = useCallback(
    (targetThreadId?: string) => {
      const threadIdToArchive = targetThreadId ?? selectedThread?.id;
      if (!threadIdToArchive) return;
      setArchiveStateByThread({ ...archiveStateByThread, [threadIdToArchive]: true });
      setRowRemindMenuThreadId(null);
      toast("Thread archived");
    },
    [archiveStateByThread, selectedThread, setArchiveStateByThread, setRowRemindMenuThreadId],
  );

  const setReminder = useCallback(
    (preset: "1h" | "3h" | "tomorrow", targetThreadId?: string) => {
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
      setRowRemindMenuThreadId(null);

      toast("Reminder set", {
        description: `This thread will return in ${label}.`,
      });
    },
    [reminderByThreadId, selectedThread, setReminderByThreadId, setRowRemindMenuThreadId],
  );

  const openInGmail = useCallback(
    (targetThreadId?: string) => {
      const target = normalizedThreads.find((thread) => thread.id === (targetThreadId ?? selectedThread?.id));
      toast("Opening Gmail soon", {
        description: target ? `${target.subject} is ready for mailbox handoff in mock mode.` : "Gmail deep link unavailable in mock mode.",
      });
    },
    [normalizedThreads, selectedThread],
  );

  const sendApprovalAssign = useCallback(() => {
    if (!selectedThread || !approvalSelectedId) return;
    setApprovalSentByThread({ ...approvalSentByThread, [selectedThread.id]: true });
  }, [approvalSelectedId, approvalSentByThread, selectedThread, setApprovalSentByThread]);

  const sendDiscuss = useCallback(() => {
    if (!selectedThread || !discussSelectedId) return;
    setDiscussSentByThread({ ...discussSentByThread, [selectedThread.id]: true });
    toast("Shared with team", {
      description: `Discuss thread sent to ${selectedDiscussContact?.name ?? "teammate"}.`,
    });
  }, [discussSelectedId, discussSentByThread, selectedDiscussContact?.name, selectedThread, setDiscussSentByThread]);

  const addQuickTask = useCallback(() => {
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
  }, [addedTasks, addedTasksByThread, selectedThread, setAddedTasksByThread, setTaskInputByThread, taskInput, taskInputByThread]);

  const sendEmailReply = useCallback(() => {
    if (!selectedThread) return;
    const recipient = emailMeta.to.trim() || defaultReplyTo(selectedThread);
    toast("Email draft ready", {
      description: `Prepared for ${recipient}`,
    });
  }, [emailMeta.to, selectedThread]);

  const openInChat = useCallback(() => {
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
    ]
      .filter(Boolean)
      .join("\n");

    setPageState(`${tabId}:chat-composer`, prompt);
    setPageState(`${tabId}:chat-sources`, ["org_knowledge", "files", "gmail"]);
    setPageState(`${tabId}:chat-mode`, "speed");
    toast("Opened in Chat", {
      description: "Email context and Gmail source were prefilled.",
    });
  }, [
    createTab,
    currentDraftText,
    emailBcc,
    emailCc,
    emailMeta.subject,
    emailMeta.to,
    selectedThread,
    setPageState,
    suggestedReply,
  ]);

  const focusComposer = useCallback(() => {
    if (!selectedThread) return;
    if (!currentDraftText.trim() && suggestedReply) {
      setCurrentDraftText(suggestedReply);
    }

    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    requestAnimationFrame(() => {
      const textarea = composerRef.current?.querySelector("textarea");
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus();
      }
    });
  }, [currentDraftText, selectedThread, setCurrentDraftText, suggestedReply]);

  const getSignalMeta = useCallback(
    (thread: NormalizedInboxThread) => {
      if (thread.approvalRequired) return { label: "Awaiting approval", tone: "alert" as const };
      if (thread.priority === "Critical" || thread.priority === "High") {
        return { label: "Needs attention", tone: "alert" as const };
      }
      if (isThreadDelegated(thread)) return { label: "Delegated", tone: "muted" as const };
      if (isThreadWatched(thread)) return { label: "Watched", tone: "success" as const };
      if (thread.status === "Waiting") return { label: "Waiting", tone: "muted" as const };
      if (isThreadReviewed(thread)) return { label: "Reviewed", tone: "muted" as const };
      return { label: "Active", tone: "muted" as const };
    },
    [isThreadDelegated, isThreadReviewed, isThreadWatched],
  );

  const createCustomerBucketAction = useCallback(() => {
    const name = newBucketName.trim();
    if (!name) return;

    const normalizedName = normalizeBucketText(name);
    const existingBucket = customerBuckets.find((bucket) => bucket.normalizedName === normalizedName);
    const nextBucket = existingBucket ?? buildCustomerBucket(name);

    if (!existingBucket) {
      setCustomerBuckets([...customerBuckets, nextBucket]);
    }

    setSelectedBucket({ kind: "customer", id: nextBucket.id });
    setNewBucketName("");
    setIsCreateBucketOpen(false);
  }, [customerBuckets, newBucketName, setCustomerBuckets, setIsCreateBucketOpen, setNewBucketName, setSelectedBucket]);

  useEffect(() => {
    if (selectedBucket.kind === "customer" && !customerBucketsWithCounts.some((bucket) => bucket.id === selectedBucket.id)) {
      setSelectedBucket({ kind: "system", id: "all" });
    }
  }, [customerBucketsWithCounts, selectedBucket, setSelectedBucket]);

  useEffect(() => {
    if (!visibleThreads.length) return;
    if (!visibleThreads.some((thread) => thread.id === lastSelectedThreadId)) {
      setLastSelectedThreadId(visibleThreads[0].id);
      return;
    }

    if (selectedThread && lastSelectedThreadId !== selectedThread.id) {
      setLastSelectedThreadId(selectedThread.id);
    }
  }, [lastSelectedThreadId, selectedThread, setLastSelectedThreadId, visibleThreads]);

  useEffect(() => {
    if (!isDetailRoute || !threadId) return;
    if (visibleThreads.some((thread) => thread.id === threadId)) return;

    navigate(
      {
        pathname: "/inbox",
        search: location.search,
      },
      { replace: true },
    );
  }, [isDetailRoute, location.search, navigate, threadId, visibleThreads]);

  useEffect(() => {
    setPageState(`${activeTabId}:inbox-threads`, inboxThreads);
  }, [activeTabId, setPageState]);

  useEffect(() => {
    const threadIdForState = selectedRawThread?.id ?? lastSelectedThreadId;
    if (!threadIdForState) return;
    setPageState(`${activeTabId}:inbox-thread`, threadIdForState);
  }, [activeTabId, lastSelectedThreadId, selectedRawThread?.id, setPageState]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!rowMenuRef.current) return;
      if (rowMenuRef.current.contains(event.target as Node)) return;
      setRowRemindMenuThreadId(null);
    };

    if (rowRemindMenuThreadId) {
      window.addEventListener("mousedown", handleOutsideClick);
    }

    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [rowRemindMenuThreadId, setRowRemindMenuThreadId]);

  useEffect(() => {
    if (!isDetailRoute || !selectedThread) return;

    const handleKeydown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      if (visibleThreads.length < 2) return;

      event.preventDefault();
      navigateBetweenThreads(event.key === "ArrowDown" ? 1 : -1);
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isDetailRoute, navigateBetweenThreads, selectedThread, visibleThreads.length]);

  const renderContactPickerPanel = (options: {
    title: string;
    description: string;
    open: boolean;
    query: string;
    placeholder: string;
    selectedId?: string;
    sent: boolean;
    selectedName?: string;
    contacts: ContactCard[];
    onQueryChange: (value: string) => void;
    onSelect: (id: string) => void;
    onSend: () => void;
    sendLabel: string;
    sentLabel: string;
  }) => {
    if (!options.open) return null;

    return (
      <div className="border border-border/80 bg-background p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={sectionLabelClass}>{options.title}</p>
            <p className="mt-1 text-[13px] leading-5 text-foreground/72">{options.description}</p>
          </div>
          {options.selectedName ? <StatusPill tone="muted">{options.selectedName}</StatusPill> : null}
        </div>

        <input
          aria-label={options.placeholder}
          className="mt-3 h-9 w-full border border-border bg-background px-3 text-sm text-foreground outline-none"
          onChange={(event) => options.onQueryChange(event.target.value)}
          placeholder={options.placeholder}
          value={options.query}
        />

        <div className="mt-3 max-h-40 space-y-1 overflow-auto">
          {options.contacts.length ? (
            options.contacts.map((contact) => (
              <button
                key={contact.id}
                className={cn(
                  "w-full border px-2.5 py-2 text-left transition-colors",
                  options.selectedId === contact.id
                    ? "border-primary bg-[hsl(var(--primary)/0.04)] text-foreground"
                    : "border-border bg-background text-foreground/74 hover:bg-[hsl(var(--foreground)/0.03)]",
                )}
                onClick={() => options.onSelect(contact.id)}
                type="button"
              >
                <p className="text-sm text-foreground">{contact.name}</p>
                <p className="mt-0.5 text-[12px] text-foreground/65">
                  {contact.role} · {contact.company}
                </p>
              </button>
            ))
          ) : (
            <p className="text-sm text-foreground/65">No matching contacts.</p>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] text-foreground/68">
            {options.selectedName ? `Selected: ${options.selectedName}` : "Choose one teammate to continue."}
          </p>
          <SmallButton active={Boolean(options.selectedName)} disabled={!options.selectedName} onClick={options.onSend}>
            <SendHorizontal className="mr-2 h-3.5 w-3.5" /> {options.sendLabel}
          </SmallButton>
        </div>

        {options.sent ? <p className="mt-2 text-[12px] text-foreground/78">{options.sentLabel}</p> : null}
      </div>
    );
  };

  const renderListView = () => {
    return (
      <Surface className="flex min-h-[34rem] flex-col overflow-hidden bg-background xl:min-h-0">
        <div className="border-b border-border px-4 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[17px] leading-tight text-foreground">{selectedBucketLabel}</h2>
            </div>
            <span className={workspaceCountClass}>{visibleThreads.length} threads</span>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          {visibleThreads.length ? (
            <div className="divide-y divide-border">
              {visibleThreads.map((thread) => {
                const isUnread = isThreadUnread(thread);
                const isWatched = isThreadWatched(thread);
                const signal = getSignalMeta(thread);
                const rowMenuOpen = rowRemindMenuThreadId === thread.id;
                const contextLabel = thread.account || thread.domainTag || thread.source;

                return (
                  <div
                    key={thread.id}
                    className={cn(
                      "group relative px-4 py-4 transition-colors hover:bg-[hsl(var(--foreground)/0.012)]",
                    )}
                    onClick={() => openThreadDetail(thread.id)}
                    onFocus={() => setLastSelectedThreadId(thread.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openThreadDetail(thread.id);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_88px] gap-x-4 gap-y-2">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-start gap-3">
                          <span
                            className={cn(
                              "mt-[0.42rem] h-3.5 w-3.5 shrink-0 rounded-full",
                              isUnread ? "bg-primary" : "bg-border/90",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                              <p className="truncate text-[13px] leading-5 text-foreground">{thread.sender}</p>
                              <p className="truncate text-[15px] leading-5 text-foreground">{thread.subject}</p>
                            </div>
                            <p className="mt-1 line-clamp-2 max-w-[68rem] text-[13px] leading-[1.45] text-foreground/68">
                              {thread.preview}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <SquareTag>{contextLabel}</SquareTag>
                          <SquareTag tone={signal.tone === "alert" ? "alert" : "neutral"}>{signal.label}</SquareTag>
                          {thread.attachments.length ? (
                            <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground">
                              <Paperclip className="h-3.5 w-3.5" /> {thread.attachments.length}
                            </span>
                          ) : null}
                        </div>

                        <div className="relative mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
                          <button
                            aria-label={`Open in Email for ${thread.subject}`}
                            className={rowActionButtonClass}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setLastSelectedThreadId(thread.id);
                              openInGmail(thread.id);
                            }}
                            type="button"
                          >
                            Open in Email
                          </button>
                          <button
                            aria-label={`${isWatched ? "Unwatch" : "Watch"} ${thread.subject}`}
                            className={cn(rowActionButtonClass, isWatched && "text-primary hover:text-primary")}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setLastSelectedThreadId(thread.id);
                              toggleWatchThread(thread.id);
                            }}
                            type="button"
                          >
                            {isWatched ? "Watching" : "Watch"}
                          </button>
                          <button
                            aria-label={`Archive ${thread.subject}`}
                            className={rowActionButtonClass}
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              archiveThread(thread.id);
                            }}
                            type="button"
                          >
                            Archive
                          </button>
                          {rowMenuOpen ? (
                            <div
                              className="absolute right-0 top-[calc(100%+0.35rem)] z-10 border border-border bg-background p-2 shadow-sm"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                              }}
                              ref={rowMenuRef}
                            >
                              <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.11em] text-foreground/70">
                                Schedule reminder
                              </p>
                              <div className="flex gap-1.5">
                                <button
                                  aria-label={`Remind ${thread.subject} in 1 hour`}
                                  className="h-7 rounded-full border border-border/80 px-2 text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-[hsl(var(--primary)/0.08)]"
                                  onClick={() => setReminder("1h", thread.id)}
                                  type="button"
                                >
                                  1h
                                </button>
                                <button
                                  aria-label={`Remind ${thread.subject} in 3 hours`}
                                  className="h-7 rounded-full border border-border/80 px-2 text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-[hsl(var(--primary)/0.08)]"
                                  onClick={() => setReminder("3h", thread.id)}
                                  type="button"
                                >
                                  3h
                                </button>
                                <button
                                  aria-label={`Remind ${thread.subject} tomorrow at 9 AM`}
                                  className="h-7 rounded-full border border-border/80 px-2 text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-[hsl(var(--primary)/0.08)]"
                                  onClick={() => setReminder("tomorrow", thread.id)}
                                  type="button"
                                >
                                  Tomorrow 9 AM
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between">
                        <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-foreground/58">
                          {thread.time}
                        </p>
                        <button
                          aria-expanded={rowMenuOpen}
                          aria-label={`Open reminder options for ${thread.subject}`}
                          className={cn(
                            "inline-flex h-8 w-8 items-center justify-center text-foreground/62 transition-colors hover:text-foreground",
                            reminderByThreadId[thread.id] && "text-primary",
                          )}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            setLastSelectedThreadId(thread.id);
                            setRowRemindMenuThreadId(rowMenuOpen ? null : thread.id);
                          }}
                          type="button"
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-6">
              <p className="text-[15px] leading-6 text-foreground">
                {selectedBucket.kind === "customer"
                  ? "This customer bucket is empty right now."
                  : "No active threads match this view."}
              </p>
              <p className="mt-2 text-[13px] leading-5 text-foreground/68">
                {searchQuery.trim()
                  ? `Search is filtering inside ${selectedBucketLabel}. Clear or refine the query to continue.`
                  : "Change the bucket, create a customer bucket, or return after new mail lands."}
              </p>
            </div>
          )}
        </div>
      </Surface>
    );
  };

  const renderDetailView = () => {
    if (!selectedThread || !selectedRawThread) {
      return (
        <Surface className="flex min-h-[34rem] items-center justify-center bg-background p-6 xl:min-h-0">
          <p className="text-sm text-foreground/70">This thread is no longer visible in the current view.</p>
        </Surface>
      );
    }

    return (
      <Surface className="flex min-h-[34rem] flex-col overflow-hidden bg-background xl:min-h-0">
        <div className="border-b border-border px-4 py-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <button
                aria-label="Back to list"
                className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-foreground/58 transition-colors hover:text-foreground"
                onClick={returnToList}
                type="button"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Back to list
              </button>
              <p className="mt-3 text-[13px] leading-5 text-foreground/64">
                {selectedThread.sender} · {selectedThread.company} · {selectedThread.source} · {selectedThread.time}
              </p>
              <h2 className="mt-1 text-[22px] leading-tight text-foreground">{selectedThread.subject}</h2>
              <p className="mt-2 max-w-[58rem] text-[13px] leading-[1.45] text-foreground/72">{selectedThread.preview}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-foreground/74">
                <span className={roundedMetaPillClass}>
                  <Mail className="h-3.5 w-3.5" /> {selectedThread.account}
                </span>
                <span className={roundedMetaPillClass}>
                  <FolderOpen className="h-3.5 w-3.5" /> {selectedThread.project}
                </span>
                <span className={roundedMetaPillClass}>
                  <Clock3 className="h-3.5 w-3.5" /> {selectedThread.dueRisk}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                aria-label={previousThread ? `Previous thread ${previousThread.subject}` : "Previous thread"}
                className={cn(denseActionButtonClass, !previousThread && "cursor-not-allowed opacity-40 hover:bg-background")}
                disabled={!previousThread}
                onClick={() => previousThread && openThreadDetail(previousThread.id)}
                type="button"
              >
                <ChevronRight className="h-3.5 w-3.5 rotate-180" /> Previous
              </button>
              <button
                aria-label={nextThread ? `Next thread ${nextThread.subject}` : "Next thread"}
                className={cn(denseActionButtonClass, !nextThread && "cursor-not-allowed opacity-40 hover:bg-background")}
                disabled={!nextThread}
                onClick={() => nextThread && openThreadDetail(nextThread.id)}
                type="button"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-border px-4 py-2.5">
          <div className="flex flex-wrap items-start gap-2">
            <button aria-label="Reply in place" className={cn(denseActionButtonClass, "border-foreground bg-foreground text-background hover:bg-foreground/90")} onClick={focusComposer} type="button">
              <SendHorizontal className="h-3.5 w-3.5" /> Reply
            </button>
            <button aria-label={`Open in Email for ${selectedThread.subject}`} className={denseActionButtonClass} onClick={() => openInGmail(selectedThread.id)} type="button">
              <Mail className="h-3.5 w-3.5" /> Open in Email
            </button>
            <button aria-label={`${isThreadWatched(selectedThread) ? "Unwatch" : "Watch"} ${selectedThread.subject}`} className={cn(denseActionButtonClass, isThreadWatched(selectedThread) && "border-primary bg-[hsl(var(--primary)/0.08)] text-primary")} onClick={() => toggleWatchThread(selectedThread.id)} type="button">
              <Clock3 className="h-3.5 w-3.5" /> {isThreadWatched(selectedThread) ? "Watching" : "Watch"}
            </button>
            <button aria-label={`${isThreadReviewed(selectedThread) ? "Reviewed" : "Mark reviewed"} ${selectedThread.subject}`} className={cn(denseActionButtonClass, isThreadReviewed(selectedThread) && "border-primary bg-[hsl(var(--primary)/0.08)] text-primary")} onClick={() => markThreadReviewed(selectedThread.id)} type="button">
              <CheckSquare className="h-3.5 w-3.5" /> {isThreadReviewed(selectedThread) ? "Reviewed" : "Mark reviewed"}
            </button>
            <button aria-label={`Archive ${selectedThread.subject}`} className={denseActionButtonClass} onClick={() => archiveThread(selectedThread.id)} type="button">
              <Archive className="h-3.5 w-3.5" /> Archive
            </button>
            <button aria-label={approvalOpen ? "Close approval and assign" : "Open approval and assign"} className={cn(denseActionButtonClass, approvalOpen && "border-primary bg-[hsl(var(--primary)/0.08)] text-primary")} onClick={() => setApprovalOpenByThread({ ...approvalOpenByThread, [selectedThread.id]: !approvalOpen })} type="button">
              Approval/Assign
            </button>
            <button aria-label={discussOpen ? "Close discuss" : "Open discuss"} className={cn(denseActionButtonClass, discussOpen && "border-primary bg-[hsl(var(--primary)/0.08)] text-primary")} onClick={() => setDiscussOpenByThread({ ...discussOpenByThread, [selectedThread.id]: !discussOpen })} type="button">
              Discuss
            </button>
            <button aria-label="Open in chat" className={denseActionButtonClass} onClick={openInChat} type="button">
              <MessageSquare className="h-3.5 w-3.5" /> Chat
            </button>
          </div>

          {approvalOpen || discussOpen ? (
            <div className="mt-3 grid gap-2 lg:grid-cols-2">
              {renderContactPickerPanel({
                title: "Approval and assign",
                description:
                  selectedThread.approvalPacket?.whyApprovalNeeded ??
                  "Route this thread to the next approver or assignee without leaving the page.",
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
                title: "Discuss",
                description: "Loop in one teammate while keeping this thread and its context in the same workspace.",
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

        <div className="min-h-0 flex-1 overflow-auto px-4 py-3">
          <div className="grid gap-2 xl:grid-cols-[1.18fr_0.82fr]">
            <div className="space-y-2">
              <div className="grid gap-2 md:grid-cols-2">
                {[
                  { title: "Why this matters", body: selectedThread.whyThisMatters, tone: "neutral" as const },
                  { title: "What changed", body: selectedThread.whatChanged, tone: "neutral" as const },
                  { title: "What is blocked", body: selectedThread.whatIsBlocked, tone: "critical" as const },
                  { title: "Recommended next step", body: selectedThread.nextAction, tone: "inverted" as const },
                ].map(({ title, body, tone }) => (
                  <div
                    key={title}
                    className={cn(
                      "border p-3",
                      tone === "critical"
                        ? "border-primary bg-primary text-primary-foreground"
                        : tone === "inverted"
                          ? "border-foreground bg-foreground text-background"
                          : "border-border/80 bg-background text-foreground",
                    )}
                  >
                    <p
                      className={cn(
                        "font-mono text-[10px] uppercase tracking-[0.12em]",
                        tone === "neutral" ? "text-foreground/70" : "text-current/80",
                      )}
                    >
                      {title}
                    </p>
                    <p className="mt-2 text-[13px] leading-6">{body}</p>
                  </div>
                ))}
              </div>

              <section className="border border-border/80 bg-background p-3">
                <p className={sectionLabelClass}>UBIK analysis</p>
                <div className="mt-2 space-y-1.5 text-[13px] leading-6 text-foreground/84">
                  {selectedThreadInsights.map((line) => (
                    <p key={line}>- {line}</p>
                  ))}
                </div>
              </section>

              <section className="border border-border/80 bg-background p-3">
                <Collapsible
                  onOpenChange={(open) =>
                    setThreadMessagesOpenByThread({
                      ...threadMessagesOpenByThread,
                      [selectedThread.id]: open,
                    })
                  }
                  open={threadMessagesOpen}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className={sectionLabelClass}>Thread messages</p>
                    <CollapsibleTrigger
                      aria-label={threadMessagesOpen ? "Collapse thread messages" : "Expand thread messages"}
                      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-foreground/58 transition-colors hover:text-foreground"
                      type="button"
                    >
                      {threadMessagesOpen ? "Collapse" : "Expand"}
                      {threadMessagesOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="mt-3">
                    <div className="space-y-2">
                      {selectedThread.timeline.map((entry) => {
                        const isInternal =
                          entry.sender === selectedThread.owner ||
                          entry.sender === "You" ||
                          entry.role.toLowerCase().includes("internal");

                        return (
                          <div
                            key={entry.id}
                            className={cn(
                              "max-w-[94%] border px-4 py-3",
                              isInternal
                                ? "ml-auto border-primary/50 bg-[hsl(var(--primary)/0.04)]"
                                : "mr-auto border-border/80 bg-background",
                            )}
                          >
                            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/62">
                              {entry.sender} · {entry.role} · {entry.time}
                            </p>
                            <p className="mt-1 text-[13px] leading-6 text-foreground/84">{entry.body}</p>
                            {entry.summary ? (
                              <p className="mt-2 text-[12px] leading-5 text-foreground/65">{entry.summary}</p>
                            ) : null}
                            {entry.attachments?.length ? (
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {entry.attachments.map((attachment) => (
                                  <SquareTag key={attachment}>
                                    {attachment}
                                  </SquareTag>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </section>

              <section className="border border-border/80 bg-background p-3">
                <button
                  className="flex w-full items-center justify-between text-left"
                  onClick={() =>
                    setEmailMetaOpenByThread({
                      ...emailMetaOpenByThread,
                      [selectedThread.id]: !emailMetaOpen,
                    })
                  }
                  type="button"
                >
                  <p className={sectionLabelClass}>Recipients and subject</p>
                  {emailMetaOpen ? (
                    <ChevronUp className="h-4 w-4 text-foreground/60" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-foreground/60" />
                  )}
                </button>

                {emailMetaOpen ? (
                  <div className="mt-3 grid gap-2">
                    {[
                      { label: "To", value: emailMeta.to, placeholder: "Recipient", onChange: setEmailTo },
                      { label: "Cc", value: emailCc, placeholder: "Add Cc recipients", onChange: setEmailCc },
                      { label: "Bcc", value: emailBcc, placeholder: "Add Bcc recipients", onChange: setEmailBcc },
                      { label: "Subject", value: emailMeta.subject, placeholder: "Subject", onChange: setEmailSubject },
                    ].map(({ label, value, placeholder, onChange }) => (
                      <div key={label} className="grid gap-2 md:grid-cols-[72px_1fr] md:items-center">
                        <p className={sectionLabelClass}>{label}</p>
                        <input
                          className="h-9 w-full border border-border/80 bg-background px-3 text-sm text-foreground outline-none"
                          onChange={(event) => onChange(event.target.value)}
                          placeholder={placeholder}
                          value={value}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-foreground/78">
                    <span className={cn(squareTagClass, "border-border text-foreground/66")}>
                      To: {emailMeta.to || "Recipient"}
                    </span>
                    {emailCc ? (
                      <span className={cn(squareTagClass, "border-border text-foreground/66")}>Cc</span>
                    ) : null}
                    {emailBcc ? (
                      <span className={cn(squareTagClass, "border-border text-foreground/66")}>Bcc</span>
                    ) : null}
                  </div>
                )}

                <div className="mt-3" ref={composerRef}>
                  <RichOperatorEditor
                    className="border-border/80"
                    compactCopyActions
                    minHeight={112}
                    onChange={setCurrentDraftText}
                    placeholder={`Draft your outbound reply. Suggestion: ${suggestedReply}`}
                    showInsertBlock={false}
                    showMarkdownCopy={false}
                    value={currentDraftText}
                  />

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-[12px] text-foreground/74">
                    <button
                      className="inline-flex items-center gap-1.5 border border-primary/45 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-primary transition-colors hover:bg-[hsl(var(--primary)/0.06)]"
                      type="button"
                    >
                      <Paperclip className="h-3.5 w-3.5" /> Attach file
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors hover:bg-[hsl(var(--foreground)/0.03)]"
                      type="button"
                    >
                      <CalendarDays className="h-3.5 w-3.5" /> Meeting
                    </button>
                    <button
                      className="inline-flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] transition-colors hover:bg-[hsl(var(--foreground)/0.03)]"
                      type="button"
                    >
                      <FolderOpen className="h-3.5 w-3.5" /> Drive
                    </button>
                    <span className="ml-auto text-[11px] text-foreground/62">Connected: Gmail, Calendar, Drive</span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <SmallButton active onClick={sendEmailReply}>
                      <SendHorizontal className="mr-2 h-3.5 w-3.5" /> Send
                    </SmallButton>
                  </div>
                </div>
              </section>
            </div>

            <div className="space-y-2">
              <section className="border border-border/80 bg-background p-3">
                <p className={sectionLabelClass}>Operational context</p>
                <div className="mt-2 space-y-2 text-[13px] leading-5 text-foreground/82">
                  <p>
                    <span className="text-foreground/56">Account:</span> {selectedThread.account}
                  </p>
                  <p>
                    <span className="text-foreground/56">Project:</span> {selectedThread.project}
                  </p>
                  <p>
                    <span className="text-foreground/56">Owner:</span> {selectedThread.owner}
                  </p>
                  <p>
                    <span className="text-foreground/56">Waiting state:</span> {selectedThread.waitingState}
                  </p>
                  {selectedThread.linkedTask ? (
                    <p>
                      <span className="text-foreground/56">Linked task:</span> {selectedThread.linkedTask.label} ·{" "}
                      {selectedThread.linkedTask.status}
                    </p>
                  ) : null}
                  {selectedThread.linkedWorkflow ? (
                    <p>
                      <span className="text-foreground/56">Linked workflow:</span> {selectedThread.linkedWorkflow.label} ·{" "}
                      {selectedThread.linkedWorkflow.status}
                    </p>
                  ) : null}
                </div>
              </section>

              <section className="border border-border/80 bg-background p-3">
                <p className={sectionLabelClass}>Suggested actions</p>
                <div className="mt-2 space-y-2">
                  {selectedThread.actionRecommendations.slice(0, 4).map((action) => (
                    <div key={action.key} className="border border-border/80 bg-[hsl(var(--foreground)/0.01)] p-2">
                      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-foreground/62">
                        {action.kind}
                      </p>
                      <p className="mt-1 text-sm text-foreground">{action.label}</p>
                      <p className="mt-1 text-[12px] leading-5 text-foreground/65">{action.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-border/80 bg-background p-3">
                <p className={sectionLabelClass}>Quick task</p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    aria-label={taskInputEnabled ? "Disable task input" : "Enable task input"}
                    className={cn(
                      "transition-colors",
                      taskInputEnabled ? "text-primary" : "text-foreground/70 hover:text-foreground",
                    )}
                    onClick={() =>
                      setTaskInputEnabledByThread({
                        ...taskInputEnabledByThread,
                        [selectedThread.id]: !taskInputEnabled,
                      })
                    }
                    type="button"
                  >
                    {taskInputEnabled ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  </button>
                  <input
                    className="h-9 flex-1 border border-border bg-background px-3 text-sm text-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
                </div>

                <p className="mt-2 text-[12px] text-foreground/64">
                  Existing packet: {selectedThread.taskPacket.taskTitle}
                </p>

                {addedTasks.length ? (
                  <div className="mt-3 space-y-1.5">
                    {addedTasks.map((task) => (
                      <div key={task.id} className="border border-border/80 bg-background p-2 text-xs">
                        <p className="line-clamp-2 text-sm text-foreground">{task.title}</p>
                        <p className="mt-1 text-foreground/70">
                          {task.status} · Due {task.due} · <span className="text-primary">{task.priority}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-[12px] text-foreground/68">No extra quick tasks added yet.</p>
                )}
              </section>

              <section className="border border-border/80 bg-background p-3">
                <p className={sectionLabelClass}>Attachments</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {selectedThread.attachments.length ? (
                    selectedThread.attachments.map((attachment) => (
                      <SquareTag key={attachment}>
                        {attachment}
                      </SquareTag>
                    ))
                  ) : (
                    <p className="text-[12px] text-foreground/66">No attachments on this thread.</p>
                  )}
                </div>
              </section>

              <section className="border border-border/80 bg-background p-3">
                <p className={sectionLabelClass}>Provenance</p>
                <div className="mt-2 space-y-1.5">
                  {selectedRawThread.provenance.map((entry) => (
                    <div key={`${entry.label}-${entry.value}`} className="text-[13px] leading-5 text-foreground/78">
                      <span className="text-foreground/54">{entry.label}:</span> {entry.value}
                    </div>
                  ))}
                </div>
              </section>

              <section className="border border-border/80 bg-background p-3">
                <p className={sectionLabelClass}>People</p>
                <div className="mt-2 space-y-2 text-[13px] text-foreground/82">
                  <p>
                    <span className="text-foreground/56">Sender:</span> {selectedThread.sender}
                  </p>
                  <p>
                    <span className="text-foreground/56">Owner:</span> {selectedThread.owner}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedThread.participants.map((participant) => (
                      <SquareTag key={participant}>
                        {participant}
                      </SquareTag>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </Surface>
    );
  };

  return (
    <div className="px-3 py-4 lg:px-6 lg:py-5 xl:h-[calc(100vh-3.5rem)] xl:min-h-0 xl:overflow-hidden">
      <PageContainer className="xl:h-full xl:min-h-0">
        <div className="grid gap-2 xl:h-full xl:min-h-0 xl:grid-cols-[292px_minmax(0,1fr)]">
          <Surface className="flex min-h-[24rem] flex-col overflow-hidden bg-background xl:min-h-0">
            <div className="border-b border-border px-3 py-3">
              <div className="flex items-center gap-2 border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-foreground/70" />
                <input
                  aria-label="Search inbox"
                  className="w-full bg-transparent text-sm text-foreground outline-none"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search sender, subject, company"
                  value={searchQuery}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="border-b border-border px-0 py-1.5">
                {builtInBuckets.map((bucket) => {
                  const isActive = selectedBucket.kind === "system" && selectedBucket.id === bucket.id;
                  return (
                    <button
                      key={bucket.id}
                      className={cn(
                        railRowBaseClass,
                        isActive
                          ? "border-b-foreground bg-foreground text-background"
                          : "border-b-border bg-background text-foreground hover:bg-[hsl(var(--foreground)/0.03)]",
                      )}
                      onClick={() => setSelectedBucket({ kind: "system", id: bucket.id })}
                      type="button"
                    >
                      <span className="flex w-full min-w-0 items-center justify-between gap-[var(--panel-row-content-gap)] py-[var(--panel-row-y)] text-left">
                        <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em]">
                          {bucket.label}
                        </span>
                        <span
                          aria-label={`${bucket.label} count ${bucket.count}`}
                          className={cn(
                            "shrink-0 border px-[var(--panel-chip-padding-x)] py-[var(--panel-chip-padding-y)] font-mono text-[10px] uppercase tracking-[0.12em]",
                            isActive ? "border-background/30 text-background" : "border-border text-foreground/65",
                          )}
                        >
                          {bucket.count}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="px-0 py-1.5">
                {customerBucketsWithCounts.length ? (
                  customerBucketsWithCounts.map((bucket) => {
                    const isActive = selectedBucket.kind === "customer" && selectedBucket.id === bucket.id;
                    return (
                      <button
                        aria-label={bucket.name}
                        key={bucket.id}
                        className={cn(
                          railRowBaseClass,
                          isActive
                            ? "border-b-foreground bg-foreground text-background"
                            : "border-b-border bg-background text-foreground hover:bg-[hsl(var(--foreground)/0.03)]",
                        )}
                        onClick={() => setSelectedBucket({ kind: "customer", id: bucket.id })}
                        type="button"
                      >
                        <span className="flex w-full min-w-0 items-center justify-between gap-[var(--panel-row-content-gap)] py-[var(--panel-row-y)] text-left">
                          <span className="truncate font-mono text-[10px] uppercase tracking-[0.14em]">
                            {bucket.name}
                          </span>
                          <span
                            aria-label={`${bucket.name} count ${bucket.count}`}
                            className={cn(
                              "shrink-0 border px-[var(--panel-chip-padding-x)] py-[var(--panel-chip-padding-y)] font-mono text-[10px] uppercase tracking-[0.12em]",
                              isActive ? "border-background/30 text-background" : "border-border text-foreground/65",
                            )}
                          >
                            {bucket.count}
                          </span>
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-3 py-2 text-[13px] text-foreground/64">No custom filters yet.</p>
                )}

                <button
                  aria-label="Create custom filter"
                  className="mt-2 flex w-full items-center justify-between border-b border-dashed border-border px-3 py-[var(--panel-add-row-y)] text-left text-sm text-foreground/72 transition-colors hover:bg-[hsl(var(--foreground)/0.03)] hover:text-foreground"
                  onClick={() => setIsCreateBucketOpen(true)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus className="h-[var(--panel-add-icon-size)] w-[var(--panel-add-icon-size)]" /> Custom filter
                  </span>
                  <ChevronRight className="h-[var(--panel-add-icon-size)] w-[var(--panel-add-icon-size)]" />
                </button>
              </div>
            </div>
          </Surface>

          {isDetailRoute ? renderDetailView() : renderListView()}
        </div>
      </PageContainer>

      {isCreateBucketOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/10 px-4">
          <div className="w-full max-w-md border border-border bg-background shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="border-b border-border px-4 py-3">
              <p className={sectionLabelClass}>Create bucket</p>
              <h3 className="mt-1 text-base text-foreground">Add custom filter</h3>
            </div>
            <div className="px-4 py-4">
              <input
                aria-label="New custom filter name"
                className="h-11 w-full border border-border bg-background px-3 text-sm text-foreground outline-none"
                onChange={(event) => setNewBucketName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    createCustomerBucketAction();
                  }
                }}
                placeholder="Custom filter name"
                value={newBucketName}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <SmallButton
                onClick={() => {
                  setIsCreateBucketOpen(false);
                  setNewBucketName("");
                }}
              >
                Cancel
              </SmallButton>
              <SmallButton active onClick={createCustomerBucketAction}>
                Create
              </SmallButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
