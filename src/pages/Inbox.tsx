import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, CheckCheck, ChevronDown, ChevronUp, Clock3, FileStack, Search, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";

import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { useIsMobile } from "@/hooks/use-mobile";
import { inboxThreads } from "@/lib/ubik-data";
import type {
  ApprovalDrawerContent,
  InboxActionKey,
  InboxPriorityBand,
  InboxTaskPacket,
  InboxThread,
  ProvenanceDrawerContent,
  TaskWorkflowDrawerContent,
} from "@/lib/ubik-types";

type InboxPriorityFilter = "all" | InboxPriorityBand;
type InboxSortKey = "priority" | "recent_change" | "due_risk";
type InboxScenario = "default" | "loading" | "empty" | "error" | "permissions";

const priorityFilters: { key: InboxPriorityFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "needs_attention", label: "Attention" },
  { key: "review_today", label: "Review today" },
  { key: "waiting_on_you", label: "Waiting on you" },
  { key: "follow_up_risk", label: "Follow-up risk" },
  { key: "awaiting_approval", label: "Approval" },
  { key: "delegated", label: "Delegated" },
  { key: "watching", label: "Watching" },
  { key: "auto_handled", label: "Auto" },
  { key: "archive", label: "Triage" },
];

const priorityBandLabel: Record<InboxPriorityBand, string> = {
  needs_attention: "Needs attention now",
  review_today: "Review today",
  waiting_on_you: "Waiting on you",
  follow_up_risk: "Follow-up risk",
  awaiting_approval: "Awaiting approval",
  delegated: "Delegated",
  watching: "Watching",
  auto_handled: "Auto-handled",
  archive: "Archive",
};

const priorityBandOrder: Record<InboxPriorityBand, number> = {
  needs_attention: 0,
  review_today: 1,
  waiting_on_you: 2,
  follow_up_risk: 3,
  awaiting_approval: 4,
  delegated: 5,
  watching: 6,
  auto_handled: 7,
  archive: 8,
};

const priorityOrder: Record<InboxThread["priority"], number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
};

const selectClassName =
  "h-9 min-w-0 rounded-none border border-border bg-card px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground outline-none transition-colors focus:border-foreground/45 sm:h-10 sm:px-3 sm:text-[11px] sm:tracking-[0.14em]";

function readScenario(search: string): InboxScenario {
  const scenario = new URLSearchParams(search).get("scenario");
  if (scenario === "loading" || scenario === "empty" || scenario === "error" || scenario === "permissions") {
    return scenario;
  }
  return "default";
}

function matchesPriorityFilter(thread: InboxThread, filter: InboxPriorityFilter) {
  if (filter === "all") {
    return thread.priorityBand !== "archive";
  }

  return thread.priorityBand === filter;
}

function countThreadsForFilter(threads: InboxThread[], filter: InboxPriorityFilter) {
  return threads.filter((thread) => matchesPriorityFilter(thread, filter)).length;
}

function matchesSearch(thread: InboxThread, search: string) {
  if (!search.trim()) return true;

  const haystack = [
    thread.sender,
    thread.company,
    thread.subject,
    thread.account,
    thread.project,
    thread.preview,
    thread.whyThisMatters,
    thread.nextAction,
    thread.attachments.join(" "),
    thread.linkedTask?.label ?? "",
    thread.linkedWorkflow?.label ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.trim().toLowerCase());
}

function dueRiskScore(thread: InboxThread) {
  const dueRisk = thread.dueRisk.toLowerCase();

  if (dueRisk.includes("overdue")) return 0;
  if (dueRisk.includes("2 hours")) return 1;
  if (dueRisk.includes("today")) return 2;
  if (dueRisk.includes("review")) return 3;
  if (dueRisk.includes("watching")) return 4;
  if (dueRisk.includes("no deadline")) return 5;

  return 6;
}

function sortThreads(threads: InboxThread[], sortKey: InboxSortKey) {
  const ranked = [...threads];

  if (sortKey === "due_risk") {
    return ranked.sort((left, right) => dueRiskScore(left) - dueRiskScore(right));
  }

  if (sortKey === "recent_change") {
    return ranked;
  }

  return ranked.sort((left, right) => {
    const bandDelta = priorityBandOrder[left.priorityBand] - priorityBandOrder[right.priorityBand];
    if (bandDelta !== 0) return bandDelta;

    const priorityDelta = priorityOrder[left.priority] - priorityOrder[right.priority];
    if (priorityDelta !== 0) return priorityDelta;

    return dueRiskScore(left) - dueRiskScore(right);
  });
}

