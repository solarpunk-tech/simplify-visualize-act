import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, ChevronDown } from "lucide-react";

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

export function FloatingChat() {
  const [message, setMessage] = useState("");
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const filtered = mentionFilter
    ? mentionItems.filter((m) =>
        m.label.toLowerCase().includes(mentionFilter.toLowerCase())
      )
    : mentionItems;

  // Group by type
  const grouped = filtered.reduce<Record<string, MentionSuggestion[]>>((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  useEffect(() => {
    setSelectedIndex(0);
  }, [mentionFilter]);

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
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      setMessage("");
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[640px] px-4">
      {/* @ Mention dropdown */}
      {showMentions && flatFiltered.length > 0 && (
        <div className="mb-1 border border-border bg-background max-h-[280px] overflow-y-auto shadow-[0_-8px_30px_-12px_hsl(var(--foreground)/0.12)]">
          {Object.entries(grouped).map(([type, items]) => (
            <div key={type}>
              <div className="px-3 py-1.5 font-mono text-[9px] tracking-widest text-muted-foreground border-b border-border">
                {typeLabels[type] || type.toUpperCase()}
              </div>
              {items.map((item) => {
                const globalIdx = flatFiltered.indexOf(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => insertMention(item)}
                    className={`w-full text-left px-3 py-2 text-xs font-mono flex items-center gap-2 transition-colors ${
                      globalIdx === selectedIndex
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent/10"
                    }`}
                  >
                    <span className="text-[10px] text-muted-foreground">@</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Chat input */}
      <div className="border border-border bg-background shadow-[0_-4px_24px_-8px_hsl(var(--foreground)/0.08)] backdrop-blur-sm">
        <div className="flex items-end gap-2 p-3">
          <button className="h-8 w-8 flex items-center justify-center border border-border hover:bg-accent/10 transition-colors shrink-0 mb-0.5">
            <Paperclip className="h-3.5 w-3.5" />
          </button>

          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything... use @ to mention tabs, skills, agents"
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground font-mono min-h-[32px] max-h-[120px] py-1.5"
          />

          <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
            <button className="h-8 flex items-center gap-1 px-2 border border-border font-mono text-[10px] tracking-wider hover:bg-accent/10 transition-colors">
              <span>GPT-4</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            <button
              className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={() => setMessage("")}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
