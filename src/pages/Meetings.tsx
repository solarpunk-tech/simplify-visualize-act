import { useEffect, useMemo } from "react";
import {
  AudioLines,
  CalendarDays,
  CheckSquare,
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
  Share2,
  Tag,
  Users,
} from "lucide-react";

import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { meetings } from "@/lib/ubik-data";
import type { MeetingRecord } from "@/lib/ubik-types";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { useLocation, useNavigate, useParams } from "react-router-dom";

type MeetingSpaceId = "all" | "my-notes" | "thai-union" | "maersk" | "redwood-foods" | "harbor-retail";
type FolderTab = "notes" | "files" | "people";

type CustomerSpace = {
  id: MeetingSpaceId;
  name: string;
  description: string;
  initials: string;
  locked?: boolean;
  shared?: boolean;
};

type MeetingWorkspaceRecord = MeetingRecord & {
  customerId: Exclude<MeetingSpaceId, "all">;
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

const customerSpaces: CustomerSpace[] = [
  {
    id: "all",
    name: "All meetings",
    description: "See every customer call, quick note, and meeting history in one workspace.",
    initials: "AM",
  },
  {
    id: "my-notes",
    name: "My notes",
    description: "Private quick captures, scratchpads, and staging notes before you file them.",
    initials: "MN",
    locked: true,
  },
  {
    id: "thai-union",
    name: "Thai Union",
    description: "Supplier reviews, compliance history, and exception handling.",
    initials: "TU",
    shared: true,
  },
  {
    id: "maersk",
    name: "Maersk",
    description: "Logistics syncs, ETA resets, and shipment continuity.",
    initials: "MK",
    shared: true,
  },
  {
    id: "redwood-foods",
    name: "Redwood Foods",
    description: "Commercial reviews, planning calls, and renewal notes.",
    initials: "RF",
    shared: true,
  },
  {
    id: "harbor-retail",
    name: "Harbor Retail",
    description: "Buyer follow-ups, delivery resets, and relationship context.",
    initials: "HR",
    shared: true,
  },
];

const dayGroupOrder: MeetingWorkspaceRecord["dayGroup"][] = ["Today", "Yesterday", "Last week"];

function matchesSpace(meeting: MeetingWorkspaceRecord, spaceId: MeetingSpaceId) {
  if (spaceId === "all") return true;
  if (spaceId === "my-notes") return meeting.kind === "quick_note";
  return meeting.customerId === spaceId;
}

function parseDurationMinutes(duration: string) {
  const value = parseInt(duration, 10);
  return Number.isFinite(value) ? value : 0;
}

function computeEndClock(startClock: string, duration: string) {
  const match = startClock.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return startClock;

  const hours12 = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  const hours24 = (hours12 % 12) + (period === "PM" ? 12 : 0);
  const startTotal = hours24 * 60 + minutes;
  const endTotal = startTotal + parseDurationMinutes(duration);
  const endHours24 = Math.floor(endTotal / 60) % 24;
  const endMinutes = endTotal % 60;
  const endPeriod = endHours24 >= 12 ? "PM" : "AM";
  const endHours12 = endHours24 % 12 === 0 ? 12 : endHours24 % 12;
  return `${endHours12}:${String(endMinutes).padStart(2, "0")} ${endPeriod}`;
}

export default function Meetings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { meetingId } = useParams<{ meetingId: string }>();
  const { openDrawer, openFreshKnowAnything, setPageState } = useShellState();
  const [selectedSpaceId, setSelectedSpaceId] = useWorkbenchState<MeetingSpaceId>("meetings-space-id", "all");
  const [selectedMeetingId, setSelectedMeetingId] = useWorkbenchState<string>("meeting-id", workspaceMeetings[0].id);
  const [searchQuery, setSearchQuery] = useWorkbenchState<string>("meetings-search", "");
  const [folderPrompt, setFolderPrompt] = useWorkbenchState<string>("meetings-folder-prompt", "");
  const [meetingChatPrompt, setMeetingChatPrompt] = useWorkbenchState<string>("meetings-chat-prompt", "");
  const [folderTab, setFolderTab] = useWorkbenchState<FolderTab>("meetings-folder-tab", "notes");
  const [suggestionDismissed, setSuggestionDismissed] = useWorkbenchState<boolean>("meetings-folder-suggestion-dismissed", false);

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

  const askFolder = () => {
    const nextTabId = openFreshKnowAnything();
    if (!nextTabId) return;

    const prompt = [
      folderPrompt.trim() || `Summarize key notes and open tasks in the ${selectedSpace.name} folder.`,
      "",
      `Folder: ${selectedSpace.name}`,
      `Selected note: ${selectedMeeting.title}`,
      `Recent notes in folder: ${visibleMeetings.slice(0, 4).map((meeting) => meeting.title).join("; ")}`,
    ].join("\n");

    setPageState(`${nextTabId}:chat-composer`, prompt);
    setPageState(`${nextTabId}:chat-sources`, ["org_knowledge", "files"]);
    setPageState(`${nextTabId}:chat-mode`, "speed");
  };

  const askMeeting = () => {
    const nextTabId = openFreshKnowAnything();
    if (!nextTabId) return;

    const prompt = [
      meetingChatPrompt.trim() || `Summarize this meeting with decisions, blockers, and immediate next steps: ${selectedMeeting.title}.`,
      "",
      `Meeting: ${selectedMeeting.title}`,
      `When: ${selectedMeeting.time}`,
      `Duration: ${selectedMeeting.duration}`,
      `Start: ${selectedMeeting.startClock}`,
      `End: ${computeEndClock(selectedMeeting.startClock, selectedMeeting.duration)}`,
      `Attendees: ${selectedMeeting.participants.join(", ")}`,
      `Summary: ${selectedMeeting.summary}`,
      `Action items: ${selectedMeeting.actionItems.join("; ")}`,
      `Decisions: ${selectedMeeting.decisions.join("; ")}`,
    ].join("\n");

    setPageState(`${nextTabId}:chat-composer`, prompt);
    setPageState(`${nextTabId}:chat-sources`, ["org_knowledge", "files"]);
    setPageState(`${nextTabId}:chat-mode`, "speed");
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
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-[1560px]">
        <div className="grid gap-4 xl:grid-cols-[272px_minmax(0,1fr)]">
          <Surface className="overflow-hidden bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--background))_100%)]">
            <div className="border-b border-border px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Customer spaces</p>
              <div className="mt-3 flex flex-wrap gap-2">
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

            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center gap-2 border border-border bg-background px-3 py-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  aria-label="Search meetings"
                  className="w-full bg-transparent text-sm text-foreground outline-none"
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search meetings, customers, or labels"
                  value={searchQuery}
                />
              </div>
            </div>

            <div className="max-h-[calc(100vh-16rem)] overflow-auto px-2 py-2">
              {spacesWithCounts.map((space) => {
                const active = selectedSpaceId === space.id;
                return (
                  <button
                    key={space.id}
                    className={cn(
                      "mb-2 flex w-full items-start gap-3 border px-3 py-3 text-left transition-colors",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : "border-transparent bg-card text-foreground hover:border-border hover:bg-background",
                    )}
                    onClick={() => setSelectedSpaceId(space.id)}
                    type="button"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center border text-sm font-semibold",
                        active ? "border-background/40 bg-background/10 text-background" : "border-border bg-background text-foreground",
                      )}
                    >
                      {space.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-mono text-xs uppercase tracking-[0.14em]">{space.name}</p>
                        {space.locked ? <Lock className="h-3.5 w-3.5 shrink-0" /> : null}
                        {space.shared ? <Users className="h-3.5 w-3.5 shrink-0" /> : null}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em]",
                        active ? "border-background/30 text-background" : "border-border text-muted-foreground",
                      )}
                    >
                      {space.count}
                    </span>
                  </button>
                );
              })}

              <button
                className="mt-2 flex w-full items-center justify-between border border-dashed border-border px-3 py-3 text-left text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                onClick={() =>
                  toast("Add folder", {
                    description: "The next step would create a new customer folder and invite labels into it.",
                  })
                }
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <FolderPlus className="h-4 w-4" /> Add customer folder
                </span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </Surface>

          <Surface className="min-w-0 overflow-hidden">
            {isMeetingDetailView ? (
              routeMeeting ? (
                <div className="flex h-[calc(100vh-14rem)] min-h-[28rem] flex-col">
                  <div className="border-b border-border px-5 py-5">
                    <button
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      onClick={closeMeetingDetail}
                      type="button"
                    >
                      <ChevronRight className="h-4 w-4 rotate-180" /> Back to {selectedSpace.name}
                    </button>
                    <h3 className="mt-4 text-[2rem] leading-tight text-foreground">{selectedMeeting.title}</h3>
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <p className="inline-flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" /> {selectedMeeting.time}
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" /> {selectedMeeting.duration}
                      </p>
                      <p className="inline-flex items-center gap-2">
                        <Users className="h-4 w-4" /> {selectedMeeting.participantsCount} attendees
                      </p>
                      <p>Started: {selectedMeeting.startClock}</p>
                      <p>Ended: {computeEndClock(selectedMeeting.startClock, selectedMeeting.duration)}</p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedMeeting.labels.length ? (
                        selectedMeeting.labels.map((label) => (
                          <StatusPill key={label} tone="muted">
                            <Tag className="h-3.5 w-3.5" /> {label}
                          </StatusPill>
                        ))
                      ) : (
                        <StatusPill tone="muted">No labels</StatusPill>
                      )}
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-auto px-5 py-5">
                    <div className="space-y-6 pb-8">
                      <section>
                        <h4 className="text-xl text-foreground">Summary</h4>
                        <p className="mt-2 text-base leading-8 text-foreground/90">{selectedMeeting.summary}</p>
                      </section>

                      <section>
                        <h4 className="text-xl text-foreground">Action Items</h4>
                        <ul className="mt-2 space-y-2 text-base text-foreground/90">
                          {selectedMeeting.actionItems.map((item) => (
                            <li key={item} className="list-inside list-disc">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-xl text-foreground">Decisions</h4>
                        <ul className="mt-2 space-y-2 text-base text-foreground/90">
                          {selectedMeeting.decisions.map((item) => (
                            <li key={item} className="list-inside list-disc">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-xl text-foreground">Risks and Blockers</h4>
                        <ul className="mt-2 space-y-2 text-base text-foreground/90">
                          {(selectedMeeting.risksAndBlockers ?? selectedMeeting.prepChecklist).map((item) => (
                            <li key={item} className="list-inside list-disc">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-xl text-foreground">Key Insights</h4>
                        <ul className="mt-2 space-y-2 text-base text-foreground/90">
                          {(selectedMeeting.keyInsights ?? selectedMeeting.highlights).map((item) => (
                            <li key={item} className="list-inside list-disc">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </section>

                      <section>
                        <h4 className="text-xl text-foreground">Topics Covered</h4>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(selectedMeeting.topicsCovered ?? selectedMeeting.labels).map((item) => (
                            <StatusPill key={item} tone="muted">
                              {item}
                            </StatusPill>
                          ))}
                        </div>
                      </section>

                      <section>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xl text-foreground">Meeting Transcript</h4>
                          <p className="text-sm text-muted-foreground">{selectedMeeting.transcript.length} entries</p>
                        </div>
                        <div className="mt-3 divide-y divide-border border border-border bg-background">
                          {selectedMeeting.transcript.map((entry, index) => (
                            <div key={`${entry.speaker}-${index}`} className="px-4 py-3">
                              <p className="text-base text-foreground">
                                <span className="font-semibold">{entry.speaker}:</span> {entry.text}
                              </p>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>

                  <div className="border-t border-border bg-background px-5 py-4">
                    <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Ask about this meeting</p>
                    <div className="mt-3 flex flex-col gap-3 lg:flex-row">
                      <input
                        aria-label="Ask about this meeting"
                        className="min-w-0 flex-1 border border-border bg-background px-3 py-3 text-sm text-foreground outline-none"
                        onChange={(event) => setMeetingChatPrompt(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") askMeeting();
                        }}
                        placeholder="Ask follow-up questions for this meeting..."
                        value={meetingChatPrompt}
                      />
                      <SmallButton active onClick={askMeeting}>
                        <AudioLines className="mr-2 h-3.5 w-3.5" /> Ask in chat
                      </SmallButton>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-6">
                  <button
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    onClick={closeMeetingDetail}
                    type="button"
                  >
                    <ChevronRight className="h-4 w-4 rotate-180" /> Back to meetings
                  </button>
                  <p className="mt-4 text-sm text-muted-foreground">This meeting could not be found.</p>
                </div>
              )
            ) : (
              <div className="border-b border-border px-5 py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center gap-2 text-[2rem] leading-none text-foreground">
                      <FolderClosed className="h-7 w-7 text-muted-foreground" />
                      <span className="font-serif">{selectedSpace.name}</span>
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">Add description</p>
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

                <div className="mt-5 rounded-3xl border border-border bg-background p-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-foreground"
                      type="button"
                    >
                      <Folder className="h-3.5 w-3.5" /> {selectedSpace.name}
                    </button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      aria-label="Ask about folder"
                      className="h-11 flex-1 bg-transparent text-sm text-foreground outline-none"
                      onChange={(event) => setFolderPrompt(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") askFolder();
                      }}
                      placeholder="Ask about folder"
                      value={folderPrompt}
                    />
                    <button
                      aria-label="Ask about folder in chat"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                      onClick={askFolder}
                      type="button"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-4">
                  <button
                    className="inline-flex items-center justify-start gap-2 rounded-full border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() =>
                      openDrawer({
                        title: `${selectedSpace.name} todos`,
                        eyebrow: "Folder action",
                        timeline: visibleMeetings.flatMap((meeting) => meeting.actionItems).slice(0, 10),
                      })
                    }
                    type="button"
                  >
                    <CheckSquare className="h-3.5 w-3.5" /> List recent todos
                  </button>
                  <button
                    className="inline-flex items-center justify-start gap-2 rounded-full border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() =>
                      openDrawer({
                        title: `${selectedSpace.name} summary`,
                        eyebrow: "Folder action",
                        timeline: visibleMeetings.slice(0, 8).map((meeting) => meeting.summary),
                      })
                    }
                    type="button"
                  >
                    <AudioLines className="h-3.5 w-3.5" /> Summarize this folder
                  </button>
                  <button
                    className="inline-flex items-center justify-start gap-2 rounded-full border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                    onClick={askFolder}
                    type="button"
                  >
                    <SearchCheck className="h-3.5 w-3.5" /> Show in-flight projects
                  </button>
                  <button
                    className="inline-flex items-center justify-start gap-2 rounded-full border border-border px-3 py-2 text-left text-sm text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => toast("Recipes", { description: "Folder recipes are ready for this space." })}
                    type="button"
                  >
                    <ChevronRight className="h-3.5 w-3.5" /> All recipes
                  </button>
                </div>

                {showSuggestedNote ? (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background px-4 py-3">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">1 note might belong to this folder</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        className="rounded-full bg-[hsl(var(--primary)/0.14)] px-3 py-1.5 text-sm text-primary"
                        onClick={() => toast("Added note", { description: `${suggestedNote.title} moved into ${selectedSpace.name}.` })}
                        type="button"
                      >
                        Add 1 note
                      </button>
                      <button
                        aria-label="Dismiss suggestion"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setSuggestionDismissed(true)}
                        type="button"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="mt-4 border-b border-border px-1 pb-3">
                  <div className="flex flex-wrap gap-2">
                    {([
                      ["notes", "Notes"],
                      ["files", "Files"],
                      ["people", "People"],
                    ] as [FolderTab, string][]).map(([tabKey, tabLabel]) => (
                      <button
                        key={tabKey}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition-colors",
                          folderTab === tabKey
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-muted-foreground hover:text-foreground",
                        )}
                        onClick={() => setFolderTab(tabKey)}
                        type="button"
                      >
                        {tabLabel}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="max-h-[calc(100vh-22rem)] overflow-auto py-4">
                  {folderTab === "notes"
                    ? groupedHistory.map((group) => (
                        <div key={group.dayGroup} className="mb-5">
                          <p className="px-1 pb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                            {group.dayGroup}
                          </p>
                          <div className="space-y-1">
                            {group.meetings.map((meeting) => {
                              const selected = meeting.id === selectedMeeting.id;
                              return (
                                <button
                                  key={meeting.id}
                                  className={cn(
                                    "flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-colors",
                                    selected
                                      ? "border-foreground bg-background"
                                      : "border-transparent hover:border-border hover:bg-background",
                                  )}
                                  onClick={() => openMeetingDetail(meeting.id)}
                                  type="button"
                                >
                                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                                    <NotebookPen className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-[1.05rem] leading-6 text-foreground">{meeting.title}</p>
                                    <p className="truncate text-sm text-muted-foreground">
                                      {meeting.owner}
                                      {meeting.participants.length > 1 ? `, ${meeting.participants.slice(1).join(", ")}` : ""}
                                    </p>
                                  </div>
                                  <div className="text-right text-sm text-muted-foreground">
                                    <p>{meeting.startClock}</p>
                                    <p className="mt-1 inline-flex items-center gap-1">
                                      <Folder className="h-3.5 w-3.5" /> {meeting.customerName}
                                    </p>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))
                    : null}

                  {folderTab === "notes" && !groupedHistory.length ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">No notes in this folder yet.</p>
                  ) : null}

                  {folderTab === "files" ? (
                    <div className="space-y-2">
                      {folderFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-3">
                          <p className="inline-flex items-center gap-2 text-sm text-foreground">
                            <Files className="h-4 w-4 text-muted-foreground" /> {file.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{file.time}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {folderTab === "people" ? (
                    <div className="space-y-2">
                      {folderPeople.map((person) => (
                        <div key={person} className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-3">
                          <p className="inline-flex items-center gap-2 text-sm text-foreground">
                            <Users className="h-4 w-4 text-muted-foreground" /> {person}
                          </p>
                          <p className="text-sm text-muted-foreground">Member</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </Surface>
        </div>
      </div>
    </div>
  );
}
