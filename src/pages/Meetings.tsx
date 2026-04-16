import { useEffect, useMemo, useState } from "react";
import {
  AudioLines,
  CalendarDays,
  CheckSquare,
  ChevronsDown,
  Clock3,
  ChevronRight,
  Files,
  FolderPlus,
  Folder,
  FolderClosed,
  Lock,
  Link2,
  Mic,
  NotebookPen,
  SearchCheck,
  Search,
  Send,
  Share2,
  Trash2,
  Pin,
  Users,
} from "lucide-react";

import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { PageContainer } from "@/components/page-container";
import { useWorkbenchState } from "@/hooks/use-shell-state";
import { meetings } from "@/lib/ubik-data";
import type { MeetingRecord } from "@/lib/ubik-types";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type BuiltInMeetingSpaceId = "all" | "my-notes" | "thai-union" | "maersk" | "redwood-foods" | "harbor-retail";
type MeetingSpaceId = BuiltInMeetingSpaceId | `custom-${string}`;
type FolderTab = "notes" | "files" | "people";
type FolderCanvasMode = "workspace" | "note";
type FolderActionKind = "todos" | "summary" | "projects" | "custom";

type CustomerSpace = {
  id: MeetingSpaceId;
  name: string;
  description: string;
  initials: string;
  locked?: boolean;
  shared?: boolean;
  pinned?: boolean;
  isCustom?: boolean;
};

type GeneratedFolderNote = {
  title: string;
  prompt: string;
  sourceLabel: string;
  sections: { heading: string; items: string[] }[];
};

type MeetingWorkspaceRecord = MeetingRecord & {
  customerId: Exclude<BuiltInMeetingSpaceId, "all">;
  customerName: string;
  dayGroup: "Today" | "Yesterday" | "Last week";
  duration: string;
  startClock: string;
  participantsCount: number;
  labels: string[];
  prepSummary: string;
  prepChecklist: string[];
  highlights: string[];
  notes: string[];
  transcript: { speaker: string; text: string }[];
  kind: "meeting" | "quick_note";
  nextJoinIn?: string;
  risksAndBlockers?: string[];
  keyInsights?: string[];
  topicsCovered?: string[];
};

const meetingIndex = new Map(meetings.map((meeting) => [meeting.id, meeting]));

function getMeeting(id: string) {
  const meeting = meetingIndex.get(id);
  if (!meeting) {
    throw new Error(`Meeting dataset is missing ${id}`);
  }
  return meeting;
}

function buildWorkspaceMeeting(
  baseMeeting: MeetingRecord,
  extras: Omit<MeetingWorkspaceRecord, keyof MeetingRecord>,
): MeetingWorkspaceRecord {
  return {
    ...baseMeeting,
    ...extras,
  };
}