function toneForThread(thread: InboxThread) {
  if (thread.priority === "Critical" || thread.priorityBand === "follow_up_risk") {
    return "alert" as const;
  }

  return "default" as const;
}

function summaryTone(value: string) {
  const lowered = value.toLowerCase();
  if (lowered.includes("blocked") || lowered.includes("overdue") || lowered.includes("waiting on you")) {
    return "text-primary";
  }

  return "text-foreground";
}

function cloneTaskPacket(task: InboxTaskPacket) {
  return {
    ...task,
    delegationHistory: [...task.delegationHistory],
  };
}

function categoryForThread(thread: InboxThread) {
  const haystack = `${thread.subject} ${thread.project} ${thread.account}`.toLowerCase();

  if (haystack.includes("rate") || haystack.includes("pricing") || haystack.includes("quote") || haystack.includes("renewal")) {
    return "Sales";
  }

  if (haystack.includes("delivery") || haystack.includes("shipment") || haystack.includes("port") || haystack.includes("container")) {
    return "Logistics";
  }

  if (haystack.includes("invoice") || haystack.includes("po") || haystack.includes("purchase") || haystack.includes("supplier")) {
    return "Purchase";
  }

  if (haystack.includes("approval") || haystack.includes("budget") || haystack.includes("contract")) {
    return "Operations";
  }

  return "General";
}

function displayContextTitle(title: string) {
  if (title === "People and Company") return "People & Company";
  if (title === "Account and Project Context") return "Commitments";
  if (title === "CRM and ERP Context") return "CRM / ERP";
  if (title === "Linked Tasks and Workflow") return "Linked Tasks";
  return title;
}

function quickAnalysisBullets(thread: InboxThread) {
  return [
    `${priorityBandLabel[thread.priorityBand]}. ${thread.dueRisk}.`,
    thread.whyThisMatters,
    thread.whatChanged,
    thread.whatIsBlocked,
    thread.nextAction,
  ];
}

function visibleMessageParagraphs(thread: InboxThread, body: string) {
  const paragraphs = body.split("\n").map((paragraph) => paragraph.trim()).filter(Boolean);
  if (!paragraphs.length) return [];

  const firstParagraph = paragraphs[0].toLowerCase();
  const subjectHint = thread.subject.toLowerCase();
  const whyHint = thread.whyThisMatters.toLowerCase();

  // Drop the lead line when it just restates the summary already shown above.
  if (
    firstParagraph.includes("following up") ||
    firstParagraph.includes("still do not have") ||
    subjectHint.includes("waiting on revised delivery note") ||
    whyHint.includes("missed commitment")
  ) {
    return paragraphs.slice(1);
  }

  return paragraphs;
}

function ContextSection({ title, items }: { title: string; items: { label: string; value: string }[] }) {
  return (
    <Surface className="overflow-hidden border-[#ded9cf] bg-[#fffdfa] shadow-[0_1px_0_rgba(15,23,42,0.02)]">
      <div className="border-b border-[#ece6dc] px-4 py-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{displayContextTitle(title)}</p>
      </div>
      <div className="space-y-0">
        {items.map((item) => (
          <div key={`${title}-${item.label}`} className="border-b border-[#ece7de] px-4 py-3 last:border-b-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
            <p className="mt-1 text-sm leading-6 text-foreground">{item.value}</p>
          </div>
        ))}
      </div>
    </Surface>
  );
}

