import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeftIcon,
  BellIcon,
  CalendarBlankIcon,
  CalendarPlusIcon,
  CaretDownIcon,
  CaretRightIcon,
  ChatCircleTextIcon,
  CheckIcon,
  CheckSquareIcon,
  ClockIcon,
  CopyIcon,
  DotsThreeIcon,
  EnvelopeSimpleIcon,
  FileImageIcon,
  FileTextIcon,
  FilesIcon,
  FolderIcon,
  FolderOpenIcon,
  FolderPlusIcon,
  LinkIcon,
  LockIcon,
  MagnifyingGlassIcon,
  MicrophoneIcon,
  NotePencilIcon,
  PaperPlaneTiltIcon,
  PushPinIcon,
  SidebarSimpleIcon,
  SlackLogoIcon,
  TrashIcon,
  UsersIcon,
  WaveformIcon,
} from "@phosphor-icons/react";

import { Surface } from "@/components/ubik-primitives";
import { PageContainer } from "@/components/page-container";
import { RichOperatorEditor } from "@/components/rich-operator-editor";
import { useWorkbenchState } from "@/hooks/use-shell-state";
import { contactCards, meetings } from "@/lib/ubik-data";
import type { MeetingRecord } from "@/lib/ubik-types";
import { cn, shouldIgnoreSurfaceHotkeys } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
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
  InputGroupTextarea,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { GoogleCalendar } from "@/components/ui/svgs/googleCalendar";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { findContactCard, getInitials } from "@/lib/contact-helpers";

type BuiltInMeetingSpaceId =
  | "all"
  | "quick-notes"
  | "my-notes"
  | "this-week"
  | "this-month"
  | "history"
  | "thai-union"
  | "maersk"
  | "redwood-foods"
  | "harbor-retail";
type MeetingSpaceId = BuiltInMeetingSpaceId | `custom-${string}`;
type MeetingSidebarMode = "folders" | "meetings";
type MeetingSpaceSegment = "folders" | "notes" | "org" | "customers";
type FolderCanvasMode = "workspace" | "note";
type FolderActionKind = "todos" | "summary" | "projects" | "custom";
type LandingChatScope = "all" | MeetingSpaceId;
type LandingChatRange = "recent-25" | "all";
type MeetingDetailTab = "summary" | "transcript" | "files";
type FolderIconKey = "folder" | "people" | "notes" | "signal";
type TimelineSectionKey = "upcoming" | "today" | "previous";

type CustomerSpace = {
  id: MeetingSpaceId;
  name: string;
  description: string;
  initials: string;
  icon: FolderIconKey;
  prompt?: string;
  memberIds?: string[];
  segment: MeetingSpaceSegment;
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
  contextScopeId: LandingChatScope;
  contextLabel: string;
};

type MeetingWorkspaceRecord = MeetingRecord & {
  customerId: MeetingSpaceId;
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
  files?: { name: string; kind: "doc" | "image" | "sheet" | "link"; addedBy: string; addedAt: string }[];
};

