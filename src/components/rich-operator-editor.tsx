import { useEffect, useMemo, useRef, useState } from "react";
import {
  CopyIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  MinusIcon,
  QuotesIcon,
  ShapesIcon,
  TextTIcon,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type EditorCommand = {
  key: string;
  label: string;
  trigger: string;
  aliases: string[];
  icon: React.ReactNode;
  template: string;
};

type SlashState = {
  start: number;
  end: number;
  query: string;
};

const commands: EditorCommand[] = [
  {
    key: "heading",
    label: "Heading",
    trigger: "heading",
    aliases: ["heading", "h1", "title"],
    icon: <TextTIcon />,
    template: "## Heading\n",
  },
  {
    key: "subheading",
    label: "Subheading",
    trigger: "subheading",
    aliases: ["subheading", "h2", "subtitle"],
    icon: <TextTIcon />,
    template: "### Subheading\n",
  },
  {
    key: "bullet",
    label: "Bulleted List",
    trigger: "bullet",
    aliases: ["bullet", "list", "ul"],
    icon: <ListBulletsIcon />,
    template: "- Item\n",
  },
  {
    key: "numbered",
    label: "Numbered List",
    trigger: "numbered",
    aliases: ["numbered", "list", "ol", "number"],
    icon: <ListNumbersIcon />,
    template: "1. Item\n",
  },
  {
    key: "quote",
    label: "Quote",
    trigger: "quote",
    aliases: ["quote", "callout"],
    icon: <QuotesIcon />,
    template: "> Note\n",
  },
  {
    key: "divider",
    label: "Divider",
    trigger: "divider",
    aliases: ["divider", "line", "separator"],
    icon: <MinusIcon />,
    template: "---\n",
  },
  {
    key: "diagram",
    label: "Diagram Block",
    trigger: "diagram",
    aliases: ["diagram", "mermaid", "flow"],
    icon: <ShapesIcon />,
    template: "```mermaid\ngraph LR\nA[Start] --> B[Decision]\n```\n",
  },
];

function toDocsSafeText(text: string) {
  const lines = text.split("\n");
  const out: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      out.push(line.replace(/^###\s+/, "").trim());
      out.push("");
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(line.replace(/^##\s+/, "").trim());
      out.push("");
      continue;
    }
    if (line.startsWith("# ")) {
      out.push(line.replace(/^#\s+/, "").trim());
      out.push("");
      continue;
    }
    if (line === "---") {
      out.push("────────");
      continue;
    }
    out.push(line);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function findSlashState(text: string, cursor: number): SlashState | null {
  const lineStart = text.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const lineText = text.slice(lineStart, cursor);
  const slashOnLine = lineText.lastIndexOf("/");

  if (slashOnLine < 0) return null;

  const beforeSlash = slashOnLine === 0 ? "" : lineText[slashOnLine - 1];
  if (beforeSlash && !/\s/.test(beforeSlash)) return null;

  const query = lineText.slice(slashOnLine + 1);
  if (/\s/.test(query)) return null;

  return {
    start: lineStart + slashOnLine,
    end: cursor,
    query: query.toLowerCase(),
  };
}

export function RichOperatorEditor({
  value,
  onChange,
  placeholder,
  minHeight = 150,
  showInsertBlock = true,
  showMarkdownCopy = true,
  showCopyActions = true,
  compactCopyActions = false,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeight?: number;
  showInsertBlock?: boolean;
  showMarkdownCopy?: boolean;
  showCopyActions?: boolean;
  compactCopyActions?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [cursor, setCursor] = useState(0);
  const [highlighted, setHighlighted] = useState(0);
  const [menuSuppressed, setMenuSuppressed] = useState(false);

  const slashState = useMemo(() => findSlashState(value, cursor), [value, cursor]);

  const filteredCommands = useMemo(() => {
    if (!slashState) return commands;
    if (!slashState.query) return commands;

    return commands.filter((command) => {
      return (
        command.trigger.startsWith(slashState.query) ||
        command.aliases.some((alias) => alias.startsWith(slashState.query))
      );
    });
  }, [slashState]);

  const menuOpen = Boolean(slashState && !menuSuppressed);

  useEffect(() => {
    setHighlighted(0);
  }, [slashState?.query]);

  const syncCursorFromTarget = (target: HTMLTextAreaElement) => {
    setCursor(target.selectionStart ?? 0);
    setMenuSuppressed(false);
  };

  const replaceRange = (start: number, end: number, text: string) => {
    const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      if (!ref.current) return;
      const nextCursor = start + text.length;
      ref.current.focus();
      ref.current.selectionStart = nextCursor;
      ref.current.selectionEnd = nextCursor;
      setCursor(nextCursor);
    });
  };

  const applyCommand = (command: EditorCommand) => {
    if (slashState) {
      replaceRange(slashState.start, slashState.end, command.template);
    } else {
      const end = value.length;
      const prefixed = end > 0 && !value.endsWith("\n") ? `\n${command.template}` : command.template;
      replaceRange(end, end, prefixed);
    }
    setMenuSuppressed(false);
  };

  const copyText = async (mode: "docs" | "markdown") => {
    const text = mode === "docs" ? toDocsSafeText(value) : value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <Card size="sm" className={cn("surface-card gap-0 overflow-visible", className)}>
      {showCopyActions ? (
        <CardHeader className="border-b border-border/70 py-3">
          <div className="flex items-center justify-end gap-2">
            <Button
              aria-label="Copy draft"
              className={cn(compactCopyActions ? "px-2" : "")}
              onClick={() => copyText("docs")}
              size={compactCopyActions ? "icon-sm" : "sm"}
              title="Copy draft"
              type="button"
              variant="outline"
            >
              <CopyIcon data-icon={compactCopyActions ? undefined : "inline-start"} />
              {!compactCopyActions ? "Copy Docs-safe" : null}
            </Button>
            {showMarkdownCopy ? (
              <Button
                aria-label="Copy markdown"
                onClick={() => copyText("markdown")}
                size="sm"
                type="button"
                variant="outline"
              >
                <CopyIcon data-icon="inline-start" />
                Copy Markdown
              </Button>
            ) : null}
          </div>
        </CardHeader>
      ) : null}

      <CardContent className="relative py-3">
        <div className="surface-well rounded-xl p-3">
          <Textarea
            ref={ref}
            className="min-h-0 w-full resize-none border-0 bg-transparent px-0 py-0 text-sm leading-6 text-foreground shadow-none focus-visible:ring-0"
            onChange={(event) => {
              onChange(event.target.value);
              syncCursorFromTarget(event.target);
            }}
            onClick={(event) => syncCursorFromTarget(event.currentTarget)}
            onKeyDown={(event) => {
              if (!menuOpen || filteredCommands.length === 0) {
                if (event.key === "Escape") setMenuSuppressed(true);
                return;
              }

              if (event.key === "ArrowDown") {
                event.preventDefault();
                setHighlighted((current) => (current + 1) % filteredCommands.length);
                return;
              }

              if (event.key === "ArrowUp") {
                event.preventDefault();
                setHighlighted((current) => (current - 1 + filteredCommands.length) % filteredCommands.length);
                return;
              }

              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                const selected = filteredCommands[Math.min(highlighted, filteredCommands.length - 1)];
                if (selected) applyCommand(selected);
                return;
              }

              if (event.key === "Escape") {
                event.preventDefault();
                setMenuSuppressed(true);
              }
            }}
            onSelect={(event) => syncCursorFromTarget(event.currentTarget)}
            placeholder={placeholder ?? "Type / for headings, lists, quotes, dividers, or diagrams."}
            style={{ minHeight }}
            value={value}
          />
        </div>

        {menuOpen ? (
          <div className="absolute inset-x-6 top-6 z-20">
            <div className="surface-card overflow-hidden rounded-xl shadow-lg">
              <div className="border-b border-border/70 px-3 py-2">
                <p className="section-label">Commands</p>
              </div>
              <div className="max-h-56 overflow-y-auto p-2">
                {filteredCommands.map((command, index) => {
                  const active = index === highlighted;
                  return (
                    <button
                      key={command.key}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70",
                      )}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        applyCommand(command);
                      }}
                      type="button"
                    >
                      <span className="inline-flex items-center gap-2 font-medium text-foreground">
                        {command.icon}
                        {command.label}
                      </span>
                      <span className="section-label">/{command.trigger}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>

      {showInsertBlock ? (
        <CardFooter className="justify-start">
          <Button
            onClick={() => {
              const el = ref.current;
              if (!el) return;
              const nextValue = `${value.slice(0, el.selectionStart)}/${value.slice(el.selectionEnd)}`;
              onChange(nextValue);
              const nextCursor = (el.selectionStart ?? 0) + 1;
              requestAnimationFrame(() => {
                if (!ref.current) return;
                ref.current.focus();
                ref.current.selectionStart = nextCursor;
                ref.current.selectionEnd = nextCursor;
                setCursor(nextCursor);
                setMenuSuppressed(false);
                setHighlighted(0);
              });
            }}
            size="sm"
            type="button"
            variant="outline"
          >
            / Insert block
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
