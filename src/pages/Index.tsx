import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowUp,
  Brain,
  FolderOpen,
  Globe,
  LibraryBig,
  Mail,
  Paperclip,
  Plus,
  Radio,
} from "lucide-react";

import { Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";

type ChatMode = "light" | "speed" | "max";
type ChatSource =
  | "org_knowledge"
  | "files"
  | "internet"
  | "gmail"
  | "zoho"
  | "salesforce"
  | "linear"
  | "slack"
  | "deep_research"
  | "agent_mode";

const pinnedSources: { key: ChatSource; label: string; icon: ReactNode }[] = [
  { key: "org_knowledge", label: "Organization Knowledge", icon: <LibraryBig className="h-3.5 w-3.5" /> },
  { key: "files", label: "Files", icon: <Paperclip className="h-3.5 w-3.5" /> },
  { key: "internet", label: "Internet", icon: <Globe className="h-3.5 w-3.5" /> },
];

const connectorItems: { key: ChatSource; label: string; icon: ReactNode }[] = [
  { key: "gmail", label: "Gmail", icon: <Mail className="h-3.5 w-3.5" /> },
  { key: "zoho", label: "Zoho", icon: <FolderOpen className="h-3.5 w-3.5" /> },
  { key: "salesforce", label: "Salesforce", icon: <Radio className="h-3.5 w-3.5" /> },
  { key: "linear", label: "Linear", icon: <LibraryBig className="h-3.5 w-3.5" /> },
  { key: "slack", label: "Slack", icon: <Mail className="h-3.5 w-3.5" /> },
];

const modeItems: { key: ChatMode; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "speed", label: "Speed" },
  { key: "max", label: "Max" },
];

const sourceLabels: Record<ChatSource, string> = {
  org_knowledge: "Organization Knowledge",
  files: "Files",
  internet: "Internet",
  gmail: "Gmail",
  zoho: "Zoho",
  salesforce: "Salesforce",
  linear: "Linear",
  slack: "Slack",
  deep_research: "Deep Research",
  agent_mode: "Agent Mode",
};

const attachmentSeeds = ["pricing-brief.html", "supplier-scorecard.pdf"];