const workspaceMeetings: MeetingWorkspaceRecord[] = [
  buildWorkspaceMeeting(getMeeting("meeting-1"), {
    customerId: "thai-union",
    customerName: "Thai Union",
    dayGroup: "Today",
    duration: "45 min",
    startClock: "10:30 AM",
    participantsCount: 3,
    labels: ["Compliance", "Supplier review"],
    prepSummary: "Walk in with the missing document list, the approval recommendation, and the PO release posture already aligned.",
    prepChecklist: [
      "Bring the exception packet from Inbox and the supplier audit status.",
      "Clarify whether the extension is 24 hours or a staged upload.",
      "Agree who owns tomorrow's document checkpoint and buyer messaging.",
    ],
    highlights: [
      "The supplier wants time, but the business risk is really around letting PO release outrun document verification.",
      "This call should end with one owner, one deadline, and one approval posture.",
      "The compliance workflow already assembled the relevant exception history, so prep should be fast.",
    ],
    notes: [
      "Goal: leave the meeting with a single decision on extension terms and whether manual approval stays in place.",
      "The operator should be ready to show the last approved exception, because the supplier is likely to compare against that precedent.",
      "If Thai Union can only partially upload today, log a midpoint checkpoint instead of promising a full resolution.",
    ],
    transcript: [
      { speaker: "Compliance Bot", text: "Last comparable exception cleared with a 24-hour extension and manual PO review preserved." },
      { speaker: "Raj Mehta", text: "We can tolerate a short extension, but not if the workflow unlocks before the files are validated." },
      { speaker: "You", text: "The meeting should settle the extension window, the follow-up owner, and the release guardrail in one pass." },
    ],
    kind: "meeting",
    nextJoinIn: "in 22m",
  }),
  buildWorkspaceMeeting(getMeeting("meeting-2"), {
    customerId: "maersk",
    customerName: "Maersk",
    dayGroup: "Today",
    duration: "30 min",
    startClock: "2:00 PM",
    participantsCount: 3,
    labels: ["Logistics", "Customer comms"],
    prepSummary: "Use the delay card, revised ETA, and customer communication path so ops can leave with one message and one checkpoint.",
    prepChecklist: [
      "Confirm the newest ETA and whether inspection timing is still moving.",
      "Decide if the customer note goes now or after the port update.",
      "Attach open inbox threads related to YB-7221 before the call starts.",
    ],
    highlights: [
      "This call is less about the delay itself and more about communication discipline.",
      "Every participant needs to leave knowing the next customer checkpoint time.",
      "If inspection slips again, the buyer note should already be drafted.",
    ],
    notes: [
      "The customer is likely to accept a provisional ETA if the next update time is explicit.",
      "Ops should not leave the room with multiple versions of the same timeline.",
      "Tie the outcome back to the project timeline immediately after the call.",
    ],
    transcript: [
      { speaker: "Ops desk", text: "The port can give us a handoff window, but not a clean inspection close time yet." },
      { speaker: "Sarah Kim", text: "If we wait too long to update the buyer, the surprise matters more than the six-hour slip." },
      { speaker: "You", text: "The meeting should end with one ETA, one owner, and one outbound communication plan." },
    ],
    kind: "meeting",
    nextJoinIn: "in 3h",
  }),
  buildWorkspaceMeeting(getMeeting("meeting-3"), {
    customerId: "redwood-foods",
    customerName: "Redwood Foods",
    dayGroup: "Today",
    duration: "18 min",
    startClock: "8:15 AM",
    participantsCount: 3,
    labels: ["Daily brief", "Risk review"],
    prepSummary: "This is the operator snapshot that turned inbox pressure into the rest of today's meeting queue.",
    prepChecklist: [
      "Follow through on the Sarah Kim rate-confirmation reply.",
      "Carry the Thai Union approval recommendation into the supplier review call.",
      "Keep the pricing monitor on the same cadence unless anomaly depth changes.",
    ],
    highlights: [
      "The morning brief is where inbox decisions became meeting actions.",
      "Two themes came out: approval discipline and better follow-through on customer commitments.",
      "This note is useful as a bridge between meetings, inbox, and approvals.",
    ],
    notes: [
      "Use this note as the daily anchor: it holds why the supplier review matters and what still needs to move today.",
      "The brief already points to the two most important downstream tasks: Sarah's reply and the supplier packet.",
      "This is the best surface to start a quick follow-up note against Redwood Foods.",
    ],
    transcript: [
      { speaker: "Inbox triage agent", text: "Two urgent threads surfaced, both tied directly to same-day commercial decisions." },
      { speaker: "Pricing monitor", text: "No cadence change recommended, only a watch on the Atlantic Fresh anomalies." },
      { speaker: "You", text: "Keep the day organized around approvals first, then convert them into meeting prep and follow-through." },
    ],
    kind: "meeting",
  }),
  {
    id: "meeting-4",
    title: "Redwood Foods renewal prep quick note",
    time: "Today · 11:58 AM PST",
    stage: "Completed",
    owner: "Hemanth",
    participants: ["Me"],
    summary: "A short scratchpad note before the commercial renewal call to capture objections, prep language, and stakeholder sequence.",
    agenda: ["Renewal risks", "Who to involve", "Customer tone"],
    decisions: ["Keep legal copied on commercial language review."],
    actionItems: ["Move the best objections into the renewal prep packet."],
    customerId: "my-notes",
    customerName: "My notes",
    dayGroup: "Today",
    duration: "7 min",
    startClock: "11:58 AM",
    participantsCount: 1,
    labels: ["Quick note", "Commercial"],
    prepSummary: "This is a scratchpad capture, it should stay easy to reuse and easy to move into a customer folder later.",
    prepChecklist: [
      "Promote reusable objections into the customer prep packet.",
      "Keep the quick note private until the commercial language is final.",
      "Convert one idea into a formal prep brief if the renewal call expands.",
    ],
    highlights: [
      "Quick notes should behave like a staging area, not a dead-end note list.",
      "This is the exact kind of note the customer folder rail should make easy to find.",
      "One tap should be enough to move it into a shared customer space later.",
    ],
    notes: [
      "The main renewal objection is still around delivery flexibility, not price.",
      "Legal should stay in the loop if the buyer pushes for broad exception language.",
      "If this becomes a formal meeting, convert the note into a prep pack first.",
    ],
    transcript: [
      { speaker: "Me", text: "Capture the top objections before the renewal call so prep feels deliberate instead of reactive." },
      { speaker: "Me", text: "Keep this in private notes until the commercial angle is ready to share." },
    ],
    kind: "quick_note",
  },
  {
    id: "meeting-5",
    title: "Harbor Retail delivery reset",
    time: "Yesterday · 4:40 PM PST",
    stage: "Completed",
    owner: "Hemanth",
    participants: ["Alicia Torres", "Ops desk"],
    summary: "A recovery call after a missed ETA commitment, focused on resetting expectations and confirming the next checkpoint.",
    agenda: ["Acknowledge miss", "Share revised ETA", "Set checkpoint time"],
    decisions: ["Send the revised note before close of day and commit to tomorrow's checkpoint."],
    actionItems: ["Tie the new ETA note back to the open follow-up thread."],
    customerId: "harbor-retail",
    customerName: "Harbor Retail",
    dayGroup: "Yesterday",
    duration: "26 min",
    startClock: "4:40 PM",
    participantsCount: 2,
    labels: ["Follow-up", "Customer risk"],
    prepSummary: "This was the recovery motion after a missed buyer commitment, the note should stay one click away from the follow-up thread.",
    prepChecklist: [
      "Reuse the apology plus next-checkpoint pattern if another ETA slip happens.",
      "Keep the updated delivery note linked to this meeting history.",
      "Watch for a second missed commitment before escalating wider.",
    ],
    highlights: [
      "The buyer cared more about missed follow-through than about the revised ETA itself.",
      "This history belongs inside Harbor Retail's folder so the next operator sees the trust context immediately.",
      "A short recovery note is often more useful than a long transcript here.",
    ],
    notes: [
      "Alicia responded best when the next checkpoint was precise.",
      "Future notes for Harbor Retail should surface the relationship risk earlier.",
      "The team should avoid promising same-day updates unless ops has already confirmed timing.",
    ],
    transcript: [
      { speaker: "Alicia Torres", text: "The revised ETA matters, but the bigger issue is hearing nothing after a promise was made." },
      { speaker: "Ops desk", text: "We have the new timing now, we can commit to a precise morning checkpoint." },
      { speaker: "You", text: "Let's reset trust with one note now and one explicit follow-up time tomorrow." },
    ],
    kind: "meeting",
  },
  {
    id: "meeting-6",
    title: "Redwood Foods email sync strategy planning",
    time: "Last week · Thu 1:30 PM PST",
    stage: "Completed",
    owner: "Hemanth",
    participants: ["Priya", "Ganesh", "Sai Kiran"],
    summary: "A product and workflow planning session on email sync, recap sharing, and how meeting notes connect into the working app.",
    agenda: ["Backend gaps", "Meeting note UX", "Rollout plan"],
    decisions: [
      "Ship the first meeting space on the existing backend.",
      "Keep the notes experience tightly connected to follow-up actions.",
    ],
    actionItems: [
      "Prototype the meeting workspace UI on the current app shell.",
      "Map reusable notes actions into the existing backend flows.",
    ],
    customerId: "redwood-foods",
    customerName: "Redwood Foods",
    dayGroup: "Last week",
    duration: "73 min",
    startClock: "1:30 PM",
    participantsCount: 4,
    labels: ["Planning", "Transcript"],
    prepSummary: "This is the larger planning note that inspired the next generation of the meetings workspace.",
    prepChecklist: [
      "Keep history, prep, and follow-up tightly connected in the UI.",
      "Make quick notes feel native, not bolted on.",
      "Avoid forcing users to jump out to other tabs for simple meeting continuity tasks.",
    ],
    highlights: [
      "The meeting space should feel like a durable notebook, not just a feed of transcripts.",
      "Customer folders are the right abstraction for returning to related meetings fast.",
      "Prep, recording, and history should live in one page so operators do not lose context.",
    ],
    notes: [
      "The backend is already present, so the UI should focus on better organization and visualization first.",
      "Transcript views are useful, but they should never bury the action items and highlights.",
      "The best outcome is a Meetings page that feels like a home for customer continuity.",
    ],
    transcript: [
      { speaker: "Ganesh", text: "We should reuse whatever the current backend already exposes and make the UI feel much sharper." },
      { speaker: "Sai Kiran", text: "Folders by customer will make the notes feel practical, not just pretty." },
      { speaker: "You", text: "Prep, notes, and history need to sit together so it feels like a real meeting workspace." },
    ],
    kind: "meeting",
  },
];

