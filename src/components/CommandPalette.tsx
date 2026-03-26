import { useEffect, useState, useMemo } from "react";
import { commandItems } from "@/lib/mock-data";
import {
  Search,
  Brain,
  Mail,
  BarChart3,
  FolderKanban,
  Bot,
  MessageSquare,
  Globe,
  Calendar,
  CheckSquare,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Search: <Search className="h-3.5 w-3.5" />,
  Brain: <Brain className="h-3.5 w-3.5" />,
  Mail: <Mail className="h-3.5 w-3.5" />,
  BarChart3: <BarChart3 className="h-3.5 w-3.5" />,
  FolderKanban: <FolderKanban className="h-3.5 w-3.5" />,
  Bot: <Bot className="h-3.5 w-3.5" />,
  MessageSquare: <MessageSquare className="h-3.5 w-3.5" />,
  Globe: <Globe className="h-3.5 w-3.5" />,
  Calendar: <Calendar className="h-3.5 w-3.5" />,
  CheckSquare: <CheckSquare className="h-3.5 w-3.5" />,
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery("");
        setSelectedIndex(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const filtered = useMemo(() => {
    if (!query) return commandItems;
    return commandItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, typeof commandItems>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [filtered]);

  const flatFiltered = useMemo(() => Object.values(grouped).flat(), [grouped]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, flatFiltered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Action would go here
      setOpen(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

      {/* Palette */}
      <div
        className="relative mx-auto mt-[15vh] w-full max-w-[560px] border border-border bg-background shadow-[0_24px_80px_-12px_hsl(var(--foreground)/0.2)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center border-b border-border px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands, projects, agents..."
            className="flex-1 bg-transparent py-3.5 px-3 text-sm font-mono outline-none placeholder:text-muted-foreground"
          />
          <kbd className="font-mono text-[10px] tracking-wider text-muted-foreground border border-border px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="px-4 py-2 font-mono text-[9px] tracking-widest text-muted-foreground">
                {category}
              </div>
              {items.map((item) => {
                const globalIdx = flatFiltered.indexOf(item);
                return (
                  <button
                    key={item.id}
                    onClick={() => setOpen(false)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                      globalIdx === selectedIndex
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={globalIdx === selectedIndex ? "text-primary-foreground" : "text-muted-foreground"}>
                        {iconMap[item.icon] || <Search className="h-3.5 w-3.5" />}
                      </span>
                      <span className="text-xs font-mono">{item.label}</span>
                    </div>
                    {item.shortcut && (
                      <kbd
                        className={`font-mono text-[10px] px-1.5 py-0.5 ${
                          globalIdx === selectedIndex
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground border border-border"
                        }`}
                      >
                        {item.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="font-mono text-xs text-muted-foreground">NO_RESULTS</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[9px] text-muted-foreground">↑↓ NAVIGATE</span>
            <span className="font-mono text-[9px] text-muted-foreground">↵ SELECT</span>
          </div>
          <span className="font-mono text-[9px] text-muted-foreground">⌘K TO TOGGLE</span>
        </div>
      </div>
    </div>
  );
}
