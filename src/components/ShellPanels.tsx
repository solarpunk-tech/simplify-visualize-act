import { useEffect, useState } from "react";
import { Monitor, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState } from "@/hooks/use-shell-state";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ApprovalDrawerContent, DrawerContent, DrawerSurfaceContent, ProvenanceDrawerContent, TaskWorkflowDrawerContent } from "@/lib/ubik-types";

function DrawerFrame({
  title,
  eyebrow,
  description,
  onClose,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-start justify-between border-b border-border px-4 py-4">
        <div>
          {eyebrow ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 font-mono text-lg font-semibold text-foreground">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        <button className="border border-border p-2 text-foreground" onClick={onClose} type="button" aria-label="Dismiss drawer">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
    </div>
  );
}

function GenericDrawerView({ content }: { content: DrawerContent }) {
  return (
    <div className="space-y-4">
      {content.metadata?.length ? (
        <Surface className="p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Metadata</p>
          <div className="mt-3 space-y-3">
            {content.metadata.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</span>
                <span className="text-right text-sm leading-6 text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </Surface>
      ) : null}

      {content.timeline?.length ? (
        <Surface className="p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Trace</p>
          <div className="mt-3 space-y-3">
            {content.timeline.map((item) => (
              <div key={item} className="border-l border-border pl-3 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </Surface>
      ) : null}

      {content.actions?.length ? (
        <Surface className="p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recommended Actions</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {content.actions.map((item) => (
              <StatusPill key={item}>{item}</StatusPill>
            ))}
          </div>
        </Surface>
      ) : null}
    </div>
  );
}

function ApprovalDrawerView({ content }: { content: ApprovalDrawerContent }) {
  const [draft, setDraft] = useState(content.approval.editableOutput);
  const [reviewState, setReviewState] = useState("Reviewing");

  useEffect(() => {
    setDraft(content.approval.editableOutput);
    setReviewState("Reviewing");
  }, [content]);

  return (
    <div className="space-y-4">
      <Surface className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Proposed action</p>
            <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.14em] text-foreground">{content.approval.actionType}</p>
          </div>
          <StatusPill tone={content.approval.riskLevel.toLowerCase().includes("high") ? "alert" : "default"}>
            {content.approval.riskLevel}
          </StatusPill>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Why approval is needed</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{content.approval.whyApprovalNeeded}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Business impact</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{content.approval.businessImpact}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Target</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{content.approval.target}</p>
          </div>
        </div>
      </Surface>

      <Surface className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Editable output</p>
          <StatusPill>{reviewState}</StatusPill>
        </div>
        <Textarea
          className="mt-4 min-h-[180px] rounded-none border-border bg-card text-sm leading-6 shadow-none focus-visible:ring-0"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setReviewState("Editing");
          }}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <SmallButton active onClick={() => setReviewState("Approved")}>
            Approve
          </SmallButton>
          <SmallButton onClick={() => setReviewState("Rejected")}>Reject</SmallButton>
          <SmallButton onClick={() => setReviewState("Editing")}>Edit</SmallButton>
          <SmallButton onClick={() => setReviewState("Escalated")}>Escalate</SmallButton>
        </div>
      </Surface>

      <Surface className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Source trace</p>
        <div className="mt-3 space-y-3">
          {content.approval.trace.map((item) => (
            <div key={item} className="border-l border-border pl-3 text-sm leading-6 text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </Surface>
    </div>
  );
}

function TaskWorkflowDrawerView({ content }: { content: TaskWorkflowDrawerContent }) {
  const [task, setTask] = useState(content.task);
  const [saveState, setSaveState] = useState("Ready");

  useEffect(() => {
    setTask(content.task);
    setSaveState("Ready");
  }, [content]);

  return (
    <div className="space-y-4">
      <Surface className="p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Task packet</p>
          <StatusPill>{saveState}</StatusPill>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Task title</p>
            <Input
              className="mt-2 rounded-none border-border bg-card shadow-none focus-visible:ring-0"
              value={task.taskTitle}
              onChange={(event) => {
                setTask({ ...task, taskTitle: event.target.value });
                setSaveState("Editing");
              }}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Owner</p>
              <Input
                className="mt-2 rounded-none border-border bg-card shadow-none focus-visible:ring-0"
                value={task.owner}
                onChange={(event) => {
                  setTask({ ...task, owner: event.target.value });
                  setSaveState("Editing");
                }}
              />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Due date</p>
              <Input
                className="mt-2 rounded-none border-border bg-card shadow-none focus-visible:ring-0"
                value={task.dueDate}
                onChange={(event) => {
                  setTask({ ...task, dueDate: event.target.value });
                  setSaveState("Editing");
                }}
              />
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Next action</p>
            <Textarea
              className="mt-2 min-h-[110px] rounded-none border-border bg-card shadow-none focus-visible:ring-0"
              value={task.nextAction}
              onChange={(event) => {
                setTask({ ...task, nextAction: event.target.value });
                setSaveState("Editing");
              }}
            />
          </div>
        </div>
      </Surface>

      <Surface className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Execution context</p>
        <div className="mt-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Source thread</span>
            <span className="max-w-[70%] text-right text-sm leading-6 text-foreground">{task.sourceThread}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Workflow linkage</span>
            <span className="max-w-[70%] text-right text-sm leading-6 text-foreground">{task.workflowLinkage}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Approval requirement</span>
            <span className="max-w-[70%] text-right text-sm leading-6 text-foreground">{task.approvalRequirement}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Current status</span>
            <span className="max-w-[70%] text-right text-sm leading-6 text-foreground">{task.currentStatus}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Follow-up plan</span>
            <span className="max-w-[70%] text-right text-sm leading-6 text-foreground">{task.followUpPlan}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Linked playbook</span>
            <span className="max-w-[70%] text-right text-sm leading-6 text-foreground">{task.linkedPlaybook}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Linked agent</span>
            <span className="max-w-[70%] text-right text-sm leading-6 text-foreground">{task.linkedAgent}</span>
          </div>
        </div>
      </Surface>

      <Surface className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Delegation history</p>
        <div className="mt-3 space-y-3">
          {task.delegationHistory.map((item) => (
            <div key={item} className="border-l border-border pl-3 text-sm leading-6 text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <SmallButton active onClick={() => setSaveState(task.mode === "create" ? "Task created" : "Task updated")}>
            {task.mode === "create" ? "Create task" : "Update task"}
          </SmallButton>
          <SmallButton onClick={() => setSaveState("Workflow queued")}>Run workflow</SmallButton>
        </div>
      </Surface>
    </div>
  );
}

function ProvenanceDrawerView({ content }: { content: ProvenanceDrawerContent }) {
  return (
    <div className="space-y-4">
      <Surface className="p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recommendation inputs</p>
        <div className="mt-4 space-y-3">
          {content.items.map((item) => (
            <div key={`${item.label}-${item.value}`} className="border-l border-border pl-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </Surface>

      {content.supportingTrace?.length ? (
        <Surface className="p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Supporting trace</p>
          <div className="mt-3 space-y-3">
            {content.supportingTrace.map((item) => (
              <div key={item} className="border-l border-border pl-3 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </Surface>
      ) : null}
    </div>
  );
}

function DrawerBody({ content }: { content: DrawerSurfaceContent }) {
  if (content.kind === "approval") {
    return <ApprovalDrawerView content={content} />;
  }

  if (content.kind === "task_workflow") {
    return <TaskWorkflowDrawerView content={content} />;
  }

  if (content.kind === "provenance") {
    return <ProvenanceDrawerView content={content} />;
  }

  return <GenericDrawerView content={content} />;
}

function DrawerShell({
  content,
  onClose,
}: {
  content: DrawerSurfaceContent;
  onClose: () => void;
}) {
  return (
    <DrawerFrame title={content.title} eyebrow={content.eyebrow} description={content.description} onClose={onClose}>
      <DrawerBody content={content} />
    </DrawerFrame>
  );
}

export function RightDrawer() {
  const { drawerContent, openDrawer } = useShellState();
  const isMobile = useIsMobile();

  if (!drawerContent) return null;

  if (isMobile) {
    return (
      <Sheet open={!!drawerContent} onOpenChange={(open) => (!open ? openDrawer(null) : null)}>
        <SheetContent side="right" className="w-full max-w-none rounded-none border-l border-border bg-card p-0 shadow-none">
          <SheetTitle className="sr-only">Drawer</SheetTitle>
          <SheetDescription className="sr-only">
            Inspection drawer for approval, task, workflow, or provenance details.
          </SheetDescription>
          <DrawerShell content={drawerContent} onClose={() => openDrawer(null)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden w-[360px] shrink-0 border-l border-border bg-card xl:flex xl:flex-col">
      <DrawerShell content={drawerContent} onClose={() => openDrawer(null)} />
    </aside>
  );
}

export function RuntimePanel() {
  const { runtimeContent, openRuntime } = useShellState();
  if (!runtimeContent) return null;

  return (
    <aside className="hidden w-[360px] shrink-0 border-l border-border bg-background 2xl:flex 2xl:flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">My Computer</p>
          <h3 className="mt-1 font-mono text-lg font-semibold">{runtimeContent.title}</h3>
        </div>
        <button className="border border-border p-2" onClick={() => openRuntime(null)} type="button" aria-label="Close runtime">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Surface className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]">Runtime</span>
            </div>
            <StatusPill tone="alert">{runtimeContent.status}</StatusPill>
          </div>

          <div className="mt-4 space-y-3 bg-[#111315] p-4 font-mono text-[12px] text-[#F8F9FA]">
            {runtimeContent.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {runtimeContent.artifactLabel ? (
            <div className="mt-4 border border-border p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Artifact</p>
              <p className="mt-2 text-sm">{runtimeContent.artifactLabel}</p>
            </div>
          ) : null}
        </Surface>
      </div>
    </aside>
  );
}
