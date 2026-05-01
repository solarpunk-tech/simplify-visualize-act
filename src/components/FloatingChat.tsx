import { useState, useRef, useEffect } from "react";
import { CaretDownIcon, PaperPlaneTiltIcon, PaperclipIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MentionSuggestion {
  id: string;
  label: string;
  type: "tab" | "skill" | "agent" | "chat" | "artifact";
}

const mentionItems: MentionSuggestion[] = [
  { id: "home", label: "home", type: "tab" },
  { id: "inbox", label: "inbox", type: "tab" },
  { id: "projects", label: "projects", type: "tab" },
  { id: "meetings", label: "meetings", type: "tab" },
  { id: "agents", label: "agents", type: "tab" },
  { id: "research", label: "research", type: "skill" },
  { id: "email-analysis", label: "email analysis", type: "skill" },
  { id: "budget-report", label: "budget report", type: "skill" },
  { id: "email-triage", label: "Email Triage Agent", type: "agent" },
  { id: "rate-agent", label: "Rate Confirmation Agent", type: "agent" },
  { id: "chat-maersk", label: "Rate confirmation — Maersk Q2", type: "chat" },
];

const typeLabels: Record<string, string> = {
  tab: "TABS",
  skill: "SKILLS",
  agent: "AGENTS",
  chat: "CHATS",
  artifact: "ARTIFACTS",
};

interface FloatingChatProps {
  onFocusChange?: (focused: boolean) => void;
}

export function FloatingChat({ onFocusChange }: FloatingChatProps) {
  const [message, setMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filtered = mentionFilter
    ? mentionItems.filter((m) =>
        m.label.toLowerCase().includes(mentionFilter.toLowerCase())
      )
    : mentionItems;

  const grouped = filtered.reduce<Record<string, MentionSuggestion[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionFilter]);

  const handleFocus = () => {
    setIsFocused(true);
    onFocusChange?.(true);
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Don't blur if clicking within the chat container
    const container = e.currentTarget.closest('[data-chat-container]');
    if (container?.contains(e.relatedTarget as Node)) return;
    
    // Delay to allow click events to fire
    setTimeout(() => {
      setIsFocused(false);
      onFocusChange?.(false);
    }, 150);
  };

  const insertMention = (item: MentionSuggestion) => {
    const atIndex = message.lastIndexOf("@");
    if (atIndex !== -1) {
      setMessage(message.slice(0, atIndex) + `@${item.label} `);
    }
    setShowMentions(false);
    setMentionFilter("");
    textareaRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);

    const lastAt = val.lastIndexOf("@");
    if (lastAt !== -1 && (lastAt === 0 || val[lastAt - 1] === " ")) {
      const query = val.slice(lastAt + 1);
      if (!query.includes(" ")) {
        setShowMentions(true);
        setMentionFilter(query);
        return;
      }
    }
    setShowMentions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showMentions) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        if (flatFiltered[selectedIndex]) insertMention(flatFiltered[selectedIndex]);
        return;
      }
      if (e.key === "Escape") {
        setShowMentions(false);
        return;
      }
    }
    if (e.key === "Escape" && isFocused) {
      setIsFocused(false);
      onFocusChange?.(false);
      textareaRef.current?.blur();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setMessage("");
    }
  };

  return (
    <div
      data-chat-container
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[640px] px-4 transition-transform duration-200 ${
        isFocused ? "-translate-y-2" : ""
      }`}
    >
      {/* @ Mention dropdown */}
      {showMentions && flatFiltered.length > 0 && (
        <div className="mb-2 max-h-[280px] overflow-y-auto rounded-xl border border-border/70 bg-card shadow-lg shadow-foreground/10">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div className="border-b border-border/70 px-3 py-1.5 font-mono text-[9px] tracking-widest text-muted-foreground">
                {typeLabels[type] || type.toUpperCase()}
              </div>
              {items.map((item) => {
                const globalIdx = flatFiltered.indexOf(item);
                return (
                  <Button
                    key={item.id}
                    onClick={() => insertMention(item)}
                    variant={globalIdx === selectedIndex ? "secondary" : "ghost"}
                    className={`h-auto w-full justify-start rounded-none px-3 py-2 text-left text-xs ${
                      globalIdx === selectedIndex
                        ? "text-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground">@</span>
                    {item.label}
                  </Button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Chat input */}
      <div className={`rounded-2xl border bg-card transition-all duration-200 ${
        isFocused 
          ? "border-ring shadow-xl shadow-primary/10" 
          : "border-border/70 shadow-lg shadow-foreground/10"
      }`}>
        <div className="flex items-end gap-2 p-3">
          <Button variant="outline" size="icon-sm" className="mb-0.5 shrink-0">
            <PaperclipIcon />
          </Button>

          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Ask anything... use @ to mention tabs, skills, agents"
            rows={1}
            className="min-h-[32px] max-h-[120px] flex-1 resize-none border-0 bg-transparent py-1.5 text-sm shadow-none focus-visible:ring-0"
          />

          <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
            <Button variant="outline" size="sm" className="h-8 text-[11px]">
              <span>GPT-4</span>
              <CaretDownIcon />
            </Button>
            <Button
              size="icon-sm"
              onClick={() => setMessage("")}
            >
              <PaperPlaneTiltIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