const fixedCustomerSpaces: CustomerSpace[] = [
  {
    id: "all",
    name: "All meetings",
    description: "All notes and calls",
    initials: "AM",
  },
  {
    id: "my-notes",
    name: "My notes",
    description: "Private notes",
    initials: "MN",
    locked: true,
  },
];

const initialMovableCustomerSpaces: CustomerSpace[] = [
  {
    id: "thai-union",
    name: "Thai Union",
    description: "Supplier review",
    initials: "TU",
    shared: true,
  },
  {
    id: "maersk",
    name: "Maersk",
    description: "Logistics sync",
    initials: "MK",
    shared: true,
  },
  {
    id: "redwood-foods",
    name: "Redwood Foods",
    description: "Commercial planning",
    initials: "RF",
    shared: true,
  },
  {
    id: "harbor-retail",
    name: "Harbor Retail",
    description: "Delivery reset",
    initials: "HR",
    shared: true,
  },
];

const dayGroupOrder: MeetingWorkspaceRecord["dayGroup"][] = ["Today", "Yesterday", "Last week"];

function matchesSpace(meeting: MeetingWorkspaceRecord, spaceId: MeetingSpaceId) {
  if (spaceId === "all") return true;
  if (spaceId === "my-notes") return meeting.kind === "quick_note";
  if (spaceId.startsWith("custom-")) return false;
  return meeting.customerId === spaceId;
}

function buildFolderId(name: string) {
  return `custom-${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "folder"}-${Date.now()}` as const;
}

function buildInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return (parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "CF").slice(0, 2);
}

function parseDurationMinutes(duration: string) {
  const value = parseInt(duration, 10);
  return Number.isFinite(value) ? value : 0;
}

function LabelCreatorPlaceholder({ labels }: { labels: string[] }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {labels.map((label) => (
        <span
          key={label}
          className="inline-flex items-center rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1 text-[12px] text-foreground/62"
        >
          {label}
        </span>
      ))}
      <button
        className="inline-flex h-7 items-center rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 text-[11px] text-foreground/52 transition-colors hover:bg-[hsl(var(--foreground)/0.1)] hover:text-foreground/72"
        onClick={() =>
          toast("Labels coming next", {
            description: "This will open label creation once the meeting label system is wired in.",
          })
        }
        type="button"
      >
        Add label
      </button>
    </div>
  );
}