type ChecklistItem = {
  text: string;
  checked: boolean;
  routed?: boolean;
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
    files: [
      { name: "thai-union-exception-packet.pdf", kind: "doc", addedBy: "Compliance Bot", addedAt: "09:42 AM" },
      { name: "document-gap-checklist.png", kind: "image", addedBy: "Raj Mehta", addedAt: "09:55 AM" },
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
    files: [
      { name: "maersk-delay-card.pdf", kind: "doc", addedBy: "Ops desk", addedAt: "01:10 PM" },
      { name: "eta-revision-sheet.xlsx", kind: "sheet", addedBy: "Sarah Kim", addedAt: "01:18 PM" },
    ],
    kind: "meeting",
    nextJoinIn: "in 3h",
  }),
  buildWorkspaceMeeting(getMeeting("meeting-3"), {
    customerId: "my-notes",
    customerName: "Plant Operations",
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
    files: [
      { name: "morning-brief-recap.md", kind: "doc", addedBy: "Ubik", addedAt: "08:28 AM" },
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
    summary: "A short internal working note before the commercial renewal call to capture objections, prep language, and stakeholder sequence.",
    agenda: ["Renewal risks", "Who to involve", "Customer tone"],
    decisions: ["Keep legal copied on commercial language review."],
    actionItems: ["Move the best objections into the renewal prep packet."],
    customerId: "quick-notes",
    customerName: "Quick notes",
    dayGroup: "Today",
    duration: "7 min",
    startClock: "11:58 AM",
    participantsCount: 1,
    labels: ["Quick note", "Commercial"],
    prepSummary: "This is an internal plant-ops capture, so it should stay easy to reuse and easy to move into a customer folder later.",
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
      { speaker: "Me", text: "Keep this in the plant-ops lane until the commercial angle is ready to share." },
    ],
    files: [
      { name: "renewal-objections.md", kind: "doc", addedBy: "You", addedAt: "11:58 AM" },
      { name: "pricing-objection-screenshot.png", kind: "image", addedBy: "You", addedAt: "12:01 PM" },
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
    files: [
      { name: "harbor-retail-reset-note.pdf", kind: "doc", addedBy: "Ops desk", addedAt: "04:48 PM" },
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
    files: [
      { name: "meeting-space-wireframe.png", kind: "image", addedBy: "Sai Kiran", addedAt: "Thu 2:12 PM" },
      { name: "meeting-backend-notes.md", kind: "doc", addedBy: "Ganesh", addedAt: "Thu 2:25 PM" },
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
    icon: "folder",
    segment: "folders",
  },
  {
    id: "quick-notes",
    name: "Quick Note",
    description: "Prompt-based labels and scratchpads",
    initials: "QN",
    icon: "notes",
    segment: "folders",
  },
  {
    id: "my-notes",
    name: "Private",
    description: "Internal notes and restricted continuity",
    initials: "PV",
    icon: "signal",
    segment: "folders",
    shared: true,
  },
  {
    id: "this-week",
    name: "This Week",
    description: "Recent meetings and notes still in motion",
    initials: "TW",
    icon: "folder",
    segment: "folders",
  },
  {
    id: "this-month",
    name: "This Month",
    description: "Broader month-level continuity and summaries",
    initials: "TM",
    icon: "folder",
    segment: "folders",
  },
  {
    id: "history",
    name: "History",
    description: "Completed meetings and older decision trails",
    initials: "HS",
    icon: "folder",
    segment: "folders",
  },
];

const initialMovableCustomerSpaces: CustomerSpace[] = [
  {
    id: "thai-union",
    name: "Thai Union",
    description: "Supplier review",
    initials: "TU",
    icon: "people",
    segment: "customers",
    shared: true,
  },
  {
    id: "maersk",
    name: "Maersk",
    description: "Logistics sync",
    initials: "MK",
    icon: "signal",
    segment: "customers",
    shared: true,
  },
  {
    id: "redwood-foods",
    name: "Redwood Foods",
    description: "Commercial planning",
    initials: "RF",
    icon: "folder",
    segment: "customers",
    shared: true,
  },
  {
    id: "harbor-retail",
    name: "Harbor Retail",
    description: "Delivery reset",
    initials: "HR",
    icon: "people",
    segment: "customers",
    shared: true,
  },
];

const dayGroupOrder: MeetingWorkspaceRecord["dayGroup"][] = ["Today", "Yesterday", "Last week"];

function matchesSpace(meeting: MeetingWorkspaceRecord, spaceId: MeetingSpaceId) {
  if (spaceId === "all") return true;
  if (spaceId === "quick-notes") return meeting.kind === "quick_note";
  if (spaceId === "my-notes") return meeting.customerId === "my-notes";
  if (spaceId === "this-week") return meeting.dayGroup === "Today" || meeting.dayGroup === "Yesterday";
  if (spaceId === "this-month") return ["Today", "Yesterday", "Last week"].includes(meeting.dayGroup);
  if (spaceId === "history") return meeting.dayGroup === "Last week" || meeting.stage === "Completed";
  return meeting.customerId === spaceId;
}

function getSpaceSegment(spaces: CustomerSpace[], spaceId: MeetingSpaceId): MeetingSpaceSegment {
  return spaces.find((space) => space.id === spaceId)?.segment ?? "folders";
}

function getSidebarModeForSegment(segment: MeetingSpaceSegment): MeetingSidebarMode {
  return segment === "folders" ? "folders" : "meetings";
}

function getSegmentForNewSpace(sidebarMode: MeetingSidebarMode, icon: FolderIconKey): MeetingSpaceSegment {
  if (sidebarMode === "folders") return "folders";
  if (icon === "notes") return "notes";
  if (icon === "signal") return "org";
  return "customers";
}

function buildFolderId(name: string) {
  return `custom-${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 32) || "folder"}-${Date.now()}` as const;
}

function buildMeetingSummaryDocument({
  prepSummary,
  decisions,
  checklist,
  risks,
  insights,
}: {
  prepSummary: string;
  decisions: string[];
  checklist: ChecklistItem[];
  risks: string[];
  insights: string[];
}) {
  return [
    "# Overview",
    prepSummary.trim(),
    "",
    "## Decisions",
    ...(decisions.length ? decisions.map((item) => `- ${item}`) : ["- Add a decision"]),
    "",
    "## Action items",
    ...(checklist.length ? checklist.map((item) => `- [${item.checked ? "x" : " "}] ${item.text}`) : ["- [ ] Add an action item"]),
    "",
    "## Risks & blockers",
    ...(risks.length ? risks.map((item) => `- ${item}`) : ["- Add a blocker"]),
    "",
    "## Key insights",
    ...(insights.length ? insights.map((item) => `- ${item}`) : ["- Add an insight"]),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  return (parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "CF").slice(0, 2);
}

function parseStartClockMinutes(clock: string) {
  const [time, meridiem] = clock.trim().split(" ");
  const [hourValue, minuteValue] = time.split(":").map(Number);
  if (!Number.isFinite(hourValue) || !Number.isFinite(minuteValue)) return 0;

  let hour = hourValue % 12;
  if (meridiem?.toUpperCase() === "PM") {
    hour += 12;
  }

  return hour * 60 + minuteValue;
}

function meetingChronologyScore(meeting: MeetingWorkspaceRecord) {
  const dayRank = {
    Today: 0,
    Yesterday: 1,
    "Last week": 2,
  }[meeting.dayGroup];

  return dayRank * 1440 + parseStartClockMinutes(meeting.startClock);
}

function sortMeetingsByChronology(meetingList: MeetingWorkspaceRecord[], direction: "asc" | "desc" = "asc") {
  return [...meetingList].sort((left, right) => {
    const leftScore = meetingChronologyScore(left);
    const rightScore = meetingChronologyScore(right);
    return direction === "asc" ? leftScore - rightScore : rightScore - leftScore;
  });
}

function getMeetingAccent(meeting: MeetingWorkspaceRecord) {
  switch (meeting.customerId) {
    case "quick-notes":
      return "bg-orange-500 text-white";
    case "my-notes":
      return "bg-slate-700 text-white";
    case "thai-union":
      return "bg-amber-500 text-white";
    case "maersk":
      return "bg-sky-500 text-white";
    case "redwood-foods":
      return "bg-emerald-500 text-white";
    case "harbor-retail":
      return "bg-violet-500 text-white";
    default:
      return "bg-slate-500 text-white";
  }
}

function renderFolderIcon(icon: FolderIconKey) {
  switch (icon) {
    case "people":
      return <UsersIcon className="h-4 w-4" />;
    case "notes":
      return <NotePencilIcon className="h-4 w-4" />;
    case "signal":
      return <WaveformIcon className="h-4 w-4" />;
    default:
      return <FolderOpenIcon className="h-4 w-4" />;
  }
}

function fileKindIcon(kind: NonNullable<MeetingWorkspaceRecord["files"]>[number]["kind"]) {
  switch (kind) {
    case "image":
      return <FileImageIcon className="h-4 w-4" />;
    case "sheet":
      return <FilesIcon className="h-4 w-4" />;
    case "link":
      return <LinkIcon className="h-4 w-4" />;
    default:
      return <FileTextIcon className="h-4 w-4" />;
  }
}

export default function Meetings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { meetingId } = useParams<{ meetingId: string }>();
  const [selectedSpaceId, setSelectedSpaceId] = useWorkbenchState<MeetingSpaceId>("meetings-space-id", "all");
  const [selectedMeetingId, setSelectedMeetingId] = useWorkbenchState<string>("meeting-id", workspaceMeetings[0].id);
  const [searchQuery, setSearchQuery] = useWorkbenchState<string>("meetings-search", "");
  const [folderPrompt, setFolderPrompt] = useWorkbenchState<string>("meetings-folder-prompt", "");
  const [secondaryRailCollapsed, setSecondaryRailCollapsed] = useWorkbenchState<boolean>("meetings-secondary-rail-collapsed", false);
  const [sidebarMode, setSidebarMode] = useWorkbenchState<MeetingSidebarMode>("meetings-sidebar-mode", "folders");
  const [customMeetings, setCustomMeetings] = useWorkbenchState<MeetingWorkspaceRecord[]>("meetings-custom-records", []);
  const [meetingFolderOverrides, setMeetingFolderOverrides] = useWorkbenchState<Record<string, MeetingSpaceId>>(
    "meetings-folder-overrides",
    {},
  );
  const [deletedMeetingIds, setDeletedMeetingIds] = useWorkbenchState<string[]>("meetings-deleted-records", []);
  const [landingChatRange, setLandingChatRange] = useWorkbenchState<LandingChatRange>("meetings-landing-chat-range", "recent-25");
  const [generatedNoteFollowUpPrompt, setGeneratedNoteFollowUpPrompt] = useWorkbenchState<string>(
    "meetings-generated-note-follow-up",
    "",
  );
  const [folderCanvasMode, setFolderCanvasMode] = useWorkbenchState<FolderCanvasMode>("meetings-folder-canvas-mode", "workspace");
  const [folderActionKind, setFolderActionKind] = useWorkbenchState<FolderActionKind>("meetings-folder-action-kind", "custom");
  const [generatedFolderNote, setGeneratedFolderNote] = useWorkbenchState<GeneratedFolderNote | null>("meetings-generated-folder-note", null);
  const [isGeneratedPromptExpanded, setIsGeneratedPromptExpanded] = useState(false);
  const [isCreateFolderExpanded, setIsCreateFolderExpanded] = useWorkbenchState<boolean>("meetings-create-folder-expanded", false);
  const [newFolderName, setNewFolderName] = useWorkbenchState<string>("meetings-new-folder-name", "");
  const [newFolderIcon, setNewFolderIcon] = useWorkbenchState<FolderIconKey>("meetings-new-folder-icon", "folder");
  const [newFolderPrompt, setNewFolderPrompt] = useWorkbenchState<string>("meetings-new-folder-filter-prompt", "");
  const [newFolderMemberIds, setNewFolderMemberIds] = useWorkbenchState<string[]>("meetings-new-folder-member-ids", []);
  const [movableCustomerSpaces, setMovableCustomerSpaces] = useWorkbenchState<CustomerSpace[]>(
    "meetings-movable-customer-spaces",
    initialMovableCustomerSpaces,
  );
  const [detailTabByMeeting, setDetailTabByMeeting] = useWorkbenchState<Record<string, MeetingDetailTab>>("meetings-detail-tab", {});
  const [prepSummaryByMeeting] = useWorkbenchState<Record<string, string>>("meetings-detail-prep-summary", {});
  const [decisionsByMeeting] = useWorkbenchState<Record<string, string[]>>("meetings-detail-decisions", {});
  const [checklistByMeeting, setChecklistByMeeting] = useWorkbenchState<Record<string, ChecklistItem[]>>("meetings-checklist", {});
  const [risksByMeeting] = useWorkbenchState<Record<string, string[]>>("meetings-detail-risks", {});
  const [insightsByMeeting] = useWorkbenchState<Record<string, string[]>>("meetings-detail-insights", {});
  const [summaryDocumentByMeeting, setSummaryDocumentByMeeting] = useWorkbenchState<Record<string, string>>("meetings-detail-summary-document", {});
  const [meetingQuestionByMeeting, setMeetingQuestionByMeeting] = useWorkbenchState<Record<string, string>>("meetings-detail-question", {});
  const [shareRecipientIdsByMeeting, setShareRecipientIdsByMeeting] = useWorkbenchState<Record<string, string[]>>("meetings-share-recipients", {});
  const [shareQueryByMeeting, setShareQueryByMeeting] = useWorkbenchState<Record<string, string>>("meetings-share-query", {});
  const [approvedMeetingIds, setApprovedMeetingIds] = useWorkbenchState<string[]>("meetings-approved-records", []);
  const [remindedMeetingIds, setRemindedMeetingIds] = useWorkbenchState<string[]>("meetings-reminded-records", []);
  const [timelineSectionOpen, setTimelineSectionOpen] = useWorkbenchState<Record<TimelineSectionKey, boolean>>("meetings-timeline-sections", {
    upcoming: true,
    today: true,
    previous: true,
  });
  const [draggingSpaceId, setDraggingSpaceId] = useState<MeetingSpaceId | null>(null);
  const [discussCommandOpen, setDiscussCommandOpen] = useState(false);
  const [newMeetingDialogOpen, setNewMeetingDialogOpen] = useState(false);
  const [draftMeetingTitle, setDraftMeetingTitle] = useWorkbenchState<string>("meetings-draft-title", "");
  const [draftMeetingSpaceId, setDraftMeetingSpaceId] = useWorkbenchState<MeetingSpaceId>("meetings-draft-space-id", "redwood-foods");
  const [draftMeetingStartClock, setDraftMeetingStartClock] = useWorkbenchState<string>("meetings-draft-start-clock", "4:30 PM");
  const [draftMeetingDuration, setDraftMeetingDuration] = useWorkbenchState<string>("meetings-draft-duration", "30 min");
  const [draftMeetingAttendees, setDraftMeetingAttendees] = useWorkbenchState<string>("meetings-draft-attendees", "Priya, Ganesh");

  const customerSpaces = useMemo(() => [...fixedCustomerSpaces, ...movableCustomerSpaces], [movableCustomerSpaces]);
  const allWorkspaceMeetings = useMemo(() => [...workspaceMeetings, ...customMeetings], [customMeetings]);
  const effectiveWorkspaceMeetings = useMemo(
    () =>
      allWorkspaceMeetings
        .filter((meeting) => !deletedMeetingIds.includes(meeting.id))
        .map((meeting) => {
          const overrideSpaceId = meetingFolderOverrides[meeting.id];
          if (!overrideSpaceId) return meeting;

          const overrideSpace = customerSpaces.find((space) => space.id === overrideSpaceId);
          if (!overrideSpace) return meeting;

          return {
            ...meeting,
            customerId: overrideSpace.id,
            customerName: overrideSpace.name,
          };
        }),
    [allWorkspaceMeetings, customerSpaces, deletedMeetingIds, meetingFolderOverrides],
  );
  const selectedScopeMeetings = useMemo(
    () => effectiveWorkspaceMeetings.filter((meeting) => matchesSpace(meeting, selectedSpaceId)),
    [effectiveWorkspaceMeetings, selectedSpaceId],
  );
  const visibleMeetings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return selectedScopeMeetings.filter((meeting) => {
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
  }, [searchQuery, selectedScopeMeetings]);
  const routeMeeting = useMemo(
    () => (meetingId ? effectiveWorkspaceMeetings.find((meeting) => meeting.id === meetingId) ?? null : null),
    [effectiveWorkspaceMeetings, meetingId],
  );
  const isMeetingDetailView = Boolean(meetingId);

  useEffect(() => {
    if (!selectedScopeMeetings.length) return;
    if (!selectedScopeMeetings.some((meeting) => meeting.id === selectedMeetingId)) {
      setSelectedMeetingId(selectedScopeMeetings[0].id);
    }
  }, [selectedMeetingId, selectedScopeMeetings, setSelectedMeetingId]);
  useEffect(() => {
    if (!routeMeeting) return;
    if (selectedSpaceId !== "all" && selectedSpaceId !== routeMeeting.customerId) {
      setSelectedSpaceId(routeMeeting.customerId);
    }
    const routeSegment = getSpaceSegment(customerSpaces, routeMeeting.customerId);
    const nextSidebarMode = getSidebarModeForSegment(routeSegment);
    if (sidebarMode !== nextSidebarMode) {
      setSidebarMode(nextSidebarMode);
    }
    if (selectedMeetingId !== routeMeeting.id) {
      setSelectedMeetingId(routeMeeting.id);
    }
  }, [customerSpaces, routeMeeting, selectedMeetingId, selectedSpaceId, setSelectedMeetingId, setSelectedSpaceId, setSidebarMode, sidebarMode]);

  const selectedMeeting =
    routeMeeting ??
    selectedScopeMeetings.find((meeting) => meeting.id === selectedMeetingId) ??
    visibleMeetings[0] ??
    selectedScopeMeetings[0] ??
    effectiveWorkspaceMeetings[0] ??
    workspaceMeetings[0];
  const selectedSpace = customerSpaces.find((space) => space.id === selectedSpaceId) ?? customerSpaces[0];
  const todayMeetings = useMemo(
    () => sortMeetingsByChronology(visibleMeetings.filter((meeting) => meeting.dayGroup === "Today"), "asc"),
    [visibleMeetings],
  );
  const upcomingMeetings = useMemo(
    () => sortMeetingsByChronology(visibleMeetings.filter((meeting) => meeting.stage === "Upcoming"), "asc"),
    [visibleMeetings],
  );
  const previousMeetings = useMemo(
    () => sortMeetingsByChronology(
      visibleMeetings.filter((meeting) => meeting.stage !== "Upcoming" && meeting.dayGroup !== "Today"),
      "desc",
    ),
    [visibleMeetings],
  );
  const landingTimelineSections = useMemo(
    () => [
      { key: "upcoming" as const, label: "Upcoming", meetings: upcomingMeetings },
      {
        key: "today" as const,
        label: "Today",
        meetings: sortMeetingsByChronology(
          visibleMeetings.filter((meeting) => meeting.dayGroup === "Today" && meeting.stage !== "Upcoming"),
          "desc",
        ),
      },
      { key: "previous" as const, label: "Previous", meetings: previousMeetings },
    ].filter((section) => section.meetings.length > 0),
    [previousMeetings, upcomingMeetings, visibleMeetings],
  );

  const spacesWithCounts = customerSpaces.map((space) => ({
    ...space,
    count: effectiveWorkspaceMeetings.filter((meeting) => matchesSpace(meeting, space.id)).length,
  }));
  const sectionLabelClass = "section-label";
  const commandRailClass =
    "flex w-full items-center gap-1 overflow-x-auto rounded-xl border border-border/70 bg-background px-1.5 py-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
  const commandRailGroupClass = "flex shrink-0 items-center gap-1";
  const commandRailDividerClass = "h-4 w-px shrink-0 bg-border/80";
  const commandRailButtonClass =
    "inline-flex h-7 shrink-0 items-center gap-1 border border-transparent px-1.5 text-[11px] font-medium text-foreground/80 transition-colors hover:bg-background hover:text-foreground motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-45";
  const commandRailIconButtonClass =
    "inline-flex size-7 shrink-0 items-center justify-center border border-transparent text-foreground/75 transition-colors hover:bg-background hover:text-foreground motion-reduce:transition-none disabled:pointer-events-none disabled:opacity-45";
  const commandRailActiveButtonClass =
    "border-border/70 bg-background text-foreground shadow-sm hover:bg-background hover:text-foreground";
  const commandRailPrimaryButtonClass =
    "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground";
  const commandRailShortcutClass =
    "inline-flex min-w-[1.3rem] items-center justify-center border border-border/70 bg-background px-1 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground";
  const selectedDetailTab = detailTabByMeeting[selectedMeeting.id] ?? "summary";
  const selectedMeetingFiles = selectedMeeting.files ?? [];
  const getFolderActionLabel = (kind: FolderActionKind) => {
    if (kind === "todos") return "follow-through note";
    if (kind === "projects") return "project snapshot";
    if (kind === "summary") return "folder summary";
    return "custom note";
  };
  const renderPersonAvatar = (name: string, size: "sm" | "default" = "default") => {
    const contact = findContactCard(name);
    return (
      <Avatar key={name} size={size}>
        <AvatarImage alt={name} src={contact?.avatarSrc} />
        <AvatarFallback>{contact?.avatarFallback ?? getInitials(name)}</AvatarFallback>
      </Avatar>
    );
  };
  const resolvePromptScope = (scopeId: LandingChatScope, range: LandingChatRange = landingChatRange) => {
    const scopedMeetings =
      scopeId === "all"
        ? sortMeetingsByChronology(effectiveWorkspaceMeetings, "desc")
        : sortMeetingsByChronology(effectiveWorkspaceMeetings.filter((meeting) => matchesSpace(meeting, scopeId)), "desc");
    const scopeSpace = customerSpaces.find((space) => space.id === scopeId);
    return {
      id: scopeId,
      label: scopeId === "all" ? "All meetings" : scopeSpace ? `${scopeSpace.name} journey` : "Folder journey",
      description: scopeId === "all" ? "Every meeting, note, and quick capture." : scopeSpace?.description ?? "Folder-linked meeting history.",
      meetings: range === "recent-25" ? scopedMeetings.slice(0, 25) : scopedMeetings,
    };
  };
  const landingPromptScope = resolvePromptScope(selectedSpaceId, landingChatRange);

  useEffect(() => {
    if (checklistByMeeting[selectedMeeting.id]) return;
    setChecklistByMeeting({
      ...checklistByMeeting,
      [selectedMeeting.id]: selectedMeeting.actionItems.map((item) => ({ text: item, checked: false })),
    });
  }, [checklistByMeeting, selectedMeeting, setChecklistByMeeting]);

  const detailChecklist = checklistByMeeting[selectedMeeting.id] ?? selectedMeeting.actionItems.map((item) => ({ text: item, checked: false }));
  const detailPrepSummary = prepSummaryByMeeting[selectedMeeting.id] ?? selectedMeeting.prepSummary;
  const detailDecisions = decisionsByMeeting[selectedMeeting.id] ?? selectedMeeting.decisions;
  const detailRisks = risksByMeeting[selectedMeeting.id] ?? (selectedMeeting.risksAndBlockers ?? selectedMeeting.prepChecklist);
  const detailInsights = insightsByMeeting[selectedMeeting.id] ?? (selectedMeeting.keyInsights ?? selectedMeeting.highlights);
  const detailSummaryDocument =
    summaryDocumentByMeeting[selectedMeeting.id] ??
    buildMeetingSummaryDocument({
      prepSummary: detailPrepSummary,
      decisions: detailDecisions,
      checklist: detailChecklist,
      risks: detailRisks,
      insights: detailInsights,
    });
  const meetingQuestion = meetingQuestionByMeeting[selectedMeeting.id] ?? "";
  const shareRecipientIds = shareRecipientIdsByMeeting[selectedMeeting.id] ?? [];
  const shareQuery = shareQueryByMeeting[selectedMeeting.id] ?? "";
  const shareRecipients = shareRecipientIds
    .map((contactId) => contactCards.find((contact) => contact.id === contactId))
    .filter((contact): contact is (typeof contactCards)[number] => Boolean(contact));
  const availableShareContacts = contactCards.filter((contact) => {
    if (shareRecipientIds.includes(contact.id)) return false;
    if (!shareQuery.trim()) return true;
    return `${contact.name} ${contact.role} ${contact.company}`.toLowerCase().includes(shareQuery.toLowerCase());
  });

  const updateChecklist = (index: number, next: Partial<ChecklistItem>) => {
    setChecklistByMeeting({
      ...checklistByMeeting,
      [selectedMeeting.id]: detailChecklist.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item)),
    });
  };

  const routeChecklistTask = (index: number) => {
    const routing = {
      project: selectedMeeting.customerName,
      status: "Open",
      priority: "High",
      due: "Today",
    };
    updateChecklist(index, { routed: true });
    toast("Added to tasks", {
      description: `${routing.project} · ${routing.status} · ${routing.priority} · ${routing.due}`,
    });
  };

  const addShareRecipient = (contactId: string) => {
    setShareRecipientIdsByMeeting({
      ...shareRecipientIdsByMeeting,
      [selectedMeeting.id]: [...shareRecipientIds, contactId],
    });
    setShareQueryByMeeting({
      ...shareQueryByMeeting,
      [selectedMeeting.id]: "",
    });
  };

  const removeShareRecipient = (contactId: string) => {
    setShareRecipientIdsByMeeting({
      ...shareRecipientIdsByMeeting,
      [selectedMeeting.id]: shareRecipientIds.filter((id) => id !== contactId),
    });
  };

  const triggerShare = (channel: "email" | "link" | "slack") => {
    const label = channel === "email" ? "Email" : channel === "link" ? "Copy link" : "Slack";
    const extra = shareRecipients.length ? ` with ${shareRecipients.map((contact) => contact.name).join(", ")}` : "";
    toast("Share prepared", {
      description: `${label} is ready for ${selectedMeeting.title}${extra}.`,
    });
  };
  const setMeetingQuestion = (value: string) => {
    setMeetingQuestionByMeeting({
      ...meetingQuestionByMeeting,
      [selectedMeeting.id]: value,
    });
  };

  const buildFolderPrompt = (kind: FolderActionKind, scopeId: LandingChatScope = selectedSpaceId) => {
    const scope = resolvePromptScope(scopeId);
    const scopeMeetings = scope.meetings;
    const baseMeetingTitles = scopeMeetings.slice(0, 5).map((meeting) => meeting.title).join("; ");
    if (kind === "todos") {
      return [
        `List the recent todos for ${scope.label.toLowerCase()}.`,
        `Focus on what still needs follow-through across ${scopeMeetings.length} notes.`,
        `Recent notes: ${baseMeetingTitles}`,
      ].join(" ");
    }

    if (kind === "summary") {
      return [
        `Summarize ${scope.label.toLowerCase()}.`,
        "Group the output into active themes, open loops, and what should happen next.",
        `Recent notes: ${baseMeetingTitles}`,
      ].join(" ");
    }

    if (kind === "projects") {
      return [
        `Show in-flight projects across ${scope.label.toLowerCase()}.`,
        "Organize by current motion, owner, and next checkpoint.",
        `Recent notes: ${baseMeetingTitles}`,
      ].join(" ");
    }

    return folderPrompt.trim() || `Summarize key notes and open tasks across ${scope.label.toLowerCase()}.`;
  };

  const presetFolderPrompt = (kind: FolderActionKind, scopeId: LandingChatScope = selectedSpaceId) => {
    setFolderActionKind(kind);
    setFolderPrompt(buildFolderPrompt(kind, scopeId));
  };

  const generateFolderNote = (kind = folderActionKind, promptOverride?: string, scopeId: LandingChatScope = selectedSpaceId) => {
    const scope = resolvePromptScope(scopeId);
    const scopedMeetings = scope.meetings;
    const prompt = promptOverride?.trim() || folderPrompt.trim() || buildFolderPrompt(kind, scopeId);
    const recentMeetings = scopedMeetings.slice(0, 5);
    const allActionItems = Array.from(new Set(scopedMeetings.flatMap((meeting) => meeting.actionItems))).slice(0, 8);
    const allDecisions = Array.from(new Set(scopedMeetings.flatMap((meeting) => meeting.decisions))).slice(0, 6);
    const allHighlights = Array.from(new Set(scopedMeetings.flatMap((meeting) => meeting.highlights))).slice(0, 6);

    const title =
      kind === "todos"
        ? `${scope.label} follow-through`
        : kind === "projects"
          ? `${scope.label} active work`
          : `${scope.label} summary`;

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
      contextScopeId: scope.id,
      contextLabel: scope.label,
    });
    setIsGeneratedPromptExpanded(false);
    setFolderCanvasMode("note");
  };

  const askFolder = (scopeId: LandingChatScope = selectedSpaceId) => {
    setFolderActionKind("custom");
    generateFolderNote("custom", undefined, scopeId);
  };
  const continueGeneratedNote = () => {
    const prompt = generatedNoteFollowUpPrompt.trim();
    if (!prompt || !generatedFolderNote) return;
    setFolderPrompt(prompt);
    setFolderActionKind("custom");
    generateFolderNote("custom", prompt, generatedFolderNote.contextScopeId);
    setGeneratedNoteFollowUpPrompt("");
  };
  const createFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    const selectedMembers = contactCards.filter((contact) => newFolderMemberIds.includes(contact.id));
    const prompt = newFolderPrompt.trim();
    const description =
      prompt ||
      (selectedMembers.length
        ? `${selectedMembers
            .slice(0, 2)
            .map((contact) => contact.name)
            .join(", ")} continuity`
        : sidebarMode === "meetings" && newFolderIcon === "notes"
          ? "Prompt-based note label"
          : sidebarMode === "meetings" && newFolderIcon === "signal"
            ? "Org continuity space"
            : sidebarMode === "meetings"
              ? "Customer continuity space"
              : "Custom folder");

    const nextSpace: CustomerSpace = {
      id: buildFolderId(name),
      name,
      description,
      initials: buildInitials(name),
      icon: newFolderIcon,
      prompt: prompt || undefined,
      memberIds: newFolderMemberIds,
      segment: getSegmentForNewSpace(sidebarMode, newFolderIcon),
      shared: newFolderIcon === "people" || newFolderMemberIds.length > 0,
      isCustom: true,
    };

    setMovableCustomerSpaces([...movableCustomerSpaces, nextSpace]);
    setSelectedSpaceId(nextSpace.id);
    setSidebarMode(getSidebarModeForSegment(nextSpace.segment));
    setIsCreateFolderExpanded(false);
    toast("Folder created", {
      description: `${name} is ready in ${meetingScopeMeta.railLabel.toLowerCase()}.`,
    });
    setNewFolderName("");
    setNewFolderIcon("folder");
    setNewFolderPrompt("");
    setNewFolderMemberIds([]);
  };
  const applyCustomerSeed = (contactId: string) => {
    const contact = contactCards.find((entry) => entry.id === contactId);
    if (!contact) return;
    setNewFolderName(contact.company);
    setNewFolderIcon("people");
    setNewFolderPrompt(`Keep ${contact.company} customer continuity, meeting prep, and follow-through together.`);
    setNewFolderMemberIds(newFolderMemberIds.includes(contact.id) ? newFolderMemberIds : [...newFolderMemberIds, contact.id]);
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
  const selectSpace = (spaceId: MeetingSpaceId) => {
    setSelectedSpaceId(spaceId);
    setSidebarMode(getSidebarModeForSegment(getSpaceSegment(customerSpaces, spaceId)));
    setFolderCanvasMode("workspace");
    if (isMeetingDetailView) {
      navigate({
        pathname: "/meetings",
        search: location.search,
      });
    }
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
  const toggleFolderMember = (contactId: string) => {
    setNewFolderMemberIds(
      newFolderMemberIds.includes(contactId)
        ? newFolderMemberIds.filter((id) => id !== contactId)
        : [...newFolderMemberIds, contactId],
    );
  };
  const moveMeetingToSpace = (meetingId: string, spaceId: MeetingSpaceId) => {
    const destination = customerSpaces.find((space) => space.id === spaceId);
    if (!destination) return;

    setMeetingFolderOverrides({
      ...meetingFolderOverrides,
      [meetingId]: spaceId,
    });
    toast("Moved to folder", {
      description: `${effectiveWorkspaceMeetings.find((meeting) => meeting.id === meetingId)?.title ?? "Meeting"} now lives in ${destination.name}.`,
    });
  };
  const deleteMeetingRecord = (meetingId: string) => {
    const meeting = effectiveWorkspaceMeetings.find((item) => item.id === meetingId);
    if (!meeting) return;

    setDeletedMeetingIds([...new Set([...deletedMeetingIds, meetingId])]);

    if (meetingFolderOverrides[meetingId]) {
      const nextOverrides = { ...meetingFolderOverrides };
      delete nextOverrides[meetingId];
      setMeetingFolderOverrides(nextOverrides);
    }

    const fallbackMeeting = effectiveWorkspaceMeetings.find((item) => item.id !== meetingId && matchesSpace(item, selectedSpaceId));
    if (selectedMeetingId === meetingId && fallbackMeeting) {
      setSelectedMeetingId(fallbackMeeting.id);
    }
    if (routeMeeting?.id === meetingId) {
      closeMeetingDetail();
    }
    toast("Moved to trash", {
      description: `${meeting.title} was removed from the meeting list.`,
    });
  };
  const toggleApproval = (meetingId: string) => {
    const nextApproved = approvedMeetingIds.includes(meetingId)
      ? approvedMeetingIds.filter((id) => id !== meetingId)
      : [...approvedMeetingIds, meetingId];
    setApprovedMeetingIds(nextApproved);
    toast(nextApproved.includes(meetingId) ? "Meeting approved" : "Approval cleared", {
      description: effectiveWorkspaceMeetings.find((meeting) => meeting.id === meetingId)?.title ?? "Meeting",
    });
  };
  const toggleReminder = (meetingId: string) => {
    const nextReminded = remindedMeetingIds.includes(meetingId)
      ? remindedMeetingIds.filter((id) => id !== meetingId)
      : [...remindedMeetingIds, meetingId];
    setRemindedMeetingIds(nextReminded);
    toast(nextReminded.includes(meetingId) ? "Reminder set" : "Reminder cleared", {
      description: nextReminded.includes(meetingId)
        ? `Tomorrow follow-up queued for ${effectiveWorkspaceMeetings.find((meeting) => meeting.id === meetingId)?.title ?? "this meeting"}.`
        : "The reminder was removed.",
    });
  };
  const createMeetingRecord = () => {
    const title = draftMeetingTitle.trim();
    const destination = customerSpaces.find((space) => space.id === draftMeetingSpaceId);
    if (!title || !destination || draftMeetingSpaceId === "all") return;

    const attendees = draftMeetingAttendees
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    const nextMeeting: MeetingWorkspaceRecord = {
      id: `meeting-custom-${Date.now()}`,
      title,
      time: `Today · ${draftMeetingStartClock} PST`,
      stage: "Upcoming",
      owner: "Hemanth",
      participants: attendees.length ? attendees : ["Hemanth"],
      summary: `A newly drafted meeting for ${destination.name}.`,
      agenda: ["Context", "Next steps", "Owner alignment"],
      decisions: ["Capture the decision after the meeting starts."],
      actionItems: ["Confirm the next checkpoint and owner."],
      customerId: destination.id,
      customerName: destination.name,
      dayGroup: "Today",
      duration: draftMeetingDuration,
      startClock: draftMeetingStartClock,
      participantsCount: attendees.length || 1,
      labels: [],
      prepSummary: `New meeting draft for ${destination.name}. Use this popup as a fast way to seed a record before details arrive.`,
      prepChecklist: [
        "Attach the relevant inbox or project context.",
        "Confirm attendee list before join time.",
        "Convert outcomes into a follow-up note after the call.",
      ],
      highlights: ["Fresh draft meeting created from the top command rail."],
      notes: ["Use this record as the initial shell before the actual conversation begins."],
      transcript: [{ speaker: "Ubik", text: "New meeting created. Add transcript or notes once the call starts." }],
      files: [],
      kind: "meeting",
      nextJoinIn: "new",
    };

    setCustomMeetings([nextMeeting, ...customMeetings]);
    setSelectedSpaceId(destination.id);
    setSelectedMeetingId(nextMeeting.id);
    setSidebarMode(getSidebarModeForSegment(destination.segment));
    setNewMeetingDialogOpen(false);
    setDraftMeetingTitle("");
    setDraftMeetingAttendees("Priya, Ganesh");
    setDraftMeetingDuration("30 min");
    setDraftMeetingStartClock("4:30 PM");
    toast("Meeting created", {
      description: `${title} is ready in ${destination.name}.`,
    });
    navigate({
      pathname: `/meetings/${nextMeeting.id}`,
      search: location.search,
    });
  };
  const visibleScopes = spacesWithCounts.filter((space) => {
    const matchesSidebarMode = sidebarMode === "folders" ? space.segment === "folders" : space.segment !== "folders";
    return matchesSidebarMode && (space.segment === "folders" || space.count > 0 || space.isCustom || space.id === "all");
  });
  useEffect(() => {
    if (!visibleScopes.length) return;
    if (visibleScopes.some((space) => space.id === selectedSpaceId)) return;
    setSelectedSpaceId(visibleScopes[0].id);
  }, [selectedSpaceId, setSelectedSpaceId, visibleScopes]);
  const toggleTimelineSection = (sectionKey: TimelineSectionKey) => {
    setTimelineSectionOpen({
      ...timelineSectionOpen,
      [sectionKey]: !timelineSectionOpen[sectionKey],
    });
  };

  const folderIconOptions: { value: FolderIconKey; label: string }[] = [
    { value: "folder", label: "Folder" },
    { value: "people", label: "Shared" },
    { value: "notes", label: "Notes" },
    { value: "signal", label: "Signal" },
  ];
  const commandMeeting = isMeetingDetailView ? routeMeeting : visibleMeetings[0] ?? null;
  const commandMeetingApproved = commandMeeting ? approvedMeetingIds.includes(commandMeeting.id) : false;
  const commandMeetingReminded = commandMeeting ? remindedMeetingIds.includes(commandMeeting.id) : false;
  const commandDiscussCandidates = contactCards
    .filter((contact) =>
      commandMeeting
        ? `${contact.name} ${contact.company} ${contact.role}`.toLowerCase().includes(commandMeeting.customerName.toLowerCase()) ||
          commandMeeting.participants.some((participant) => contact.name.toLowerCase().includes(participant.toLowerCase()))
        : false,
    )
    .slice(0, 5);
  const selectedNewFolderMembers = contactCards.filter((contact) => newFolderMemberIds.includes(contact.id));
  const meetingScopeMeta = {
    folders: {
      railLabel: "Folders",
      composerLabel: "New folder",
      triggerLabel: isCreateFolderExpanded ? "Hide" : "New folder",
      submitLabel: "Create folder",
      namePlaceholder: "Folder name",
      promptPlaceholder: "Collect renewal prep, decisions, and follow-through in one folder",
      helper: "Create a durable meeting journey that groups related calls and notes.",
    },
    meetings: {
      railLabel: "Meetings",
      composerLabel: "New meeting space",
      triggerLabel: isCreateFolderExpanded ? "Hide" : "New meeting space",
      submitLabel: "Create meeting space",
      namePlaceholder: "Space name",
      promptPlaceholder: "Keep the customer thread, quick note, or operator handoff together",
      helper: "Use one combined meetings rail for customer continuity, quick notes, and internal handoffs.",
    },
  }[sidebarMode];
  const detailSpace = customerSpaces.find((space) => space.id === selectedMeeting.customerId);
  const detailBreadcrumbLabel = detailSpace?.name ?? selectedMeeting.customerName;
  const focusMeetingSearch = () => {
    if (secondaryRailCollapsed) {
      setSecondaryRailCollapsed(false);
    }
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('input[aria-label="Search meetings, notes, or folders"]')?.focus();
    }, 40);
  };
  const openNewMeeting = () => {
    setDraftMeetingSpaceId(selectedSpaceId === "all" ? customerSpaces.find((space) => space.id !== "all")?.id ?? "redwood-foods" : selectedSpaceId);
    setNewMeetingDialogOpen(true);
  };
  const joinNextMeeting = () => {
    const nextMeeting = upcomingMeetings[0];
    if (!nextMeeting) return;
    openMeetingDetail(nextMeeting.id);
    toast("Meeting ready", {
      description: `Opening ${nextMeeting.title} so you can jump in without losing context.`,
    });
  };

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if (shouldIgnoreSurfaceHotkeys(event.target)) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const key = event.key.toLowerCase();

      if (!isMeetingDetailView) {
        if (key === "f") {
          event.preventDefault();
          focusMeetingSearch();
          return;
        }

        if (key === "n") {
          event.preventDefault();
          openNewMeeting();
          return;
        }

        if (key === "j" && upcomingMeetings.length) {
          event.preventDefault();
          joinNextMeeting();
        }
        return;
      }

      if (key === "escape") {
        event.preventDefault();
        navigate("/meetings?tab=meetings-main");
        return;
      }

      if (key === "n") {
        event.preventDefault();
        openNewMeeting();
        return;
      }

      if (!commandMeeting) return;

      if (key === "d") {
        event.preventDefault();
        setDiscussCommandOpen((open) => !open);
        return;
      }

      if (key === "a") {
        event.preventDefault();
        toggleApproval(commandMeeting.id);
        return;
      }

      if (key === "r") {
        event.preventDefault();
        toggleReminder(commandMeeting.id);
      }
    };

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [commandMeeting, isMeetingDetailView, navigate, toggleApproval, toggleReminder, upcomingMeetings]);

  const meetingCommandBar = (
    <div className={commandRailClass}>
      <div className={commandRailGroupClass}>
        <button
          aria-label={secondaryRailCollapsed ? "Expand meetings sidebar" : "Collapse meetings sidebar"}
          className={commandRailIconButtonClass}
          onClick={() => setSecondaryRailCollapsed(!secondaryRailCollapsed)}
          type="button"
        >
          <SidebarSimpleIcon className="size-4" />
        </button>
        {isMeetingDetailView ? (
          <>
            <span className={commandRailDividerClass} aria-hidden="true" />
            <button className={commandRailButtonClass} onClick={() => navigate("/meetings?tab=meetings-main")} type="button">
              <ArrowLeftIcon className="size-4" />
              <span>Back</span>
              <span className={commandRailShortcutClass}>Esc</span>
            </button>
          </>
        ) : null}
        {!isMeetingDetailView ? (
          <>
            <span className={commandRailDividerClass} aria-hidden="true" />
            <button className={commandRailButtonClass} onClick={focusMeetingSearch} type="button">
              <span>Filter</span>
              <span className={commandRailShortcutClass}>F</span>
            </button>
          </>
        ) : null}
      </div>

      <span className={commandRailDividerClass} aria-hidden="true" />

      <div className={cn(commandRailGroupClass, "min-w-0 flex-1 justify-center gap-1 pr-1")}>
        <button
          className={cn(commandRailButtonClass, commandRailPrimaryButtonClass)}
          onClick={openNewMeeting}
          type="button"
        >
          <span>New meeting</span>
          <span className={cn(commandRailShortcutClass, "border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground")}>N</span>
        </button>
      </div>

      <span className={commandRailDividerClass} aria-hidden="true" />

      <div className={commandRailGroupClass}>
        {!isMeetingDetailView && upcomingMeetings.length ? (
          <button className={commandRailButtonClass} onClick={joinNextMeeting} type="button">
            <span>Join next</span>
            <span className={commandRailShortcutClass}>J</span>
          </button>
        ) : null}
        {isMeetingDetailView ? (
          <Popover open={discussCommandOpen} onOpenChange={setDiscussCommandOpen}>
            <PopoverTrigger asChild>
              <button
                className={cn(commandRailButtonClass, discussCommandOpen && commandRailActiveButtonClass)}
                disabled={!commandMeeting}
                type="button"
              >
                <span>Discuss</span>
                <span className={commandRailShortcutClass}>D</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[320px]">
              <div className="space-y-3">
                <div>
                  <p className={sectionLabelClass}>Discuss this meeting</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Route {commandMeeting?.title ?? "this meeting"} into a Slack or email follow-up with the right teammate.
                  </p>
                </div>
                <div className="space-y-2">
                  {(commandDiscussCandidates.length ? commandDiscussCandidates : contactCards.slice(0, 4)).map((contact) => (
                    <button
                      key={contact.id}
                      className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-left transition-colors hover:bg-secondary/35"
                      onClick={() => {
                        setDiscussCommandOpen(false);
                        toast("Discussion queued", {
                          description: `${contact.name} can review ${commandMeeting?.title ?? "this meeting"} in Slack or email.`,
                        });
                      }}
                      type="button"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{contact.role} · {contact.company}</p>
                      </div>
                      <ChatCircleTextIcon className="size-4 text-foreground/52" />
                    </button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ) : null}
        {isMeetingDetailView ? (
          <button
            className={cn(commandRailButtonClass, commandMeetingApproved && commandRailActiveButtonClass)}
            disabled={!commandMeeting}
            onClick={() => commandMeeting && toggleApproval(commandMeeting.id)}
            type="button"
          >
            <span>Approve</span>
            <span className={commandRailShortcutClass}>A</span>
          </button>
        ) : null}
        {isMeetingDetailView ? (
          <button
            className={cn(commandRailButtonClass, commandMeetingReminded && commandRailActiveButtonClass)}
            disabled={!commandMeeting}
            onClick={() => commandMeeting && toggleReminder(commandMeeting.id)}
            type="button"
          >
            <span>Remind</span>
            <span className={commandRailShortcutClass}>R</span>
          </button>
        ) : null}
        {isMeetingDetailView ? <span className={commandRailDividerClass} aria-hidden="true" /> : null}
        {isMeetingDetailView ? (
          <button
            className={commandRailButtonClass}
            disabled={!commandMeeting}
            onClick={() => commandMeeting && deleteMeetingRecord(commandMeeting.id)}
            type="button"
          >
            <span>Delete</span>
          </button>
        ) : null}
      </div>

      <span className={commandRailDividerClass} aria-hidden="true" />

      <div className={commandRailGroupClass}>
        <button
          aria-label="Open in Google Calendar"
          className={commandRailIconButtonClass}
          onClick={() =>
            toast("Google Calendar", {
              description: `${commandMeeting?.title ?? "Meeting"} can open in the calendar handoff next.`,
            })
          }
          type="button"
        >
          <GoogleCalendar className="size-4" />
        </button>
      </div>
    </div>
  );
  const meetingCommandDialog = (
    <Dialog open={newMeetingDialogOpen} onOpenChange={setNewMeetingDialogOpen}>
      <DialogContent className="max-w-[520px]">
        <DialogHeader>
          <DialogTitle>New meeting</DialogTitle>
          <DialogDescription>Create a lightweight meeting shell and drop it straight into the right folder journey.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <InputGroup className="h-10 bg-background">
              <InputGroupInput
                aria-label="Meeting title"
                onChange={(event) => setDraftMeetingTitle(event.target.value)}
                placeholder="Meeting title"
                value={draftMeetingTitle}
              />
            </InputGroup>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={draftMeetingSpaceId} onValueChange={(value) => setDraftMeetingSpaceId(value as MeetingSpaceId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Folder" />
                </SelectTrigger>
                <SelectContent>
                  {customerSpaces
                    .filter((space) => space.id !== "all")
                    .map((space) => (
                      <SelectItem key={space.id} value={space.id}>
                        {space.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <InputGroup className="h-10 bg-background">
                <InputGroupInput
                  aria-label="Meeting start time"
                  onChange={(event) => setDraftMeetingStartClock(event.target.value)}
                  placeholder="4:30 PM"
                  value={draftMeetingStartClock}
                />
              </InputGroup>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <InputGroup className="h-10 bg-background">
                <InputGroupInput
                  aria-label="Meeting duration"
                  onChange={(event) => setDraftMeetingDuration(event.target.value)}
                  placeholder="30 min"
                  value={draftMeetingDuration}
                />
              </InputGroup>
              <InputGroup className="h-10 bg-background">
                <InputGroupInput
                  aria-label="Meeting attendees"
                  onChange={(event) => setDraftMeetingAttendees(event.target.value)}
                  placeholder="Priya, Ganesh"
                  value={draftMeetingAttendees}
                />
              </InputGroup>
            </div>
            <Button onClick={createMeetingRecord} type="button">
              <CalendarPlusIcon data-icon="inline-start" /> Create meeting
            </Button>
          </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="h-[calc(100vh-3.5rem)] min-h-0 overflow-hidden px-3 py-4 lg:px-6 lg:py-5">
      <PageContainer className="h-full min-h-0">
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div className="shrink-0">{meetingCommandBar}</div>
          <div
            className={cn(
              "grid min-h-0 flex-1 gap-4",
              secondaryRailCollapsed ? "xl:grid-cols-[minmax(0,1fr)]" : "xl:grid-cols-[320px_minmax(0,1fr)]",
            )}
          >
          {!secondaryRailCollapsed ? (
            <Surface className="flex min-h-0 flex-col overflow-hidden bg-background">
              <div className="border-b border-border/60 px-4 py-4">
                <InputGroup className="h-10 bg-background">
                  <InputGroupAddon>
                    <InputGroupText>
                      <MagnifyingGlassIcon />
                    </InputGroupText>
                  </InputGroupAddon>
                  <InputGroupInput
                    aria-label="Search meetings, notes, or folders"
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search meetings, notes, or folders..."
                    value={searchQuery}
                  />
                </InputGroup>
                <ToggleGroup
                  type="single"
                  value={sidebarMode}
                  onValueChange={(value) => {
                    if (value === "folders" || value === "meetings") {
                      setSidebarMode(value);
                    }
                  }}
                  className="mt-3 grid w-full grid-cols-2 gap-1"
                >
                  <ToggleGroupItem value="folders" className="flex w-full min-w-0 items-center justify-center gap-2 px-3">
                    <span>Folders</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/48">
                      {spacesWithCounts.filter((space) => space.segment === "folders").length}
                    </span>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="meetings" className="flex w-full min-w-0 items-center justify-center gap-2 px-3">
                    <span>Meetings</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/48">
                      {spacesWithCounts.filter((space) => space.segment !== "folders").length}
                    </span>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="space-y-5 px-3 py-3">
                    <section>
                      <div className="flex items-center justify-between px-1">
                        <p className={sectionLabelClass}>{meetingScopeMeta.railLabel}</p>
                        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/48">{visibleScopes.length}</span>
                      </div>
                      <div className="mt-2 space-y-2">
                        {visibleScopes.map((space) => {
                          const active = selectedSpaceId === space.id;
                          const movableIndex = movableCustomerSpaces.findIndex((item) => item.id === space.id);
                          const isMovable = movableIndex !== -1;
                          return (
                            <div
                              key={space.id}
                              className={cn(
                                "group flex items-start gap-2 rounded-xl border bg-background px-3 py-3 transition-colors",
                                active
                                  ? "border-primary/35 bg-background shadow-sm ring-1 ring-primary/15"
                                  : "border-border/70 hover:border-border hover:bg-background",
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
                              <button className="flex min-w-0 flex-1 items-start gap-3 text-left" onClick={() => selectSpace(space.id)} type="button">
                                <div className={cn("mt-0.5 flex size-8 shrink-0 items-center justify-center", active ? "text-primary" : "text-foreground/60")}>
                                  {renderFolderIcon(space.icon)}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <p className="truncate text-sm font-medium text-foreground">{space.name}</p>
                                    {space.locked ? <LockIcon className="h-3.5 w-3.5 shrink-0 text-foreground/45" /> : null}
                                    {space.shared ? <UsersIcon className="h-3.5 w-3.5 shrink-0 text-foreground/45" /> : null}
                                    {space.pinned ? <PushPinIcon className="h-3.5 w-3.5 shrink-0 text-foreground/45" /> : null}
                                  </div>
                                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{space.description}</p>
                                </div>
                              </button>
                              <div className="flex shrink-0 items-center gap-1">
                                <span
                                  className={cn(
                                    "rounded-md border bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em]",
                                    active ? "border-primary/30 bg-primary/5 text-primary" : "border-border text-foreground/60",
                                  )}
                                >
                                  {space.count}
                                </span>
                                {isMovable ? (
                                  <>
                                    <Button
                                      aria-label={space.pinned ? `Unpin ${space.name}` : `Pin ${space.name}`}
                                      variant="ghost"
                                      size="icon-sm"
                                      className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                      onClick={() => togglePinSpace(space.id)}
                                      type="button"
                                    >
                                      <PushPinIcon className={cn("h-3.5 w-3.5", space.pinned && "fill-current")} />
                                    </Button>
                                    <Button
                                      aria-label={`Delete ${space.name}`}
                                      variant="ghost"
                                      size="icon-sm"
                                      className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                      onClick={() => deleteSpace(space.id)}
                                      type="button"
                                    >
                                      <TrashIcon className="h-3.5 w-3.5" />
                                    </Button>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </section>

                    <Collapsible className="border-t border-border/60 pt-4" open={isCreateFolderExpanded} onOpenChange={setIsCreateFolderExpanded}>
                      <div className="flex items-center justify-between px-1">
                        <p className={sectionLabelClass}>{meetingScopeMeta.composerLabel}</p>
                        <CollapsibleTrigger asChild>
                          <Button size="sm" type="button" variant="outline">
                            <FolderPlusIcon data-icon="inline-start" /> {meetingScopeMeta.triggerLabel}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <CollapsibleContent>
                        <div className="mt-3 rounded-xl border border-border/70 bg-background px-3 py-3">
                          <div className="grid gap-3">
                            <div>
                              <p className={sectionLabelClass}>{meetingScopeMeta.composerLabel}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{meetingScopeMeta.helper}</p>
                            </div>
                            <InputGroup className="h-10 bg-background">
                              <InputGroupInput
                                aria-label="New folder name"
                                onChange={(event) => setNewFolderName(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    createFolder();
                                  }
                                }}
                                placeholder={meetingScopeMeta.namePlaceholder}
                                value={newFolderName}
                              />
                            </InputGroup>

                            {sidebarMode === "meetings" ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                  <p className={sectionLabelClass}>Recent contacts</p>
                                  <span className="text-xs text-muted-foreground">Seed a company from connected contacts.</span>
                                </div>
                                <div className="grid gap-2">
                                  {contactCards.slice(0, 4).map((contact) => (
                                    <button
                                      key={contact.id}
                                      className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-left transition-colors hover:bg-secondary/35"
                                      onClick={() => applyCustomerSeed(contact.id)}
                                      type="button"
                                    >
                                      <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary/60 text-xs font-medium text-foreground">
                                          {getInitials(contact.company)}
                                        </div>
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium text-foreground">{contact.company}</p>
                                          <p className="truncate text-xs text-muted-foreground">{contact.name} · {contact.role}</p>
                                        </div>
                                      </div>
                                      <UsersIcon className="size-4 text-foreground/45" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : null}

                            <div className="grid gap-3 sm:grid-cols-[120px_minmax(0,1fr)]">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button className="justify-between" type="button" variant="outline">
                                    <span className="inline-flex items-center gap-2">
                                      {renderFolderIcon(newFolderIcon)}
                                      {folderIconOptions.find((option) => option.value === newFolderIcon)?.label}
                                    </span>
                                    <CaretDownIcon className="size-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent align="start" className="w-[220px]">
                                  <div className="space-y-3">
                                    <div>
                                      <p className={sectionLabelClass}>Icon picker</p>
                                      <p className="mt-1 text-sm text-muted-foreground">Pick the phosphor icon that best matches this folder journey.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      {folderIconOptions.map((option) => (
                                        <Button
                                          key={option.value}
                                          className="justify-start"
                                          onClick={() => setNewFolderIcon(option.value)}
                                          type="button"
                                          variant={newFolderIcon === option.value ? "default" : "outline"}
                                        >
                                          {renderFolderIcon(option.value)}
                                          {option.label}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <InputGroup className="min-h-[88px] bg-background">
                                <InputGroupTextarea
                                  aria-label="Folder prompt"
                                  className="min-h-[78px] resize-none"
                                  onChange={(event) => setNewFolderPrompt(event.target.value)}
                                  placeholder={meetingScopeMeta.promptPlaceholder}
                                  rows={3}
                                  value={newFolderPrompt}
                                />
                              </InputGroup>
                            </div>

                            {newFolderIcon === "people" ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                  <p className={sectionLabelClass}>Contacts</p>
                                  <span className="text-xs text-muted-foreground">Pick who this shared folder is for.</span>
                                </div>
                                {selectedNewFolderMembers.length ? (
                                  <div className="flex flex-wrap gap-2">
                                    {selectedNewFolderMembers.map((contact) => (
                                      <button
                                        key={contact.id}
                                        className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-foreground"
                                        onClick={() => toggleFolderMember(contact.id)}
                                        type="button"
                                      >
                                        {contact.name}
                                        <span className="text-foreground/42">×</span>
                                      </button>
                                    ))}
                                  </div>
                                ) : null}
                                <div className="grid gap-2">
                                  {contactCards.slice(0, 6).map((contact) => {
                                    const selected = newFolderMemberIds.includes(contact.id);
                                    return (
                                      <button
                                        key={contact.id}
                                        className={cn(
                                          "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition-colors",
                                          selected ? "border-primary/25 bg-primary/5 ring-1 ring-primary/10" : "border-border/70 hover:bg-secondary/35",
                                        )}
                                        onClick={() => toggleFolderMember(contact.id)}
                                        type="button"
                                      >
                                        <div className="min-w-0">
                                          <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                                          <p className="truncate text-xs text-muted-foreground">{contact.role} · {contact.company}</p>
                                        </div>
                                        {selected ? <CheckIcon className="size-4 text-primary" /> : <UsersIcon className="size-4 text-foreground/45" />}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}

                            <Button className="w-full" size="sm" onClick={createFolder} type="button">
                              <FolderPlusIcon data-icon="inline-start" /> {meetingScopeMeta.submitLabel}
                            </Button>
                          </div>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                </div>
              </ScrollArea>
            </Surface>
          ) : null}

          <Surface className="min-h-0 min-w-0 overflow-hidden bg-background">
            {isMeetingDetailView ? (
              routeMeeting ? (
                <div className="flex h-full min-h-0 flex-col overflow-x-hidden">
                  <div className="border-b border-border/60 px-5 py-4 lg:px-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <Breadcrumb>
                          <BreadcrumbList>
                            <BreadcrumbItem>
                              <BreadcrumbLink asChild>
                                <button
                                  className="text-foreground/56 transition-colors hover:text-foreground"
                                  onClick={closeMeetingDetail}
                                  type="button"
                                >
                                  {detailBreadcrumbLabel}
                                </button>
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                              <BreadcrumbPage>{selectedMeeting.kind === "quick_note" ? "Quick note" : "Meeting record"}</BreadcrumbPage>
                            </BreadcrumbItem>
                          </BreadcrumbList>
                        </Breadcrumb>
                        <h2 className="mt-4 text-[24px] leading-tight text-foreground">{selectedMeeting.title}</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {selectedMeeting.time} · {selectedMeeting.duration} · {selectedMeeting.participantsCount}{" "}
                          {selectedMeeting.participantsCount === 1 ? "attendee" : "attendees"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-0 text-[11px] uppercase tracking-[0.12em] text-foreground/58 hover:bg-transparent hover:text-foreground"
                        onClick={closeMeetingDetail}
                        type="button"
                      >
                        Back to landing <CaretRightIcon className="h-3.5 w-3.5 rotate-180" />
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <AvatarGroup>
                        {selectedMeeting.participants.slice(0, 3).map((person) => renderPersonAvatar(person))}
                        {selectedMeeting.participants.length > 3 ? (
                          <AvatarGroupCount>+{selectedMeeting.participants.length - 3}</AvatarGroupCount>
                        ) : null}
                      </AvatarGroup>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{selectedMeeting.participants.join(", ")}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {selectedMeeting.customerName} · {selectedMeeting.kind === "quick_note" ? "Internal working note" : "Shared meeting continuity"}
                        </p>
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" size="sm" type="button">
                            <PaperPlaneTiltIcon data-icon="inline-start" /> Share
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent align="end" className="w-[360px]">
                          <div className="space-y-4">
                            <div>
                              <p className={sectionLabelClass}>Share meeting</p>
                              <p className="mt-1 text-sm text-muted-foreground">Send this note over connected apps or add more contacts before sharing.</p>
                            </div>

                            {shareRecipients.length ? (
                              <div className="flex flex-wrap gap-2">
                                {shareRecipients.map((contact) => (
                                  <button
                                    key={contact.id}
                                    className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-foreground"
                                    onClick={() => removeShareRecipient(contact.id)}
                                    type="button"
                                  >
                                    {contact.name}
                                    <span className="text-foreground/42">×</span>
                                  </button>
                                ))}
                              </div>
                            ) : null}

                            <InputGroup className="h-10 bg-background">
                              <InputGroupAddon>
                                <InputGroupText>
                                  <MagnifyingGlassIcon />
                                </InputGroupText>
                              </InputGroupAddon>
                              <InputGroupInput
                                aria-label="Search contacts to share with"
                                onChange={(event) =>
                                  setShareQueryByMeeting({
                                    ...shareQueryByMeeting,
                                    [selectedMeeting.id]: event.target.value,
                                  })
                                }
                                placeholder="Add more contacts"
                                value={shareQuery}
                              />
                            </InputGroup>

                            <div className="max-h-40 space-y-1 overflow-auto">
                              {availableShareContacts.slice(0, 6).map((contact) => (
                                <button
                                  key={contact.id}
                                  className="flex w-full items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2 text-left transition-colors hover:bg-secondary/35"
                                  onClick={() => addShareRecipient(contact.id)}
                                  type="button"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-foreground">{contact.name}</p>
                                    <p className="truncate text-xs text-muted-foreground">{contact.role} · {contact.company}</p>
                                  </div>
                                  <span className="text-xs uppercase tracking-[0.12em] text-foreground/52">Add</span>
                                </button>
                              ))}
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                              <Button variant="outline" size="sm" onClick={() => triggerShare("email")} type="button">
                                <EnvelopeSimpleIcon data-icon="inline-start" /> Email
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => triggerShare("link")} type="button">
                                <CopyIcon data-icon="inline-start" /> Copy link
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => triggerShare("slack")} type="button">
                                <SlackLogoIcon data-icon="inline-start" /> Slack
                              </Button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto">
                    <div className="mx-auto w-full max-w-4xl px-5 py-5">
                      <Tabs
                        value={selectedDetailTab}
                        onValueChange={(value) =>
                          setDetailTabByMeeting({
                            ...detailTabByMeeting,
                            [selectedMeeting.id]: value as MeetingDetailTab,
                          })
                        }
                      >
                        <TabsList className="grid w-full max-w-md grid-cols-3 rounded-none">
                          <TabsTrigger value="summary">Summary</TabsTrigger>
                          <TabsTrigger value="transcript">Transcript</TabsTrigger>
                          <TabsTrigger value="files">Files</TabsTrigger>
                        </TabsList>

                        <TabsContent value="summary" className="mt-5">
                          <section className="border border-border/70 bg-card px-6 py-6">
                            <RichOperatorEditor
                              className="border-0 bg-transparent shadow-none"
                              minHeight={440}
                              onChange={(value) =>
                                setSummaryDocumentByMeeting({
                                  ...summaryDocumentByMeeting,
                                  [selectedMeeting.id]: value,
                                })
                              }
                              placeholder="Type / for headings, lists, quotes, dividers, or diagrams."
                              showCopyActions={false}
                              showMarkdownCopy={false}
                              value={detailSummaryDocument}
                            />

                            <div className="mt-5 border-t border-border/60 pt-5">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className={sectionLabelClass}>Task nudges</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Keep the task push lightweight. Nudge action items into Tasks without another routing form.
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground">{selectedMeeting.customerName}</span>
                              </div>

                              <div className="mt-4 space-y-2">
                                {detailChecklist.map((item, index) => (
                                  <div key={`${selectedMeeting.id}-task-${index}`} className="flex items-start gap-3 border border-border/70 bg-background px-3 py-3">
                                    <Checkbox
                                      checked={item.checked}
                                      className="mt-1"
                                      onCheckedChange={(checked) => updateChecklist(index, { checked: checked === true })}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <input
                                        aria-label={`Action item ${index + 1}`}
                                        className="w-full border-0 bg-transparent px-0 text-sm leading-7 text-foreground outline-none placeholder:text-muted-foreground"
                                        onChange={(event) => updateChecklist(index, { text: event.target.value })}
                                        value={item.text}
                                      />
                                      <p className="mt-1 text-xs text-muted-foreground">Open · High · Today</p>
                                    </div>
                                    <Button
                                      aria-label={`Nudge ${item.text} into tasks`}
                                      className="shrink-0"
                                      onClick={() => routeChecklistTask(index)}
                                      size="icon-sm"
                                      type="button"
                                      variant="ghost"
                                    >
                                      <NotePencilIcon />
                                    </Button>
                                    {item.routed ? <Badge variant="secondary">Added</Badge> : null}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </section>
                        </TabsContent>

                        <TabsContent value="transcript" className="mt-5">
                          <section className="border border-border/70 bg-card px-6 py-6">
                            <p className={sectionLabelClass}>Transcript</p>
                            <p className="mt-2 text-sm text-muted-foreground">Keep the raw meeting language readable without the heavy grey treatment.</p>
                            <div className="mt-4 space-y-3">
                              {selectedMeeting.transcript.map((entry, index) => (
                                <div key={`${entry.speaker}-${index}`} className="border border-border/70 bg-background px-4 py-4">
                                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{entry.speaker}</p>
                                  <p className="mt-2 text-sm leading-7 text-foreground/86">{entry.text}</p>
                                </div>
                              ))}
                            </div>
                          </section>
                        </TabsContent>

                        <TabsContent value="files" className="mt-5">
                          <section className="border border-border/70 bg-card px-6 py-6">
                            <p className={sectionLabelClass}>Files</p>
                            <p className="mt-2 text-sm text-muted-foreground">Screenshots, documents, sheets, and linked artifacts attached to this meeting.</p>
                            <div className="mt-4 space-y-3">
                              {selectedMeetingFiles.length ? (
                                selectedMeetingFiles.map((file) => (
                                  <div key={file.name} className="flex items-center gap-3 border border-border/70 bg-background px-4 py-4">
                                    <div className="flex size-9 shrink-0 items-center justify-center border border-border/70 bg-card text-foreground/62">
                                      {fileKindIcon(file.kind)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
                                      <p className="truncate text-xs text-muted-foreground">
                                        Added by {file.addedBy} · {file.addedAt}
                                      </p>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground">
                                  No files attached yet.
                                </div>
                              )}
                            </div>
                          </section>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>

                  <div className="border-t border-border/60 px-5 py-3 lg:px-5 overflow-x-hidden">
                    <InputGroup className="h-10 bg-background">
                      <InputGroupInput
                        aria-label="Ask about this meeting"
                        onChange={(event) => setMeetingQuestion(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            toast("Question sent", {
                              description: `Q&A is ready to reason over ${selectedMeeting.title}.`,
                            });
                            setMeetingQuestion("");
                          }
                        }}
                        placeholder="Ask this meeting anything..."
                        value={meetingQuestion}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="default"
                          size="sm"
                          onClick={() => {
                            toast("Question sent", {
                              description: `Q&A is ready to reason over ${selectedMeeting.title}.`,
                            });
                            setMeetingQuestion("");
                          }}
                          type="button"
                        >
                          <PaperPlaneTiltIcon data-icon="inline-start" /> Ask
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-6">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-0 text-sm text-foreground/65 hover:bg-transparent hover:text-foreground"
                    onClick={closeMeetingDetail}
                    type="button"
                  >
                    <CaretRightIcon className="h-4 w-4 rotate-180" /> Back to meetings
                  </Button>
                  <p className="mt-4 text-sm text-foreground/72">This meeting could not be found.</p>
                </div>
              )
            ) : (
              <div className="flex h-full min-h-0 flex-col overflow-hidden">
                <div
                  className={cn(
                    "min-h-0 flex-1 overflow-hidden px-4 lg:px-5",
                    folderCanvasMode === "note" && generatedFolderNote ? "" : "py-3",
                  )}
                >
                  {folderCanvasMode === "note" && generatedFolderNote ? (
                    <div className="flex h-full min-h-0 min-w-0 flex-col bg-background">
                      <div className="border-b border-border/60 px-4 py-2">
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
                            <Button
                              aria-label={isGeneratedPromptExpanded ? "Collapse prompt" : "Expand prompt"}
                              variant="ghost"
                              size="sm"
                              className="mt-0.5 shrink-0 px-1 text-[10px] uppercase tracking-[0.08em] text-foreground/36 hover:bg-transparent hover:text-foreground/68"
                              onClick={() => setIsGeneratedPromptExpanded((expanded) => !expanded)}
                              type="button"
                            >
                              <CaretDownIcon className={cn("h-3 w-3 transition-transform", isGeneratedPromptExpanded && "rotate-180")} />
                            </Button>
                          ) : null}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="ml-1 shrink-0 px-1 text-xs uppercase tracking-[0.1em] text-foreground/58 hover:bg-transparent hover:text-foreground"
                            onClick={() => setFolderCanvasMode("workspace")}
                            type="button"
                          >
                            <CaretRightIcon className="h-3.5 w-3.5 rotate-180" />
                            Back
                          </Button>
                        </div>
                      </div>
                      <div className="meeting-history-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3">
                        <div className="space-y-3 px-4">
                          <div className="surface-card rounded-xl p-4">
                            <p className={sectionLabelClass}>{generatedFolderNote.contextLabel}</p>
                            <h3 className="mt-2 text-lg text-foreground">{generatedFolderNote.title}</h3>
                          </div>
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
                      <div className="border-t border-border/60 px-4 py-2">
                        <InputGroup className="h-11 bg-background">
                          <InputGroupTextarea
                            aria-label="Continue generated note"
                            className="h-11 min-w-0 w-full resize-none overflow-hidden py-2 leading-6 [field-sizing:fixed]"
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
                          <InputGroupAddon align="inline-end">
                            <InputGroupButton
                              aria-label="Record note follow-up"
                              variant="ghost"
                              size="icon-sm"
                              onClick={() =>
                                toast("Voice capture", {
                                  description: "Voice capture can be connected into this follow-up field next.",
                                })
                              }
                              type="button"
                            >
                              <MicrophoneIcon />
                            </InputGroupButton>
                            <InputGroupButton
                              aria-label="Send note follow-up"
                              variant="ghost"
                              size="icon-sm"
                              onClick={continueGeneratedNote}
                              type="button"
                            >
                              <PaperPlaneTiltIcon />
                            </InputGroupButton>
                          </InputGroupAddon>
                        </InputGroup>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full min-h-0 flex-col">
                      <ScrollArea className="min-h-0 flex-1">
                        <div className="space-y-6 pb-4">
                          {upcomingMeetings.length ? (
                            <section>
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className={sectionLabelClass}>Upcoming today</p>
                                  <p className="mt-1 text-sm text-muted-foreground">Keep the next calls visible before you open a meeting.</p>
                                </div>
                                {selectedSpaceId !== "all" ? (
                                  <Badge variant="outline" className="gap-1.5 px-2.5 py-1">
                                    <FolderOpenIcon className="h-3.5 w-3.5" /> {selectedSpace.name}
                                  </Badge>
                                ) : null}
                              </div>

                              <div className="mt-3 overflow-x-auto">
                                <div className="flex gap-3 pb-2">
                                  {upcomingMeetings.map((meeting, index) => {
                                    const featured = index === 0;
                                    return (
                                      <button
                                        key={meeting.id}
                                        className={cn(
                                          "min-w-[272px] border px-4 py-4 text-left transition-colors",
                                          featured
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border/70 bg-background hover:bg-secondary/35",
                                        )}
                                        onClick={() => openMeetingDetail(meeting.id)}
                                        type="button"
                                      >
                                        <div className={cn("flex items-center justify-between gap-3 text-xs", featured ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                          <span className="inline-flex items-center gap-1.5">
                                            <ClockIcon className="h-3.5 w-3.5" /> {meeting.startClock}
                                          </span>
                                          <span className="inline-flex items-center gap-1.5">
                                            <ClockIcon className="h-3.5 w-3.5" /> {meeting.duration}
                                          </span>
                                          {meeting.nextJoinIn ? (
                                            <span
                                              className={cn(
                                                "rounded-sm px-2 py-1 text-[10px] uppercase tracking-[0.1em]",
                                                featured ? "bg-primary-foreground/15 text-primary-foreground" : "bg-amber-500/10 text-amber-700",
                                              )}
                                            >
                                              {meeting.nextJoinIn}
                                            </span>
                                          ) : null}
                                        </div>
                                        <h3 className="mt-4 text-xl leading-tight">{meeting.title}</h3>
                                        <p className={cn("mt-3 text-sm", featured ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                          {meeting.customerName}
                                        </p>
                                        <div className="mt-5 flex items-center justify-between gap-3">
                                          <Badge variant={featured ? "secondary" : "outline"}>{meeting.stage}</Badge>
                                          <span className={cn("inline-flex items-center gap-1 text-sm", featured ? "text-primary-foreground" : "text-amber-700")}>
                                            <CalendarBlankIcon className="h-3.5 w-3.5" /> Join
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </section>
                          ) : null}

                          <section className="space-y-3">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className={sectionLabelClass}>Timeline</p>
                                  <p className="mt-1 text-sm text-muted-foreground">
                                    Grouped into today, upcoming, and previous so each folder scope stays scan-first.
                                  </p>
                                </div>
                                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/48">
                                  {landingTimelineSections.reduce((count, section) => count + section.meetings.length, 0)} items
                                </span>
                              </div>

                              {landingTimelineSections.map((section) => (
                                <Collapsible key={section.key} open={timelineSectionOpen[section.key]} onOpenChange={() => toggleTimelineSection(section.key)}>
                                  <div className="overflow-hidden border border-border/70 bg-background">
                                    <CollapsibleTrigger asChild>
                                      <button className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left" type="button">
                                        <div>
                                          <p className={sectionLabelClass}>{section.label}</p>
                                          <p className="mt-1 text-sm text-muted-foreground">
                                            {section.key === "today"
                                              ? "Upcoming calls, quick notes, and operator continuity."
                                              : section.key === "upcoming"
                                                ? "The next calls stacked underneath the folder view."
                                                : "Previously happened notes and completed meetings."}
                                          </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/48">{section.meetings.length}</span>
                                          <CaretDownIcon className={cn("h-4 w-4 text-foreground/48 transition-transform", timelineSectionOpen[section.key] && "rotate-180")} />
                                        </div>
                                      </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="border-t border-border/60">
                                      {section.meetings.length ? (
                                        section.meetings.map((meeting) => (
                                          <button
                                            key={meeting.id}
                                            className="flex w-full items-center gap-4 border-b border-border/60 px-4 py-4 text-left last:border-b-0 hover:bg-secondary/35"
                                            onClick={() => openMeetingDetail(meeting.id)}
                                            type="button"
                                          >
                                            <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-medium", getMeetingAccent(meeting))}>
                                              {meeting.customerName.slice(0, 1)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <p className="truncate text-[15px] font-medium text-foreground">{meeting.title}</p>
                                              <p className="mt-1 truncate text-sm text-muted-foreground">
                                                {meeting.owner}
                                                {meeting.participants.length > 1 ? `, ${meeting.participants.slice(0, 2).join(", ")}` : ""}
                                              </p>
                                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                <FolderIcon className="h-3.5 w-3.5" /> {meeting.customerName}
                                              </p>
                                            </div>
                                            <div className="shrink-0 text-right">
                                              <p className="text-sm text-foreground/72">{meeting.startClock}</p>
                                              <div className="mt-1 inline-flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className={cn("size-2 rounded-full", meeting.stage === "Upcoming" ? "bg-amber-500" : "bg-emerald-500")} />
                                                {meeting.stage === "Upcoming" ? "Upcoming" : "Done"}
                                              </div>
                                            </div>
                                          </button>
                                        ))
                                      ) : (
                                        <div className="px-4 py-5 text-sm text-muted-foreground">No meetings in this section yet.</div>
                                      )}
                                    </CollapsibleContent>
                                  </div>
                                </Collapsible>
                              ))}
                            </section>
                        </div>
                      </ScrollArea>

                      <div className="border-t border-border/60 pb-4 pt-3">
                        <div className="surface-card overflow-hidden rounded-xl">
                          <div className="px-3 py-3">
                            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-foreground/58">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md bg-primary/8 px-2.5 py-1 text-primary">{landingPromptScope.label}</span>
                                <span>{landingChatRange === "recent-25" ? "Recent meeting history in view." : "Using full meeting history."}</span>
                              </div>
                              <Select value={landingChatRange} onValueChange={(value) => setLandingChatRange(value as LandingChatRange)}>
                                <SelectTrigger className="h-8 w-[128px]">
                                  <SelectValue placeholder="Range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="recent-25">Recent</SelectItem>
                                  <SelectItem value="all">All</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <InputGroup className="mt-3 min-h-[86px] bg-background">
                              <InputGroupTextarea
                                aria-label="Ask about meeting folders and recent history"
                                className="min-h-[72px] min-w-0 w-full resize-none overflow-y-auto py-2 leading-6 [field-sizing:fixed]"
                                onChange={(event) => setFolderPrompt(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                                    askFolder();
                                  }
                                }}
                                placeholder={`Ask across ${landingChatRange === "recent-25" ? "recent meetings in " : ""}${landingPromptScope.label.toLowerCase()}...`}
                                rows={2}
                                value={folderPrompt}
                              />
                              <InputGroupAddon align="block-end" className="justify-end">
                                <InputGroupButton
                                  aria-label="Record landing prompt"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() =>
                                    toast("Voice capture", {
                                      description: "Voice capture can be connected into this prompt field next.",
                                    })
                                  }
                                  type="button"
                                >
                                  <MicrophoneIcon />
                                </InputGroupButton>
                                <InputGroupButton
                                  aria-label="Send landing prompt"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => askFolder()}
                                  type="button"
                                >
                                  <PaperPlaneTiltIcon />
                                </InputGroupButton>
                              </InputGroupAddon>
                            </InputGroup>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Surface>
          </div>
          {meetingCommandDialog}
        </div>
      </PageContainer>
    </div>
  );
}
