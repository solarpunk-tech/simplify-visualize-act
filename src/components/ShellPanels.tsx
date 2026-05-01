import { useEffect, useState } from "react";
import { MonitorIcon, XIcon } from "@phosphor-icons/react";

import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useShellState } from "@/hooks/use-shell-state";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  ApprovalDrawerContent,
  DrawerContent,
  DrawerSurfaceContent,
  ProvenanceDrawerContent,
  TaskWorkflowDrawerContent,
} from "@/lib/ubik-types";

function PanelSection({
  label,
  action,
  children,
  footer,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Surface size="sm" className="gap-0 overflow-hidden">
      <CardHeader className="border-b border-border/70">
        <div className="flex items-center justify-between gap-3">
          <p className="section-label">{label}</p>
          {action}
        </div>
      </CardHeader>
      <CardContent className="py-3">{children}</CardContent>
      {footer ? <CardFooter className="gap-2">{footer}</CardFooter> : null}
    </Surface>
  );
}

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
        <div className="space-y-2">
          {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
          <div className="space-y-1">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
            {description ? <p className="max-w-sm text-sm leading-6 text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        <Button
          aria-label="Dismiss drawer"
          onClick={onClose}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <XIcon />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}

function GenericDrawerView({ content }: { content: DrawerContent }) {
  return (
    <>
      {content.metadata?.length ? (
        <PanelSection label="Metadata">
          <div className="space-y-3">
            {content.metadata.map((item) => (
              <div key={item.label} className="flex items-start justify-between gap-4">
                <span className="section-label">{item.label}</span>
                <span className="max-w-[68%] text-right text-sm leading-6 text-foreground">{item.value}</span>
              </div>
            ))}
          </div>
        </PanelSection>
      ) : null}

      {content.timeline?.length ? (
        <PanelSection label="Trace">
          <div className="space-y-3">
            {content.timeline.map((item) => (
              <div key={item} className="surface-well rounded-xl border-l-2 border-l-primary/35 p-3 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </PanelSection>
      ) : null}

      {content.actions?.length ? (
        <PanelSection label="Recommended actions">
          <div className="flex flex-wrap gap-2">
            {content.actions.map((item) => (
              <StatusPill key={item}>{item}</StatusPill>
            ))}
          </div>
        </PanelSection>
      ) : null}
    </>
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
    <>
      <PanelSection
        action={
          <StatusPill tone={content.approval.riskLevel.toLowerCase().includes("high") ? "alert" : "default"}>
            {content.approval.riskLevel}
          </StatusPill>
        }
        label="Proposed action"
      >
        <div className="space-y-4">
          <div>
            <p className="section-label">Action type</p>
            <p className="mt-2 text-base font-medium text-foreground">{content.approval.actionType}</p>
          </div>
          <div>
            <p className="section-label">Why approval is needed</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{content.approval.whyApprovalNeeded}</p>
          </div>
          <div>
            <p className="section-label">Business impact</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{content.approval.businessImpact}</p>
          </div>
          <div>
            <p className="section-label">Target</p>
            <p className="mt-2 text-sm leading-6 text-foreground">{content.approval.target}</p>
          </div>
        </div>
      </PanelSection>

      <PanelSection
        action={<StatusPill>{reviewState}</StatusPill>}
        footer={
          <>
            <SmallButton active onClick={() => setReviewState("Approved")}>
              Approve
            </SmallButton>
            <SmallButton onClick={() => setReviewState("Rejected")}>Reject</SmallButton>
            <SmallButton onClick={() => setReviewState("Editing")}>Edit</SmallButton>
            <SmallButton onClick={() => setReviewState("Escalated")}>Escalate</SmallButton>
          </>
        }
        label="Editable output"
      >
        <Textarea
          className="min-h-[180px] border-border bg-background text-sm leading-6 shadow-none focus-visible:ring-0"
          onChange={(event) => {
            setDraft(event.target.value);
            setReviewState("Editing");
          }}
          value={draft}
        />
      </PanelSection>

      <PanelSection label="Source trace">
        <div className="space-y-3">
          {content.approval.trace.map((item) => (
            <div key={item} className="surface-well rounded-xl border-l-2 border-l-primary/35 p-3 text-sm leading-6 text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </PanelSection>
    </>
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
    <>
      <PanelSection
        action={<StatusPill>{saveState}</StatusPill>}
        footer={
          <>
            <SmallButton
              active
              onClick={() => setSaveState(task.mode === "create" ? "Task created" : "Task updated")}
            >
              {task.mode === "create" ? "Create task" : "Update task"}
            </SmallButton>
            <SmallButton onClick={() => setSaveState("Workflow queued")}>Run workflow</SmallButton>
          </>
        }
        label="Task packet"
      >
        <div className="space-y-4">
          <div>
            <p className="section-label">Task title</p>
            <Input
              className="mt-2 bg-background shadow-none focus-visible:ring-0"
              onChange={(event) => {
                setTask({ ...task, taskTitle: event.target.value });
                setSaveState("Editing");
              }}
              value={task.taskTitle}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="section-label">Owner</p>
              <Input
                className="mt-2 bg-background shadow-none focus-visible:ring-0"
                onChange={(event) => {
                  setTask({ ...task, owner: event.target.value });
                  setSaveState("Editing");
                }}
                value={task.owner}
              />
            </div>
            <div>
              <p className="section-label">Due date</p>
              <Input
                className="mt-2 bg-background shadow-none focus-visible:ring-0"
                onChange={(event) => {
                  setTask({ ...task, dueDate: event.target.value });
                  setSaveState("Editing");
                }}
                value={task.dueDate}
              />
            </div>
          </div>

          <div>
            <p className="section-label">Next action</p>
            <Textarea
              className="mt-2 min-h-[110px] border-border bg-background shadow-none focus-visible:ring-0"
              onChange={(event) => {
                setTask({ ...task, nextAction: event.target.value });
                setSaveState("Editing");
              }}
              value={task.nextAction}
            />
          </div>
        </div>
      </PanelSection>

      <PanelSection label="Execution context">
        <div className="space-y-3">
          {[
            ["Source thread", task.sourceThread],
            ["Workflow linkage", task.workflowLinkage],
            ["Approval requirement", task.approvalRequirement],
            ["Current status", task.currentStatus],
            ["Follow-up plan", task.followUpPlan],
            ["Linked playbook", task.linkedPlaybook],
            ["Linked agent", task.linkedAgent],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4">
              <span className="section-label">{label}</span>
              <span className="max-w-[68%] text-right text-sm leading-6 text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </PanelSection>

      <PanelSection label="Delegation history">
        <div className="space-y-3">
          {task.delegationHistory.map((item) => (
            <div key={item} className="surface-well rounded-xl border-l-2 border-l-primary/35 p-3 text-sm leading-6 text-muted-foreground">
              {item}
            </div>
          ))}
        </div>
      </PanelSection>
    </>
  );
}

function ProvenanceDrawerView({ content }: { content: ProvenanceDrawerContent }) {
  return (
    <>
      <PanelSection label="Recommendation inputs">
        <div className="space-y-3">
          {content.items.map((item) => (
            <div key={`${item.label}-${item.value}`} className="surface-well rounded-xl border-l-2 border-l-primary/35 p-3">
              <p className="section-label">{item.label}</p>
              <p className="mt-2 text-sm leading-6 text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </PanelSection>

      {content.supportingTrace?.length ? (
        <PanelSection label="Supporting trace">
          <div className="space-y-3">
            {content.supportingTrace.map((item) => (
              <div key={item} className="surface-well rounded-xl border-l-2 border-l-primary/35 p-3 text-sm leading-6 text-muted-foreground">
                {item}
              </div>
            ))}
          </div>
        </PanelSection>
      ) : null}
    </>
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
    <DrawerFrame
      description={content.description}
      eyebrow={content.eyebrow}
      onClose={onClose}
      title={content.title}
    >
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
        <SheetContent side="right" className="w-full max-w-none border-l border-border bg-card p-0 shadow-none">
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
      <div className="flex items-start justify-between border-b border-border px-4 py-4">
        <div className="space-y-2">
          <p className="section-label">My Computer</p>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">{runtimeContent.title}</h3>
        </div>
        <Button
          aria-label="Close runtime"
          onClick={() => openRuntime(null)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <XIcon />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <PanelSection
          action={<StatusPill tone="alert">{runtimeContent.status}</StatusPill>}
          label="Runtime"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <MonitorIcon className="size-4 text-muted-foreground" />
              Execution trace
            </div>
            <div className="rounded-xl border border-border/60 bg-foreground px-4 py-4 font-mono text-[12px] leading-6 text-background shadow-inner">
              {runtimeContent.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
            {runtimeContent.artifactLabel ? (
              <div className="surface-well rounded-xl p-4">
                <p className="section-label">Artifact</p>
                <p className="mt-2 text-sm leading-6 text-foreground">{runtimeContent.artifactLabel}</p>
              </div>
            ) : null}
          </div>
        </PanelSection>
      </div>
    </aside>
  );
}