function QueueRow({
  active,
  buttonRef,
  thread,
  onSelect,
  onKeyDown,
  onMarkReviewed,
  onWatch,
  onArchive,
  onOpenInNewTab,
}: {
  active: boolean;
  buttonRef: (node: HTMLButtonElement | null) => void;
  thread: InboxThread;
  onSelect: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onMarkReviewed: () => void;
  onWatch: () => void;
  onArchive: () => void;
  onOpenInNewTab: () => void;
}) {
  return (
    <div className="group border-b border-[#ece7de] last:border-b-0">
      <button
        ref={buttonRef}
        aria-label={`Open thread ${thread.subject}`}
        className={`w-full border-l-[3px] px-3 py-3 text-left transition-colors ${
          active
            ? "border-l-primary bg-[#f5f7fb]"
            : thread.priorityBand === "needs_attention" || thread.priority === "Critical"
              ? "border-l-transparent bg-[#fffdfa] hover:bg-[#fbfaf7]"
              : "border-l-transparent bg-card hover:bg-[#fbfaf7]"
        }`}
        onClick={onSelect}
        onKeyDown={onKeyDown}
        type="button"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  {(thread.priorityBand === "needs_attention" || thread.priority === "Critical") && !active ? (
                    <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  ) : null}
                  <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {thread.sender}
                  </p>
                  <span className="truncate text-[12px] text-muted-foreground">{thread.company}</span>
                </div>
                <p className={`mt-1 line-clamp-2 font-mono text-[13px] leading-6 ${active || thread.priorityBand === "needs_attention" || thread.priority === "Critical" ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                  {thread.subject}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{thread.lastMaterialChangeAt}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{thread.attachments.length} files</p>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <StatusPill tone={toneForThread(thread)}>{priorityBandLabel[thread.priorityBand]}</StatusPill>
              <StatusPill tone={thread.priority === "Critical" ? "alert" : "muted"}>{thread.priority}</StatusPill>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">{categoryForThread(thread)}</span>
            </div>

            <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-muted-foreground">{thread.preview}</p>

            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                <span>{thread.project}</span>
                <span>·</span>
                <span>{thread.account}</span>
              </div>
              <p className="text-[11px] text-primary">{thread.waitingState}</p>
            </div>
          </div>
        </div>
      </button>

      <div className="flex flex-wrap gap-3 px-3 pb-3 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
        <button
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          onClick={onMarkReviewed}
          type="button"
          aria-label={`Mark reviewed ${thread.subject}`}
        >
          Mark reviewed
        </button>
        <button
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          onClick={onWatch}
          type="button"
          aria-label={`Watch ${thread.subject}`}
        >
          Watch
        </button>
        <button
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          onClick={onArchive}
          type="button"
          aria-label={`Archive ${thread.subject}`}
        >
          Archive
        </button>
        <button
          className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
          onClick={onOpenInNewTab}
          type="button"
          aria-label={`Open ${thread.subject} in new tab`}
        >
          Open in new tab
        </button>
      </div>
    </div>
  );
}

function QueueSkeleton() {
  return (
    <div className="space-y-0" aria-label="Queue loading state">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="border-b border-border px-4 py-4 last:border-b-0">
          <div className="h-3 w-32 animate-pulse bg-muted" />
          <div className="mt-3 h-5 w-3/4 animate-pulse bg-muted" />
          <div className="mt-3 h-4 w-11/12 animate-pulse bg-muted" />
          <div className="mt-2 h-4 w-8/12 animate-pulse bg-muted" />
          <div className="mt-4 h-3 w-10/12 animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
}

function WorkspaceSkeleton() {
  return (
    <div className="space-y-4" aria-label="Workspace loading state">
      <Surface className="p-5">
        <div className="h-3 w-40 animate-pulse bg-muted" />
        <div className="mt-3 h-8 w-4/5 animate-pulse bg-muted" />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border border-border p-4">
              <div className="h-3 w-24 animate-pulse bg-muted" />
              <div className="mt-3 h-4 w-full animate-pulse bg-muted" />
              <div className="mt-2 h-4 w-5/6 animate-pulse bg-muted" />
            </div>
          ))}
        </div>
      </Surface>
      <Surface className="p-5">
        <div className="h-3 w-32 animate-pulse bg-muted" />
        <div className="mt-4 h-32 animate-pulse bg-muted" />
      </Surface>
    </div>
  );
}

function Workspace({
  activeThread,
  provenanceExpanded,
  onToggleProvenance,
  onPrimaryAction,
  onSecondaryAction,
  onAnalyzeAttachment,
  onOpenTaskDrawer,
  onOpenProvenanceDrawer,
  onBack,
  showBackButton,
}: {
  activeThread: InboxThread | null;
  provenanceExpanded: boolean;
  onToggleProvenance: () => void;
  onPrimaryAction: (key: InboxActionKey) => void;
  onSecondaryAction: (key: InboxActionKey) => void;
  onAnalyzeAttachment: (attachment: string) => void;
  onOpenTaskDrawer: () => void;
  onOpenProvenanceDrawer: () => void;
  onBack: () => void;
  showBackButton: boolean;
}) {
  if (!activeThread) {
    return (
      <Surface className="flex min-h-[32rem] items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Thread Workspace</p>
          <h3 className="mt-3 font-mono text-xl font-semibold text-foreground">Select a thread to review</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Open a priority thread from the queue to see the situation summary, timeline, context, and recommended actions.
          </p>
        </div>
      </Surface>
    );
  }

  const primaryAction = activeThread.actionRecommendations.find((action) => action.kind === "primary");
  const secondaryActions = activeThread.actionRecommendations.filter((action) => action.kind !== "primary");
  const latestMessage = activeThread.timeline[0];
  const olderMessages = activeThread.timeline.slice(1);
  const [expandedOlderMessageId, setExpandedOlderMessageId] = useState<string | null>(olderMessages[0]?.id ?? null);

  return (
    <div className="space-y-3">
      <Surface className="overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {showBackButton ? (
                <button
                  className="inline-flex h-8 w-8 items-center justify-center border border-border bg-card text-foreground"
                  onClick={onBack}
                  type="button"
                  aria-label="Back to queue"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : null}
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                {activeThread.sender} · {activeThread.company} · {categoryForThread(activeThread)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={toneForThread(activeThread)}>{priorityBandLabel[activeThread.priorityBand]}</StatusPill>
              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{latestMessage.time}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-border px-4 py-3.5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2 className="text-[1.15rem] font-semibold leading-7 text-foreground md:text-[1.25rem]">{activeThread.subject}</h2>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                <span>{activeThread.project}</span>
                <span>·</span>
                <span>{activeThread.attachments.length} files</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2">
                <StatusPill tone={activeThread.priority === "Critical" ? "alert" : "default"}>{activeThread.priority}</StatusPill>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Due risk</p>
              </div>
              <p className="mt-1.5 text-[13px] text-primary">{activeThread.dueRisk}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-0 border-b border-border md:grid-cols-2 xl:grid-cols-4">
          <div className="border-b border-border px-4 py-3 md:border-r xl:border-b-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Why this matters</p>
            <p className="mt-2 text-[13px] leading-5 text-foreground">{activeThread.whyThisMatters}</p>
          </div>
          <div className="border-b border-border px-4 py-3 md:border-b-0 xl:border-r">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">What changed</p>
            <p className="mt-2 text-[13px] leading-5 text-foreground">{activeThread.whatChanged}</p>
          </div>
          <div className="border-b border-border px-4 py-3 md:border-r xl:border-b-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">What is blocked</p>
            <p className={`mt-2 text-[13px] leading-5 ${summaryTone(activeThread.whatIsBlocked)}`}>{activeThread.whatIsBlocked}</p>
          </div>
          <div className="px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Recommended next step</p>
            <p className="mt-2 text-[13px] leading-5 text-foreground">{activeThread.nextAction}</p>
          </div>
        </div>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 border-r border-border">
            <div className="h-[calc(100vh-21.5rem)] min-h-[28rem] overflow-auto">
              <div className="px-5 py-4">
                <div className="mb-5 border border-border bg-[#f1f1ef]">
                  <div className="border-b border-border px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Ubik analysis</p>
                  </div>
                  <div className="max-h-40 overflow-y-auto px-4 py-3">
                    <ul className="space-y-1.5 text-sm leading-6 text-foreground">
                      {quickAnalysisBullets(activeThread).map((bullet) => (
                        <li key={`note-${bullet}`} className="flex gap-2">
                          <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/60" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="max-w-3xl space-y-4 text-[15px] leading-7 text-foreground md:text-[16px] md:leading-8">
                  {visibleMessageParagraphs(activeThread, latestMessage.body).map((paragraph, index) => (
                    <p key={`${latestMessage.id}-${index}`}>{paragraph}</p>
                  ))}
                </div>

                {latestMessage.attachments?.length ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {latestMessage.attachments.map((attachment) => (
                      <button
                        key={attachment}
                        className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 text-sm text-foreground"
                        onClick={() => onAnalyzeAttachment(attachment)}
                        type="button"
                      >
                        <FileStack className="h-4 w-4" />
                        {attachment}
                      </button>
                    ))}
                  </div>
                ) : null}

                {olderMessages.length ? (
                  <div className="mt-7 border-t border-border pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#d8d2c8] bg-white text-muted-foreground">
                          <Clock3 className="h-4 w-4" />
                        </span>
                        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-foreground">
                          Older messages in thread ({olderMessages.length})
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-0 border-t border-[#ece7de]">
                      {olderMessages.map((message) => {
                        const expanded = expandedOlderMessageId === message.id;

                        return (
                          <div key={message.id} className="border-b border-[#ece7de] py-4">
                            <button
                              className="flex w-full items-start justify-between gap-4 text-left"
                              onClick={() => setExpandedOlderMessageId((current) => (current === message.id ? null : message.id))}
                              type="button"
                              aria-expanded={expanded}
                            >
                              <div className="flex min-w-0 items-start gap-3">
                                <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#cfd4dc] bg-white text-[#5f6b7e]">
                                  <Clock3 className="h-3.5 w-3.5" />
                                </span>
                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground">{message.sender}</p>
                                    <p className="text-[12px] text-muted-foreground">{message.time}</p>
                                  </div>
                                  <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.08em] text-muted-foreground">{activeThread.subject}</p>
                                </div>
                              </div>
                              <ChevronDown className={`mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                            </button>

                            {expanded ? (
                              <div className="ml-11 mt-4 rounded-[1.25rem] border border-[#dde2ea] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-foreground">{message.sender}</p>
                                  <p className="text-[12px] text-muted-foreground">{message.time}</p>
                                </div>
                                <div className="mt-4 max-w-3xl space-y-3 text-[14px] leading-7 text-foreground">
                                  {message.body.split("\n").filter(Boolean).map((paragraph, index) => (
                                    <p key={`${message.id}-${index}`}>{paragraph}</p>
                                  ))}
                                </div>
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid content-start gap-3 bg-[#fcfbf8] p-3">
            <Surface className="overflow-hidden border-[#ded9cf] bg-[#fffdfa]">
              <div className="flex items-center justify-between border-b border-[#ece6dc] px-4 py-3">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Actions</p>
                <button
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                  onClick={onOpenTaskDrawer}
                  type="button"
                >
                  Assign
                </button>
              </div>
              <div className="space-y-2 px-4 py-4">
                {primaryAction ? (
                  <button
                    className="inline-flex w-full items-center justify-center gap-2 border border-primary bg-primary px-3 py-3 font-mono text-[10px] uppercase tracking-[0.12em] text-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    onClick={() => onPrimaryAction(primaryAction.key)}
                    type="button"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {primaryAction.label}
                  </button>
                ) : null}
                {secondaryActions.map((action) => (
                  <button
                    key={action.key}
                    className="inline-flex w-full items-center justify-center gap-2 border border-[#e5dfd5] bg-white px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground"
                    onClick={() => onSecondaryAction(action.key)}
                    type="button"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </Surface>

            {activeThread.contextModules.map((module) => (
              <ContextSection key={module.id} title={module.title} items={module.items} />
            ))}

            <Surface className="overflow-hidden border-[#ded9cf] bg-[#fffdfa]">
              <div className="flex items-center justify-between border-b border-[#ece6dc] px-4 py-3">
                <button
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                  onClick={onToggleProvenance}
                  type="button"
                >
                  Provenance
                  {provenanceExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
                <button
                  className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                  onClick={onOpenProvenanceDrawer}
                  type="button"
                >
                  Open drawer
                </button>
              </div>
              {provenanceExpanded ? (
                <div className="space-y-0">
                  {activeThread.provenance.map((item) => (
                    <div key={`${item.label}-${item.value}`} className="border-b border-border px-4 py-3 last:border-b-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-4 text-sm leading-6 text-muted-foreground">
                  Keep recommendation sources inspectable without turning the reading pane into a workflow wall.
                </p>
              )}
            </Surface>
          </div>
        </div>
      </Surface>
    </div>
  );
}

export default function Inbox() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const { createTab, openDrawer, openRuntime, setPageState } = useShellState();
  const scenario = readScenario(location.search);
  const [threads, setThreads] = useWorkbenchState<InboxThread[]>("inbox-threads", inboxThreads);
  const [priorityFilter, setPriorityFilter] = useWorkbenchState<InboxPriorityFilter>("inbox-priority-filter", "all");
  const [search, setSearch] = useWorkbenchState<string>("inbox-search", "");
  const [sortKey, setSortKey] = useWorkbenchState<InboxSortKey>("inbox-sort", "priority");
  const [selectedId, setSelectedId] = useWorkbenchState<string>("inbox-thread", inboxThreads[0]?.id ?? "");
  const [provenanceExpanded, setProvenanceExpanded] = useWorkbenchState<boolean>("inbox-provenance-expanded", false);
  const [mobileWorkspaceOpen, setMobileWorkspaceOpen] = useState(false);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const baseThreads = useMemo(
    () => (scenario === "empty" ? [] : threads.filter((thread) => thread.source === "Email")),
    [scenario, threads],
  );
  const filteredThreads = useMemo(
    () =>
      sortThreads(
        baseThreads
          .filter((thread) => matchesPriorityFilter(thread, priorityFilter))
          .filter((thread) => matchesSearch(thread, search)),
        sortKey,
      ),
    [baseThreads, priorityFilter, search, sortKey],
  );
  const filterCounts = useMemo(
    () =>
      Object.fromEntries(priorityFilters.map((filter) => [filter.key, countThreadsForFilter(baseThreads, filter.key)])) as Record<
        InboxPriorityFilter,
        number
      >,
    [baseThreads],
  );

  const activeThread = filteredThreads.find((thread) => thread.id === selectedId) ?? filteredThreads[0] ?? null;

  useEffect(() => {
    if (!filteredThreads.length) {
      if (selectedId) {
        setSelectedId("");
      }
      return;
    }

    if (!filteredThreads.some((thread) => thread.id === selectedId)) {
      setSelectedId(filteredThreads[0].id);
    }
  }, [filteredThreads, selectedId, setSelectedId]);

  useEffect(() => {
    if (!isMobile) {
      setMobileWorkspaceOpen(false);
    }
  }, [isMobile]);

  const queueAlert =
    scenario === "error"
      ? "Ranking degraded. CRM context failed to load, but threads remain visible."
      : scenario === "permissions"
        ? "Context is permissions-limited. Queue ranking is present, but CRM and ERP enrichment is partial."
        : null;

  const updateThreads = (updater: (current: InboxThread[]) => InboxThread[]) => {
    setThreads(updater(threads));
  };

  const updateThread = (threadId: string, updater: (thread: InboxThread) => InboxThread) => {
    updateThreads((current) => current.map((thread) => (thread.id === threadId ? updater(thread) : thread)));
  };

  const markReviewed = (threadId: string) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      priorityBand: "watching",
      waitingState: "Watching",
      dueRisk: "Review again if changed",
      lastReviewedAt: "Just now",
    }));
  };

  const markWatching = (threadId: string) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      priorityBand: "watching",
      waitingState: "Watching",
      dueRisk: thread.dueRisk.includes("Overdue") ? "Watching after follow-up" : "Watching",
      lastReviewedAt: "Just now",
    }));
  };

  const archiveThread = (threadId: string) => {
    updateThread(threadId, (thread) => ({
      ...thread,
      priorityBand: "archive",
      waitingState: "Resolved",
      dueRisk: "None",
      lastReviewedAt: "Just now",
    }));
  };

  const openProvenanceDrawer = (thread: InboxThread) => {
    const drawer: ProvenanceDrawerContent = {
      kind: "provenance",
      title: thread.subject,
      eyebrow: "Provenance",
      description: "Traceable inputs used to surface the thread and shape the recommendation.",
      items: thread.provenance,
      supportingTrace: [
        `Priority band: ${priorityBandLabel[thread.priorityBand]}`,
        `Waiting state: ${thread.waitingState}`,
        `Last material change: ${thread.lastMaterialChangeAt}`,
      ],
    };

    openDrawer(drawer);
  };

  const openApprovalDrawer = (thread: InboxThread) => {
    if (!thread.approvalPacket) {
      openDrawer({
        title: thread.subject,
        eyebrow: "Approval",
        description: "No approval packet is seeded for this thread yet.",
      });
      return;
    }

    const drawer: ApprovalDrawerContent = {
      kind: "approval",
      title: thread.subject,
      eyebrow: "Approval",
      description: "Review the proposed action, business impact, and editable output before approving.",
      approval: thread.approvalPacket,
    };

    openDrawer(drawer);
  };

  const openTaskDrawer = (thread: InboxThread, description?: string) => {
    const drawer: TaskWorkflowDrawerContent = {
      kind: "task_workflow",
      title: thread.taskPacket.taskTitle,
      eyebrow: "Task and Workflow",
      description: description ?? "Convert thread intelligence into tracked execution.",
      task: cloneTaskPacket(thread.taskPacket),
    };

    openDrawer(drawer);
  };

  const openReplyRuntime = (thread: InboxThread) => {
    openRuntime({
      title: "Reply preview",
      status: "Draft ready",
      lines: [
        `To: ${thread.sender}`,
        `Account: ${thread.account}`,
        `Subject: ${thread.subject}`,
        "",
        thread.recommendedReply,
      ],
      artifactLabel: "Outbound draft",
    });
  };

  const handleAction = (thread: InboxThread, actionKey: InboxActionKey) => {
    if (actionKey === "generate_reply") {
      openReplyRuntime(thread);
      return;
    }

    if (actionKey === "request_approval") {
      openApprovalDrawer(thread);
      return;
    }

    if (actionKey === "set_follow_up" || actionKey === "create_task" || actionKey === "suggest_delegate") {
      openTaskDrawer(thread, actionKey === "suggest_delegate" ? "Adjust the suggested owner, due date, and follow-up plan." : undefined);
      return;
    }

    if (actionKey === "run_workflow") {
      openRuntime({
        title: thread.linkedWorkflow?.label ?? "Workflow runtime",
        status: thread.linkedWorkflow?.status ?? "Ready",
        lines: [
          `Thread: ${thread.subject}`,
          `Workflow: ${thread.linkedWorkflow?.label ?? "None linked"}`,
          `Next step: ${thread.linkedWorkflow?.nextStep ?? "Review needed"}`,
          "",
          thread.nextAction,
        ],
        artifactLabel: thread.linkedWorkflow?.label ?? "Workflow packet",
      });
      return;
    }

    if (actionKey === "open_systems") {
      openRuntime({
        title: "Connected systems",
        status: "Context ready",
        lines: [
          `Account: ${thread.account}`,
          `Project: ${thread.project}`,
          `CRM status: ${thread.contextModules.find((module) => module.title === "CRM and ERP Context")?.items[0]?.value ?? "Limited"}`,
        ],
      });
      return;
    }

    if (actionKey === "analyze_attachments") {
      openRuntime({
        title: "Attachment analysis",
        status: "Ready",
        lines: [
          `Thread: ${thread.subject}`,
          `Attachments: ${thread.attachments.join(", ") || "None"}`,
          "",
          thread.preview,
        ],
        artifactLabel: thread.attachments[0],
      });
      return;
    }

    if (actionKey === "mark_reviewed") {
      markReviewed(thread.id);
      return;
    }

    if (actionKey === "watch") {
      markWatching(thread.id);
      return;
    }

    if (actionKey === "archive") {
      archiveThread(thread.id);
    }
  };

  const handleOpenAttachment = (thread: InboxThread, attachment: string) => {
    openRuntime({
      title: attachment,
      status: "Inspection ready",
      lines: [
        `Thread: ${thread.subject}`,
        `Attachment: ${attachment}`,
        "",
        "Seeded preview surface. Replace with real artifact rendering in a later integration pass.",
      ],
      artifactLabel: attachment,
    });
  };

  const handleOpenInNewTab = (thread: InboxThread) => {
    const nextTabId = createTab("/inbox");
    if (!nextTabId) return;

    setPageState(`${nextTabId}:inbox-thread`, thread.id);
    setPageState(`${nextTabId}:inbox-priority-filter`, priorityFilter);
    setPageState(`${nextTabId}:inbox-search`, search);
    setPageState(`${nextTabId}:inbox-sort`, sortKey);
  };

  const handleRowKeyDown = (threadId: string, event: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = filteredThreads.findIndex((thread) => thread.id === threadId);
    if (currentIndex === -1) return;

    const moveTo = (nextIndex: number) => {
      const nextThread = filteredThreads[nextIndex];
      if (!nextThread) return;
      setSelectedId(nextThread.id);
      rowRefs.current[nextThread.id]?.focus();
      if (isMobile) setMobileWorkspaceOpen(true);
    };

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveTo(Math.min(filteredThreads.length - 1, currentIndex + 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      moveTo(Math.max(0, currentIndex - 1));
    }

    if (event.key === "Enter" && isMobile) {
      setMobileWorkspaceOpen(true);
    }
  };

  const openWorkspace = (threadId: string) => {
    setSelectedId(threadId);
    if (isMobile) {
      setMobileWorkspaceOpen(true);
    }
  };

  return (
    <div className="px-0 py-0">
      <div className="mx-auto max-w-none space-y-3">
        <div className="space-y-3 px-0 pt-0">
          <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_180px_180px] xl:grid-cols-[minmax(0,1fr)_200px_200px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="h-9 rounded-none border-border bg-card pl-9 font-sans text-sm shadow-none focus-visible:ring-0 sm:h-10"
                placeholder="Search threads, company, account"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <select className={selectClassName} value={sortKey} onChange={(event) => setSortKey(event.target.value as InboxSortKey)}>
              <option value="priority">Sort priority</option>
              <option value="recent_change">Sort recent</option>
              <option value="due_risk">Sort due risk</option>
            </select>
            <button
              className="inline-flex h-9 items-center justify-center gap-2 border border-border bg-card px-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground sm:h-10 sm:px-3 sm:text-[11px] sm:tracking-[0.14em]"
              onClick={() => markReviewed(activeThread?.id ?? "")}
              type="button"
              aria-label="Mark current thread reviewed"
              disabled={!activeThread}
            >
              <CheckCheck className="h-4 w-4" />
              Mark reviewed
            </button>
          </div>

          <div className="overflow-hidden pb-1">
            <div className="flex flex-nowrap items-center gap-1.5">
              {priorityFilters.map((filter) => (
                <SmallButton
                  key={filter.key}
                  active={filter.key === priorityFilter}
                  onClick={() => setPriorityFilter(filter.key)}
                  className="h-8 shrink-0 px-2 py-1 text-[9px] tracking-[0.08em] sm:h-8 sm:px-2.5 sm:text-[10px] sm:tracking-[0.1em]"
                >
                  {filter.label} {filterCounts[filter.key]}
                </SmallButton>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[332px_minmax(0,1fr)]">
          <Surface className="overflow-hidden xl:h-[calc(100vh-13.5rem)]">
            {queueAlert ? (
              <div className="border-b border-border px-4 py-4">
                <div className="border border-primary px-3 py-3" role="alert">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-primary">{queueAlert}</p>
                </div>
              </div>
            ) : null}

            {scenario === "loading" ? <QueueSkeleton /> : null}

            {scenario !== "loading" && !filteredThreads.length ? (
              <div className="p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">No priority threads</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Review watched items, inspect auto-handled work, or ask Ubik for a fresh briefing when the queue is quiet.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <SmallButton onClick={() => setPriorityFilter("watching")}>Open watched</SmallButton>
                  <SmallButton onClick={() => setPriorityFilter("auto_handled")}>Auto-handled</SmallButton>
                  <SmallButton onClick={() => setPriorityFilter("awaiting_approval")}>Review approvals</SmallButton>
                </div>
              </div>
            ) : null}

            {scenario !== "loading" && filteredThreads.length ? (
              <div className="h-full overflow-auto">
                {filteredThreads.map((thread) => (
                  <div key={thread.id}>
                    <QueueRow
                      active={activeThread?.id === thread.id}
                      buttonRef={(node) => {
                        rowRefs.current[thread.id] = node;
                      }}
                      thread={thread}
                      onSelect={() => openWorkspace(thread.id)}
                      onKeyDown={(event) => handleRowKeyDown(thread.id, event)}
                      onMarkReviewed={() => markReviewed(thread.id)}
                      onWatch={() => markWatching(thread.id)}
                      onArchive={() => archiveThread(thread.id)}
                      onOpenInNewTab={() => handleOpenInNewTab(thread)}
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </Surface>

          {!isMobile
            ? scenario === "loading"
              ? <WorkspaceSkeleton />
              : (
                <Workspace
                  activeThread={activeThread}
                  provenanceExpanded={provenanceExpanded}
                  onToggleProvenance={() => setProvenanceExpanded(!provenanceExpanded)}
                  onPrimaryAction={(key) => activeThread && handleAction(activeThread, key)}
                  onSecondaryAction={(key) => activeThread && handleAction(activeThread, key)}
                  onAnalyzeAttachment={(attachment) => activeThread && handleOpenAttachment(activeThread, attachment)}
                  onOpenTaskDrawer={() => activeThread && openTaskDrawer(activeThread)}
                  onOpenProvenanceDrawer={() => activeThread && openProvenanceDrawer(activeThread)}
                  onBack={() => setMobileWorkspaceOpen(false)}
                  showBackButton={false}
                />
              )
            : null}
        </div>

        <Sheet open={isMobile && mobileWorkspaceOpen && !!activeThread} onOpenChange={setMobileWorkspaceOpen}>
          <SheetContent side="right" className="w-full max-w-none rounded-none border-l border-border bg-background p-0 shadow-none">
            <SheetTitle className="sr-only">Thread workspace</SheetTitle>
            <SheetDescription className="sr-only">
              Mobile thread workspace for reviewing the selected inbox item.
            </SheetDescription>
            <div className="max-h-screen overflow-auto p-4">
              <Workspace
                activeThread={activeThread}
                provenanceExpanded={provenanceExpanded}
                onToggleProvenance={() => setProvenanceExpanded(!provenanceExpanded)}
                onPrimaryAction={(key) => activeThread && handleAction(activeThread, key)}
                onSecondaryAction={(key) => activeThread && handleAction(activeThread, key)}
                onAnalyzeAttachment={(attachment) => activeThread && handleOpenAttachment(activeThread, attachment)}
                onOpenTaskDrawer={() => activeThread && openTaskDrawer(activeThread)}
                onOpenProvenanceDrawer={() => activeThread && openProvenanceDrawer(activeThread)}
                onBack={() => setMobileWorkspaceOpen(false)}
                showBackButton
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