export default function Meetings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { meetingId } = useParams<{ meetingId: string }>();
  const [selectedSpaceId, setSelectedSpaceId] = useWorkbenchState<MeetingSpaceId>("meetings-space-id", "all");
  const [selectedMeetingId, setSelectedMeetingId] = useWorkbenchState<string>("meeting-id", workspaceMeetings[0].id);
  const [searchQuery, setSearchQuery] = useWorkbenchState<string>("meetings-search", "");
  const [folderPrompt, setFolderPrompt] = useWorkbenchState<string>("meetings-folder-prompt", "");
  const [meetingChatPrompt, setMeetingChatPrompt] = useWorkbenchState<string>("meetings-chat-prompt", "");
  const [generatedNoteFollowUpPrompt, setGeneratedNoteFollowUpPrompt] = useWorkbenchState<string>(
    "meetings-generated-note-follow-up",
    "",
  );
  const [folderTab, setFolderTab] = useWorkbenchState<FolderTab>("meetings-folder-tab", "notes");
  const [suggestionDismissed, setSuggestionDismissed] = useWorkbenchState<boolean>("meetings-folder-suggestion-dismissed", false);
  const [folderCanvasMode, setFolderCanvasMode] = useWorkbenchState<FolderCanvasMode>("meetings-folder-canvas-mode", "workspace");
  const [folderActionKind, setFolderActionKind] = useWorkbenchState<FolderActionKind>("meetings-folder-action-kind", "custom");
  const [generatedFolderNote, setGeneratedFolderNote] = useWorkbenchState<GeneratedFolderNote | null>("meetings-generated-folder-note", null);
  const [isGeneratedPromptExpanded, setIsGeneratedPromptExpanded] = useState(false);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useWorkbenchState<boolean>("meetings-create-folder-open", false);
  const [newFolderName, setNewFolderName] = useWorkbenchState<string>("meetings-new-folder-name", "");
  const [movableCustomerSpaces, setMovableCustomerSpaces] = useWorkbenchState<CustomerSpace[]>(
    "meetings-movable-customer-spaces",
    initialMovableCustomerSpaces,
  );
  const [draggingSpaceId, setDraggingSpaceId] = useState<MeetingSpaceId | null>(null);

  const visibleMeetings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return workspaceMeetings.filter((meeting) => {
      if (!matchesSpace(meeting, selectedSpaceId)) return false;
      if (!query) return true;

      const haystack = [
        meeting.title,
        meeting.customerName,
        meeting.summary,
        meeting.owner,
        meeting.labels.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [searchQuery, selectedSpaceId]);
  const routeMeeting = useMemo(
    () => (meetingId ? workspaceMeetings.find((meeting) => meeting.id === meetingId) ?? null : null),
    [meetingId],
  );
  const customerSpaces = useMemo(() => [...fixedCustomerSpaces, ...movableCustomerSpaces], [movableCustomerSpaces]);
  const isMeetingDetailView = Boolean(meetingId);

  useEffect(() => {
    if (!visibleMeetings.length) return;
    if (!visibleMeetings.some((meeting) => meeting.id === selectedMeetingId)) {
      setSelectedMeetingId(visibleMeetings[0].id);
    }
  }, [selectedMeetingId, setSelectedMeetingId, visibleMeetings]);
  useEffect(() => {
    if (!routeMeeting) return;
    if (selectedSpaceId !== routeMeeting.customerId) {
      setSelectedSpaceId(routeMeeting.customerId);
    }
    if (selectedMeetingId !== routeMeeting.id) {
      setSelectedMeetingId(routeMeeting.id);
    }
  }, [routeMeeting, selectedMeetingId, selectedSpaceId, setSelectedMeetingId, setSelectedSpaceId]);

  const selectedMeeting =
    routeMeeting ??
    visibleMeetings.find((meeting) => meeting.id === selectedMeetingId) ??
    visibleMeetings[0] ??
    workspaceMeetings[0];
  const selectedSpace = customerSpaces.find((space) => space.id === selectedSpaceId) ?? customerSpaces[0];
  const groupedHistory = dayGroupOrder
    .map((dayGroup) => ({
      dayGroup,
      meetings: visibleMeetings.filter((meeting) => meeting.dayGroup === dayGroup),
    }))
    .filter((group) => group.meetings.length > 0);
  const folderPeople = Array.from(
    new Set(
      visibleMeetings.flatMap((meeting) => meeting.participants),
    ),
  );
  const folderFiles = visibleMeetings.map((meeting) => ({
    id: `file-${meeting.id}`,
    name: `${meeting.title} notes.md`,
    scope: meeting.customerName,
    time: meeting.startClock,
  }));

  const spacesWithCounts = customerSpaces.map((space) => ({
    ...space,
    count: workspaceMeetings.filter((meeting) => matchesSpace(meeting, space.id)).length,
  }));
  const suggestedNote = workspaceMeetings.find((meeting) => !matchesSpace(meeting, selectedSpaceId));
  const showSuggestedNote = !isMeetingDetailView && !suggestionDismissed && suggestedNote;
  const sectionLabelClass = "font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/70";
  const railButtonClass =
    "inline-flex h-11 min-w-0 w-full items-center justify-start gap-2 overflow-hidden border border-border bg-background px-3 text-left text-[11px] uppercase tracking-[0.08em] text-foreground transition-colors hover:bg-[hsl(var(--foreground)/0.03)]";
  const getFolderActionLabel = (kind: FolderActionKind) => {
    if (kind === "todos") return "follow-through note";
    if (kind === "projects") return "project snapshot";
    if (kind === "summary") return "folder summary";
    return "custom note";
  };
  const buildFolderPrompt = (kind: FolderActionKind) => {
    const baseMeetingTitles = visibleMeetings.slice(0, 5).map((meeting) => meeting.title).join("; ");
    if (kind === "todos") {
      return [
        `List the recent todos for the ${selectedSpace.name} folder.`,
        `Focus on what still needs follow-through across ${visibleMeetings.length} notes.`,
        `Recent notes: ${baseMeetingTitles}`,
      ].join(" ");
    }

    if (kind === "summary") {
      return [
        `Summarize the ${selectedSpace.name} folder.`,
        "Group the output into active themes, open loops, and what should happen next.",
        `Recent notes: ${baseMeetingTitles}`,
      ].join(" ");
    }

    if (kind === "projects") {
      return [
        `Show in-flight projects for the ${selectedSpace.name} folder.`,
        "Organize by current motion, owner, and next checkpoint.",
        `Recent notes: ${baseMeetingTitles}`,
      ].join(" ");
    }

    return folderPrompt.trim() || `Summarize key notes and open tasks in the ${selectedSpace.name} folder.`;
  };

  const presetFolderPrompt = (kind: FolderActionKind) => {
    setFolderActionKind(kind);
    setFolderPrompt(buildFolderPrompt(kind));
  };

  const generateFolderNote = (kind = folderActionKind, promptOverride?: string) => {
    const prompt = promptOverride?.trim() || folderPrompt.trim() || buildFolderPrompt(kind);
    const recentMeetings = visibleMeetings.slice(0, 5);
    const allActionItems = Array.from(new Set(visibleMeetings.flatMap((meeting) => meeting.actionItems))).slice(0, 8);
    const allDecisions = Array.from(new Set(visibleMeetings.flatMap((meeting) => meeting.decisions))).slice(0, 6);
    const allHighlights = Array.from(new Set(visibleMeetings.flatMap((meeting) => meeting.highlights))).slice(0, 6);

    const title =
      kind === "todos"
        ? `${selectedSpace.name} follow-through`
        : kind === "projects"
          ? `${selectedSpace.name} active work`
          : `${selectedSpace.name} note summary`;

    const sections =
      kind === "todos"
        ? [
            {
              heading: "Open Items",
              items: allActionItems.length ? allActionItems : ["No open follow-through items found in this folder."],
            },
            {
              heading: "Recent Context",
              items: recentMeetings.map((meeting) => `${meeting.title}, ${meeting.startClock}, ${meeting.duration}`),
            },
            {
              heading: "Keep In View",
              items: allHighlights.length ? allHighlights.slice(0, 4) : ["Keep the next owner and checkpoint clear in follow-up notes."],
            },
          ]
        : kind === "projects"
          ? [
              {
                heading: "Current Motion",
                items: recentMeetings.map((meeting) => `${meeting.customerName}: ${meeting.summary}`),
              },
              {
                heading: "Owners And Next Steps",
                items: recentMeetings.map((meeting) => `${meeting.owner}: ${meeting.actionItems[0] ?? "Review latest note and define next checkpoint."}`),
              },
              {
                heading: "Risks",
                items: Array.from(new Set(recentMeetings.flatMap((meeting) => meeting.prepChecklist))).slice(0, 5),
              },
            ]
          : [
              {
                heading: "Key Themes",
                items: allHighlights.length ? allHighlights : ["No themes available yet for this folder."],
              },
              {
                heading: "Decisions",
                items: allDecisions.length ? allDecisions : ["No formal decisions captured yet."],
              },
              {
                heading: "Next Steps",
                items: allActionItems.length ? allActionItems : ["Create a follow-up note from the next customer checkpoint."],
              },
            ];

    setGeneratedFolderNote({
      title,
      prompt,
      sourceLabel: getFolderActionLabel(kind),
      sections,
    });
    setIsGeneratedPromptExpanded(false);
    setFolderCanvasMode("note");
  };

  const askFolder = () => {
    setFolderActionKind("custom");
    generateFolderNote("custom");
  };
  const continueGeneratedNote = () => {
    const prompt = generatedNoteFollowUpPrompt.trim();
    if (!prompt) return;
    setFolderPrompt(prompt);
    setFolderActionKind("custom");
    generateFolderNote("custom", prompt);
    setGeneratedNoteFollowUpPrompt("");
  };
  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;

    const nextSpace: CustomerSpace = {
      id: buildFolderId(name),
      name,
      description: "Custom folder",
      initials: buildInitials(name),
      isCustom: true,
    };

    setMovableCustomerSpaces([...movableCustomerSpaces, nextSpace]);
    setSelectedSpaceId(nextSpace.id);
    toast("Folder created", {
      description: `${name} is ready for notes and meeting history.`,
    });
    setNewFolderName("");
    setIsCreateFolderOpen(false);
  };
  const togglePinSpace = (spaceId: MeetingSpaceId) => {
    setMovableCustomerSpaces(
      movableCustomerSpaces.map((space) =>
        space.id === spaceId
          ? {
              ...space,
              pinned: !space.pinned,
            }
          : space,
      ),
    );
  };
  const deleteSpace = (spaceId: MeetingSpaceId) => {
    const nextSpaces = movableCustomerSpaces.filter((space) => space.id !== spaceId);
    setMovableCustomerSpaces(nextSpaces);

    if (selectedSpaceId === spaceId) {
      const fallbackSpace = nextSpaces[0]?.id ?? "all";
      setSelectedSpaceId(fallbackSpace);
    }
  };
  const reorderSpace = (sourceId: MeetingSpaceId, targetId: MeetingSpaceId) => {
    if (sourceId === targetId) return;

    const sourceIndex = movableCustomerSpaces.findIndex((space) => space.id === sourceId);
    const targetIndex = movableCustomerSpaces.findIndex((space) => space.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const nextSpaces = [...movableCustomerSpaces];
    const [movedSpace] = nextSpaces.splice(sourceIndex, 1);
    nextSpaces.splice(targetIndex, 0, movedSpace);
    setMovableCustomerSpaces(nextSpaces);
  };
  const openMeetingDetail = (nextMeetingId: string) => {
    setSelectedMeetingId(nextMeetingId);
    navigate({
      pathname: `/meetings/${nextMeetingId}`,
      search: location.search,
    });
  };
  const closeMeetingDetail = () => {
    navigate({
      pathname: "/meetings",
      search: location.search,
    });
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden px-3 py-4 lg:px-6 lg:py-5">
      <PageContainer className="h-full min-h-0">
        <div className="grid h-full min-h-0 gap-2 xl:grid-cols-[292px_minmax(0,1fr)]">
          <Surface className="flex min-h-0 flex-col overflow-hidden bg-background">
            <div className="border-b border-border px-3 py-3">
              <p className={sectionLabelClass}>Customer Spaces</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <SmallButton
                  aria-label="Invite collaborators"
                  onClick={() =>
                    toast("Invite ready", {
                      description: "This would invite collaborators into a shared customer folder.",
                    })
                  }
                >
                  <Users className="mr-2 h-3.5 w-3.5" /> Invite
                </SmallButton>
                <SmallButton
                  active
                  aria-label="Create quick note"
                  onClick={() =>
                    toast("Quick note created", {
                      description: "A new scratchpad would open inside My notes.",
                    })
                  }
                >
                  <NotebookPen className="mr-2 h-3.5 w-3.5" /> Quick note
                </SmallButton>
              </div>
            </div>

            <div className="border-b border-border px-3 py-3">
              <div className="flex items-center gap-2 border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-foreground/70" />
                <input
                  aria-label="Search meetings"
                  className="w-full bg-transparent text-sm text-foreground outline-none"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search meetings, customers, or labels"
                  value={searchQuery}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="space-y-0">
                {spacesWithCounts.map((space) => {
                  const active = selectedSpaceId === space.id;
                  const movableIndex = movableCustomerSpaces.findIndex((item) => item.id === space.id);
                  const isMovable = movableIndex !== -1;
                  return (
                    <div
                      key={space.id}
                      className={cn(
                        "group flex items-center gap-[var(--panel-row-gap)] border-b pl-3 pr-2 transition-colors",
                        active
                          ? "border-b-foreground bg-foreground text-background"
                          : "border-b-border bg-background text-foreground hover:bg-[hsl(var(--foreground)/0.03)]",
                        isMovable && "cursor-grab active:cursor-grabbing",
                        draggingSpaceId === space.id && "opacity-60",
                      )}
                      draggable={isMovable}
                      onDragEnd={() => setDraggingSpaceId(null)}
                      onDragOver={(event) => {
                        if (!isMovable || !draggingSpaceId || draggingSpaceId === space.id) return;
                        event.preventDefault();
                      }}
                      onDragStart={() => {
                        if (!isMovable) return;
                        setDraggingSpaceId(space.id);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        if (!isMovable || !draggingSpaceId) return;
                        reorderSpace(draggingSpaceId, space.id);
                        setDraggingSpaceId(null);
                      }}
                    >
                      <button
                        className="flex min-w-0 flex-1 items-center gap-[var(--panel-row-content-gap)] py-[var(--panel-row-y)] text-left"
                        onClick={() => setSelectedSpaceId(space.id)}
                        type="button"
                      >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="truncate font-mono text-[10px] uppercase tracking-[0.14em]">{space.name}</p>
                          {space.locked ? <Lock className="h-3.5 w-3.5 shrink-0" /> : null}
                          {space.shared ? <Users className="h-3.5 w-3.5 shrink-0" /> : null}
                          {space.pinned ? <Pin className="h-3.5 w-3.5 shrink-0" /> : null}
                        </div>
                      </div>
                      </button>
                      <div className="flex items-center gap-1">
                        {isMovable ? (
                          <div className="flex items-center gap-0.5">
                            <button
                              aria-label={space.pinned ? `Unpin ${space.name}` : `Pin ${space.name}`}
                              className={cn(
                                "inline-flex h-[var(--panel-icon-button-size)] w-[var(--panel-icon-button-size)] items-center justify-center opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100",
                                active ? "text-background/80 hover:text-background" : "text-foreground/40 hover:text-foreground",
                              )}
                              onClick={() => togglePinSpace(space.id)}
                              type="button"
                            >
                              <Pin className={cn("h-3.5 w-3.5", space.pinned && "fill-current")} />
                            </button>
                            <button
                              aria-label={`Delete ${space.name}`}
                              className={cn(
                                "inline-flex h-[var(--panel-icon-button-size)] w-[var(--panel-icon-button-size)] items-center justify-center opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100",
                                active ? "text-background/80 hover:text-background" : "text-foreground/36 hover:text-destructive",
                              )}
                              onClick={() => deleteSpace(space.id)}
                              type="button"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : null}
                        <span
                          className={cn(
                            "shrink-0 border px-[var(--panel-chip-padding-x)] py-[var(--panel-chip-padding-y)] font-mono text-[10px] uppercase tracking-[0.12em]",
                            active ? "border-background/30 text-background" : "border-border text-foreground/65",
                          )}
                        >
                          {space.count}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                className="flex w-full items-center justify-between border-b border-dashed border-border px-3 py-[var(--panel-add-row-y)] text-left text-sm text-foreground/72 transition-colors hover:bg-[hsl(var(--foreground)/0.03)] hover:text-foreground"
                onClick={() => setIsCreateFolderOpen(true)}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <FolderPlus className="h-[var(--panel-add-icon-size)] w-[var(--panel-add-icon-size)]" /> Add customer folder
                </span>
                <ChevronRight className="h-[var(--panel-add-icon-size)] w-[var(--panel-add-icon-size)]" />
              </button>
            </div>
          </Surface>

          <Surface className="min-h-0 min-w-0 overflow-hidden bg-background">
            {isMeetingDetailView ? (
              routeMeeting ? (
                <div className="flex h-full min-h-0 flex-col overflow-x-hidden">
                  <div className="border-b border-border px-4 py-3 lg:px-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className={cn(sectionLabelClass)}>{selectedMeeting.customerName}</p>
                        <h2 className="mt-1 text-[22px] leading-tight text-foreground">{selectedMeeting.title}</h2>
                      </div>
                      <button
                        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.12em] text-foreground/58 transition-colors hover:text-foreground"
                        onClick={closeMeetingDetail}
                        type="button"
                      >
                        Back to folder <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-foreground/78">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1">
                        <CalendarDays className="h-3.5 w-3.5" /> {selectedMeeting.time}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1">
                        <Clock3 className="h-3.5 w-3.5" /> {selectedMeeting.duration}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(var(--foreground)/0.06)] px-2.5 py-1">
                        <Users className="h-3.5 w-3.5" /> {selectedMeeting.participantsCount} attendees
                      </span>
                    </div>
                    <LabelCreatorPlaceholder labels={selectedMeeting.labels} />
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto px-4 py-3 lg:px-4">
                    <div className="grid gap-2 xl:grid-cols-[1.22fr_0.94fr]">
                      <div className="space-y-2">
                        <section className="border border-border/80 bg-background p-3">
                          <p className={sectionLabelClass}>Decisions</p>
                          <div className="mt-2 space-y-2 text-sm leading-6 text-foreground/86">
                            {selectedMeeting.decisions.map((item) => (
                              <p key={item}>- {item}</p>
                            ))}
                          </div>
                        </section>

                        <section className="border border-border/80 bg-background p-3">
                          <p className={sectionLabelClass}>Action Items</p>
                          <div className="mt-2 space-y-2 text-sm leading-6 text-foreground/86">
                            {selectedMeeting.actionItems.map((item) => (
                              <p key={item}>- {item}</p>
                            ))}
                          </div>
                        </section>

                        <section className="border border-border/80 bg-background p-3">
                          <p className={sectionLabelClass}>Transcript</p>
                          <div className="mt-2 divide-y divide-border border border-border/80">
                            {selectedMeeting.transcript.map((entry, index) => (
                              <div key={`${entry.speaker}-${index}`} className="px-3 py-3 text-sm leading-6 text-foreground/86">
                                <span className="font-medium text-foreground">{entry.speaker}:</span> {entry.text}
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>

                      <div className="space-y-2">
                        <section className="border border-border/80 bg-background p-3">
                          <p className={sectionLabelClass}>Prep Summary</p>
                          <p className="mt-2 text-sm leading-6 text-foreground/82">{selectedMeeting.prepSummary}</p>
                        </section>

                        <section className="border border-border/80 bg-background p-3">
                          <p className={sectionLabelClass}>Risks And Blockers</p>
                          <div className="mt-2 space-y-2 text-sm leading-6 text-foreground/82">
                            {(selectedMeeting.risksAndBlockers ?? selectedMeeting.prepChecklist).map((item) => (
                              <p key={item}>- {item}</p>
                            ))}
                          </div>
                        </section>

                        <section className="border border-border/80 bg-background p-3">
                          <p className={sectionLabelClass}>Key Insights</p>
                          <div className="mt-2 space-y-2 text-sm leading-6 text-foreground/82">
                            {(selectedMeeting.keyInsights ?? selectedMeeting.highlights).map((item) => (
                              <p key={item}>- {item}</p>
                            ))}
                          </div>
                        </section>

                        <section className="border border-border/80 bg-background p-3">
                          <p className={sectionLabelClass}>Topics Covered</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {(selectedMeeting.topicsCovered ?? selectedMeeting.labels).map((item) => (
                              <StatusPill key={item} tone="muted">
                                {item}
                              </StatusPill>
                            ))}
                          </div>
                        </section>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border px-4 py-2.5 lg:px-4 overflow-x-hidden">
                    <div className="flex min-w-0 items-center gap-2">
                      <input
                        aria-label="Ask about this meeting"
                        className="h-10 min-w-0 flex-1 border border-border bg-background px-3 text-sm text-foreground outline-none"
                        onChange={(event) => setMeetingChatPrompt(event.target.value)}
                        placeholder="Ask follow-up questions for this meeting..."
                        value={meetingChatPrompt}
                      />
                      <SmallButton
                        active
                        className="shrink-0"
                        onClick={() =>
                          toast("Meeting prompt saved", {
                            description: "Meeting follow-up prompts stay inside this workspace in the next pass.",
                          })
                        }
                      >
                        <AudioLines className="mr-2 h-3.5 w-3.5" /> Save prompt
                      </SmallButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-6">
                  <button
                    className="inline-flex items-center gap-2 text-sm text-foreground/65 transition-colors hover:text-foreground"
                    onClick={closeMeetingDetail}
                    type="button"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" /> Back to meetings
                  </button>
                  <p className="mt-4 text-sm text-foreground/72">This meeting could not be found.</p>
                </div>
              )
            ) : (
              <div className="flex h-[calc(100vh-12rem)] min-h-[30rem] flex-col overflow-hidden">
                <div className="border-b border-border px-4 py-3 lg:px-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={sectionLabelClass}>Meeting Space</p>
                    <h2 className="mt-1 text-[20px] leading-tight text-foreground">{selectedSpace.name}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <SmallButton onClick={() => toast("Share ready", { description: `Sharing is prepared for ${selectedSpace.name}.` })}>
                      <Share2 className="mr-2 h-3.5 w-3.5" /> Share
                    </SmallButton>
                    <SmallButton onClick={() => toast("Link copied", { description: "Folder link copied to clipboard." })}>
                      <Link2 className="mr-2 h-3.5 w-3.5" /> Link
                    </SmallButton>
                    <SmallButton onClick={() => toast("Integrations", { description: "Folder integrations panel is ready." })}>
                      <SearchCheck className="mr-2 h-3.5 w-3.5" /> Integrations
                    </SmallButton>
                  </div>
                </div>
                </div>

                <div
                  className={cn(
                    "min-h-0 flex-1 overflow-hidden px-4 lg:px-4",
                    folderCanvasMode === "note" && generatedFolderNote ? "" : "py-3",
                  )}
                >
                {folderCanvasMode === "note" && generatedFolderNote ? (
                  <div className="flex h-full min-h-0 min-w-0 flex-col bg-background">
                    <div className="border-b border-border px-4 py-1.5">
                      <div className="flex items-start gap-2 text-[12px] leading-5 text-foreground/50">
                        <span className="shrink-0 font-mono uppercase tracking-[0.08em] text-foreground/42">Prompt</span>
                        <span className="shrink-0 text-foreground/36">--</span>
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "text-[12px] leading-5 text-foreground/56",
                              !isGeneratedPromptExpanded &&
                                "overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]",
                            )}
                          >
                            {generatedFolderNote.prompt}
                          </p>
                        </div>
                        {generatedFolderNote.prompt.length > 120 ? (
                          <button
                            aria-label={isGeneratedPromptExpanded ? "Collapse prompt" : "Expand prompt"}
                            className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-[0.08em] text-foreground/36 transition-colors hover:text-foreground/68"
                            onClick={() => setIsGeneratedPromptExpanded((expanded) => !expanded)}
                            type="button"
                          >
                            <ChevronsDown className={cn("h-3 w-3 transition-transform", isGeneratedPromptExpanded && "rotate-180")} />
                          </button>
                        ) : null}
                        <button
                          className="ml-1 inline-flex shrink-0 items-center gap-1 text-xs uppercase tracking-[0.1em] text-foreground/58 transition-colors hover:text-foreground"
                          onClick={() => setFolderCanvasMode("workspace")}
                          type="button"
                        >
                          <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                          Back
                        </button>
                      </div>
                    </div>
                    <div className="meeting-history-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3">
                      <div className="space-y-3 px-4">
                        {generatedFolderNote.sections.map((section, index) => (
                          <section
                            key={section.heading}
                            className={cn(
                              "pt-3",
                              index > 0 && "border-t border-border/70",
                              index === 0 && "pt-0",
                            )}
                          >
                            <p className={sectionLabelClass}>{section.heading}</p>
                            <div className="mt-2 space-y-1.5">
                              {section.items.map((item) => (
                                <p key={item} className="text-sm leading-6 text-foreground/84">
                                  - {item}
                                </p>
                              ))}
                            </div>
                          </section>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-border px-4 py-1.5">
                      <div className="relative">
                        <textarea
                          aria-label="Continue generated note"
                          className="h-11 min-w-0 w-full resize-none overflow-hidden bg-transparent py-2 pr-20 text-sm leading-6 text-foreground outline-none [field-sizing:fixed]"
                          onChange={(event) => setGeneratedNoteFollowUpPrompt(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                              continueGeneratedNote();
                            }
                          }}
                          placeholder="Continue this note..."
                          rows={1}
                          value={generatedNoteFollowUpPrompt}
                        />
                        <div className="absolute right-0 top-1/2 flex -translate-y-1/2 items-center gap-1">
                          <button
                            aria-label="Record note follow-up"
                            className="inline-flex h-8 w-8 items-center justify-center text-foreground/56 transition-colors hover:text-foreground"
                            onClick={() =>
                              toast("Voice capture", {
                                description: "Voice capture can be connected into this follow-up field next.",
                              })
                            }
                            type="button"
                          >
                            <Mic className="h-4 w-4" />
                          </button>
                          <button
                            aria-label="Send note follow-up"
                            className="inline-flex h-8 w-8 items-center justify-center text-foreground/72 transition-colors hover:text-foreground"
                            onClick={continueGeneratedNote}
                            type="button"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full min-h-0 flex-col">
                <div className="border border-border/80 bg-background p-3">
                  <div className="inline-flex items-center gap-2 text-sm text-foreground/76">
                      <Folder className="h-4 w-4 text-foreground/68" />
                      <span>{selectedSpace.name}</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="relative">
                      <textarea
                        aria-label="Ask about this folder and its meeting history"
                        className="h-[64px] min-w-0 w-full resize-none overflow-y-auto bg-transparent py-1 pr-24 text-sm leading-6 text-foreground outline-none [field-sizing:fixed]"
                        onChange={(event) => setFolderPrompt(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                            askFolder();
                          }
                        }}
                        placeholder="Ask about this folder and its meeting history"
                        rows={2}
                        value={folderPrompt}
                      />
                      <div className="absolute bottom-1.5 right-0 flex items-center gap-1">
                        <button
                          aria-label="Record folder prompt"
                          className="inline-flex h-8 w-8 items-center justify-center text-foreground/56 transition-colors hover:text-foreground"
                          onClick={() =>
                            toast("Voice capture", {
                              description: "Voice capture can be connected into this prompt field next.",
                            })
                          }
                          type="button"
                        >
                          <Mic className="h-4 w-4" />
                        </button>
                        <button
                          aria-label="Send folder prompt"
                          className="inline-flex h-8 w-8 items-center justify-center text-foreground/72 transition-colors hover:text-foreground"
                          onClick={askFolder}
                          type="button"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <button
                    className={railButtonClass}
                    onClick={() => presetFolderPrompt("todos")}
                    type="button"
                  >
                    <CheckSquare className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">List recent todos</span>
                  </button>
                  <button
                    className={railButtonClass}
                    onClick={() => presetFolderPrompt("summary")}
                    type="button"
                  >
                    <AudioLines className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Summarize this folder</span>
                  </button>
                  <button className={railButtonClass} onClick={() => presetFolderPrompt("projects")} type="button">
                    <SearchCheck className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">Show in-flight projects</span>
                  </button>
                  <button
                    className={railButtonClass}
                    onClick={() => toast("Recipes", { description: "Folder recipes are ready for this space." })}
                    type="button"
                  >
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">All recipes</span>
                  </button>
                </div>

                {showSuggestedNote ? (
                  <div className="mt-2 flex items-center justify-between gap-3 border border-border/80 bg-background px-4 py-3">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">1 note might belong to this folder.</span> Promote it into {selectedSpace.name} if this should become shared context.
                    </p>
                    <div className="flex items-center gap-2">
                      <SmallButton
                        active
                        onClick={() => toast("Added note", { description: `${suggestedNote.title} moved into ${selectedSpace.name}.` })}
                      >
                        Add 1 note
                      </SmallButton>
                      <button
                        aria-label="Dismiss suggestion"
                        className="inline-flex h-8 w-8 items-center justify-center border border-border text-foreground/65 transition-colors hover:bg-[hsl(var(--foreground)/0.03)] hover:text-foreground"
                        onClick={() => setSuggestionDismissed(true)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-3 flex shrink-0 flex-wrap gap-2 border-b border-border pb-3">
                  {([
                    ["notes", "Notes"],
                    ["files", "Files"],
                    ["people", "People"],
                  ] as [FolderTab, string][]).map(([tabKey, tabLabel]) => (
                    <SmallButton key={tabKey} active={folderTab === tabKey} onClick={() => setFolderTab(tabKey)}>
                      {tabLabel}
                    </SmallButton>
                  ))}
                </div>

                <div className="min-h-0 flex-1 overflow-hidden border border-border/70">
                  <div className="meeting-history-scroll h-full overflow-y-auto overflow-x-hidden py-3">
                  {folderTab === "notes"
                    ? groupedHistory.map((group) => (
                        <div key={group.dayGroup} className="mb-4 px-3">
                          <p className={cn(sectionLabelClass, "px-1 pb-2")}>{group.dayGroup}</p>
                          <div className="space-y-1.5">
                            {group.meetings.map((meeting) => {
                              const selected = meeting.id === selectedMeeting.id;
                              return (
                                <button
                                  key={meeting.id}
                                  className={cn(
                                    "grid w-full gap-3 border px-3 py-3 text-left transition-colors md:grid-cols-[40px_minmax(0,1fr)_116px]",
                                    selected
                                      ? "border-foreground bg-[hsl(var(--foreground)/0.04)]"
                                      : "border-border bg-background hover:bg-[hsl(var(--foreground)/0.03)]",
                                  )}
                                  onClick={() => openMeetingDetail(meeting.id)}
                                  type="button"
                                >
                                  <div className="flex h-10 w-10 items-center justify-center border border-border bg-card text-foreground/72">
                                    <NotebookPen className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[15px] leading-6 text-foreground">{meeting.title}</p>
                                    <p className="mt-1 text-sm text-foreground/68">
                                      {meeting.owner}
                                      {meeting.participants.length > 1 ? `, ${meeting.participants.slice(1).join(", ")}` : ""}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {meeting.labels.map((label) => (
                                        <StatusPill key={label} tone="muted">
                                          {label}
                                        </StatusPill>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="text-left text-sm text-foreground/68 md:text-right">
                                    <p>{meeting.startClock}</p>
                                    <p className="mt-1 inline-flex items-center gap-1 md:justify-end">
                                      <Folder className="h-3.5 w-3.5" /> {meeting.customerName}
                                    </p>
                                    <p className="mt-1">{meeting.duration}</p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    : null}

                  {folderTab === "notes" && !groupedHistory.length ? (
                    <p className="px-6 py-4 text-sm text-foreground/68">No notes in this folder yet.</p>
                  ) : null}

                  {folderTab === "files" ? (
                    <div className="space-y-2 px-3">
                      {folderFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between border border-border bg-background px-4 py-3">
                          <p className="inline-flex items-center gap-2 text-sm text-foreground">
                            <Files className="h-4 w-4 text-foreground/60" /> {file.name}
                          </p>
                          <p className="text-sm text-foreground/68">{file.time}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {folderTab === "people" ? (
                    <div className="space-y-2 px-3">
                      {folderPeople.map((person) => (
                        <div key={person} className="flex items-center justify-between border border-border bg-background px-4 py-3">
                          <p className="inline-flex items-center gap-2 text-sm text-foreground">
                            <Users className="h-4 w-4 text-foreground/60" /> {person}
                          </p>
                          <p className="text-sm text-foreground/68">Member</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  </div>
                </div>
                  </div>
                )}
                </div>
              </div>
            )}
          </Surface>
        </div>
      </PageContainer>
      {isCreateFolderOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/10 px-4">
          <div className="w-full max-w-md border border-border bg-background shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
            <div className="border-b border-border px-4 py-3">
              <p className={sectionLabelClass}>Create Folder</p>
              <h3 className="mt-1 text-base text-foreground">Add customer folder</h3>
            </div>
            <div className="px-4 py-4">
              <input
                aria-label="New customer folder name"
                className="h-11 w-full border border-border bg-background px-3 text-sm text-foreground outline-none"
                onChange={(event) => setNewFolderName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    createFolder();
                  }
                }}
                placeholder="Folder name"
                value={newFolderName}
              />
            </div>
            <div className="flex justify-end gap-2 border-t border-border px-4 py-3">
              <SmallButton
                onClick={() => {
                  setIsCreateFolderOpen(false);
                  setNewFolderName("");
                }}
              >
                Cancel
              </SmallButton>
              <SmallButton active onClick={createFolder}>
                Create
              </SmallButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