export default function Index() {
  const { openDrawer, openRuntime } = useShellState();
  const [menuOpen, setMenuOpen] = useState(false);
  const [composer, setComposer] = useWorkbenchState("chat-composer", "");
  const [mode, setMode] = useWorkbenchState<ChatMode>("chat-mode", "speed");
  const [sources, setSources] = useWorkbenchState<ChatSource[]>("chat-sources", ["org_knowledge"]);
  const [attachments, setAttachments] = useWorkbenchState<string[]>("chat-attachments", []);
  const [connectorScope, setConnectorScope] = useWorkbenchState<string | null>("chat-connector-scope", null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  const toggleSource = (source: ChatSource) => {
    setSources(
      sources.includes(source) ? sources.filter((item) => item !== source) : [...sources, source],
    );

    if (connectorItems.some((item) => item.key === source)) {
      setConnectorScope(connectorScope === source ? null : source);
    }

    if (source === "files" && sources.includes("files")) {
      setAttachments([]);
    }
  };

  const addAttachment = (file: string) => {
    if (!attachments.includes(file)) {
      setAttachments([...attachments, file]);
    }
    if (!sources.includes("files")) {
      setSources([...sources, "files"]);
    }
    setMenuOpen(false);
  };

  const addConnector = (source: ChatSource) => {
    if (!sources.includes(source)) {
      setSources([...sources, source]);
    }
    setConnectorScope(source);
    setMenuOpen(false);
  };

  const addAdvancedSource = (source: ChatSource) => {
    if (!sources.includes(source)) {
      setSources([...sources, source]);
    }
    setMenuOpen(false);
  };

  const selectedContextLabels = [
    ...sources
      .filter((source) => !pinnedSources.some((item) => item.key === source))
      .map((source) => sourceLabels[source]),
    ...attachments,
  ];

  const runPrompt = () => {
    const selectedSources = sources.map((source) => sourceLabels[source]).join(", ") || "None";

    openRuntime({
      title: "Know Anything runtime",
      status: "Ready",
      lines: [
        `> Mode: ${mode.toUpperCase()}`,
        `> Sources: ${selectedSources}`,
        connectorScope ? `> Scoped connector: ${sourceLabels[connectorScope as ChatSource]}` : "> Scoped connector: None",
        "",
        composer || "Start with an operator task, a thread to continue, or a decision that needs context.",
      ],
      artifactLabel: "Prepared answer surface",
    });

    openDrawer({
      title: "Query context",
      eyebrow: "Know Anything",
      description: "Seeded context assembly preview for the centered composer.",
      metadata: [
        { label: "Mode", value: mode.toUpperCase() },
        { label: "Sources", value: selectedSources },
        { label: "Attachments", value: attachments.length ? attachments.join(", ") : "None" },
      ],
      actions: connectorScope ? [sourceLabels[connectorScope as ChatSource]] : undefined,
    });
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-17rem)] max-w-5xl items-center justify-center">
        <div className="w-full max-w-[68rem]">
          <div className="px-1 py-2 lg:px-2 lg:py-3">
            <div className="mx-auto max-w-5xl text-center">
              <h2 className="whitespace-nowrap font-mono text-[1.25rem] font-semibold uppercase tracking-[0.12em] lg:text-[1.7rem]">
                Start with a question or a task.
              </h2>
              <p className="mt-3 text-sm text-muted-foreground lg:text-[16px]">
                Ask across organization, inbox, meetings, projects or internet, when you need them.
              </p>
            </div>

            <Surface className="mx-auto mt-5 max-w-[46rem] border border-border bg-card shadow-none">
              <div className="p-3 lg:p-4">
              <div className="flex flex-col gap-3 border-b border-border pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative" ref={menuRef}>
                    <button
                      className="inline-flex h-9 w-9 items-center justify-center border border-border bg-background text-foreground transition-colors hover:border-foreground/35"
                      aria-label="Open context menu"
                      aria-expanded={menuOpen}
                      onClick={() => setMenuOpen((open) => !open)}
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>

                    {menuOpen ? (
                      <div
                        className="absolute left-0 top-[calc(100%+10px)] z-20 w-72 border border-border bg-card p-2 text-popover-foreground shadow-[0_24px_60px_-24px_hsl(var(--foreground)/0.25)]"
                        role="menu"
                      >
                        <p className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Add files
                        </p>
                        <button
                          className="flex w-full items-center px-2 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-accent"
                          onClick={() => addAttachment(attachmentSeeds[0])}
                          role="menuitem"
                          type="button"
                        >
                          Attach files
                        </button>
                        <button
                          className="flex w-full items-center px-2 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-accent"
                          onClick={() => addAttachment(attachmentSeeds[1])}
                          role="menuitem"
                          type="button"
                        >
                          Recent file
                        </button>
                        <div className="my-1 h-px bg-border" />

                        <p className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Organization knowledge
                        </p>
                        <button
                          className="flex w-full items-center px-2 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-accent"
                          onClick={() => toggleSource("org_knowledge")}
                          role="menuitem"
                          type="button"
                        >
                          Search organization knowledge
                        </button>
                        <div className="my-1 h-px bg-border" />

                        <p className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Connectors
                        </p>
                        {connectorItems.map((item) => (
                          <button
                            key={item.key}
                            className="flex w-full items-center gap-2 px-2 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-accent"
                            onClick={() => addConnector(item.key)}
                            role="menuitem"
                            type="button"
                          >
                            {item.icon}
                            {item.label}
                          </button>
                        ))}
                        <div className="my-1 h-px bg-border" />

                        <p className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          More
                        </p>
                        <button
                          className="flex w-full items-center gap-2 px-2 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-accent"
                          onClick={() => addAdvancedSource("deep_research")}
                          role="menuitem"
                          type="button"
                        >
                          <Brain className="h-3.5 w-3.5" />
                          Deep research
                        </button>
                        <button
                          className="flex w-full items-center gap-2 px-2 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-colors hover:bg-accent"
                          onClick={() => addAdvancedSource("agent_mode")}
                          role="menuitem"
                          type="button"
                        >
                          <Radio className="h-3.5 w-3.5" />
                          Agent mode
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {pinnedSources.map((item) => {
                    const active = sources.includes(item.key);
                    return (
                      <button
                        key={item.key}
                        className={`inline-flex h-9 items-center gap-2 border px-3 py-2 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors ${
                          active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background text-foreground hover:border-foreground/35"
                        }`}
                        onClick={() => toggleSource(item.key)}
                        type="button"
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <div className="inline-flex border border-border bg-background p-1">
                    {modeItems.map((item) => (
                      <button
                        key={item.key}
                        className={`px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] transition-colors ${
                          mode === item.key
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                        onClick={() => setMode(item.key)}
                        type="button"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <button
                    className="inline-flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground transition-colors hover:brightness-95"
                    onClick={runPrompt}
                    type="button"
                    aria-label="Run prompt"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                </div>
              </div>
              </div>

              <div className="mt-3 border border-border bg-[#f1f1ef]">
              <textarea
                className="min-h-[126px] w-full resize-none bg-transparent px-4 py-4 font-mono text-[12px] leading-6 text-foreground outline-none placeholder:text-[#6f6b63] lg:text-[13px]"
                value={composer}
                onChange={(event) => setComposer(event.target.value)}
                placeholder="Start with an operator task, a thread to continue, or a decision that needs context."
              />
              </div>

              {selectedContextLabels.length ? (
                <div className="mt-3 border border-border bg-background px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Attached context
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedContextLabels.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-2 border border-border bg-card px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            </Surface>
          </div>
        </div>
      </div>
    </div>
  );
}
