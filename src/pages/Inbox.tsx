import { useState } from "react";
import { inboxThreads, inboxStats } from "@/lib/mock-data";
import {
  AlertTriangle,
  Mail,
  Bot,
  ChevronRight,
  Reply,
  Forward,
  Eye,
  Zap,
} from "lucide-react";

type Filter = "ALL" | "CRITICAL" | "UNREAD" | "AGENT_READY";

export default function Inbox() {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [expandedThread, setExpandedThread] = useState<number | null>(null);

  const filtered = inboxThreads.filter((t) => {
    if (filter === "CRITICAL") return t.priority === "critical";
    if (filter === "UNREAD") return t.unread;
    if (filter === "AGENT_READY") return t.agentSuggestion !== null;
    return true;
  });

  return (
    <div className="h-full flex">
      {/* Main inbox */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <h1 className="font-mono text-2xl font-bold tracking-tight mb-1">
            MY INBOX<span className="text-primary">.</span>
          </h1>
          <p className="text-xs text-muted-foreground mb-6">
            Thread intelligence — AI-triaged, action-ready
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-1.5 border border-primary px-3 py-1.5">
              <AlertTriangle className="h-3 w-3 text-primary" />
              <span className="font-mono text-[10px] tracking-wider font-semibold text-primary">
                {inboxStats.critical} CRITICAL
              </span>
            </div>
            <div className="flex items-center gap-1.5 border border-border px-3 py-1.5">
              <Mail className="h-3 w-3" />
              <span className="font-mono text-[10px] tracking-wider">
                {inboxStats.unread} UNREAD
              </span>
            </div>
            <div className="flex items-center gap-1.5 border border-border px-3 py-1.5">
              <Zap className="h-3 w-3" />
              <span className="font-mono text-[10px] tracking-wider">
                {inboxStats.actionRequired} ACTION
              </span>
            </div>
            <div className="flex items-center gap-1.5 border border-border px-3 py-1.5">
              <Bot className="h-3 w-3" />
              <span className="font-mono text-[10px] tracking-wider">
                {inboxStats.agentProcessed} AI_READY
              </span>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-0 border-b border-border mb-4">
            {(["ALL", "CRITICAL", "UNREAD", "AGENT_READY"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-mono text-[10px] tracking-widest px-4 py-2.5 border-b-2 transition-colors ${
                  filter === f
                    ? "border-primary text-primary"
                    : "border-transparent hover:text-foreground/70"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Thread list */}
          <div className="space-y-1">
            {filtered.map((thread) => (
              <div key={thread.id}>
                <button
                  onClick={() =>
                    setExpandedThread(expandedThread === thread.id ? null : thread.id)
                  }
                  className={`w-full text-left p-4 border transition-colors ${
                    thread.priority === "critical"
                      ? "border-l-2 border-l-primary border-t border-r border-b border-border"
                      : "border-border"
                  } ${thread.unread ? "bg-accent/5" : ""} ${
                    expandedThread === thread.id ? "border-foreground/20" : "hover:border-foreground/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs ${thread.unread ? "font-bold" : "font-medium"}`}>
                          {thread.from}
                        </span>
                        {thread.priority === "critical" && (
                          <span className="font-mono text-[8px] tracking-wider text-primary border border-primary px-1 py-0.5">
                            CRITICAL
                          </span>
                        )}
                        {thread.agentSuggestion && (
                          <Bot className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <p className={`text-xs truncate ${thread.unread ? "font-semibold" : ""}`}>
                        {thread.subject}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                        {thread.summary}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2">
                        {thread.labels.map((label) => (
                          <span
                            key={label}
                            className="font-mono text-[8px] tracking-wider border border-border px-1.5 py-0.5"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {thread.time}
                      </span>
                      <ChevronRight
                        className={`h-3.5 w-3.5 transition-transform ${
                          expandedThread === thread.id ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded view */}
                {expandedThread === thread.id && (
                  <div className="border border-t-0 border-border p-4 bg-accent/5">
                    <p className="text-xs mb-4">{thread.summary}</p>

                    {thread.agentSuggestion && (
                      <div className="border border-primary/30 p-3 mb-4 bg-primary/5">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Bot className="h-3 w-3 text-primary" />
                          <span className="font-mono text-[9px] tracking-widest text-primary font-semibold">
                            AGENT_SUGGESTION
                          </span>
                        </div>
                        <p className="text-[11px]">{thread.agentSuggestion}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <button className="h-7 px-3 bg-primary text-primary-foreground font-mono text-[10px] tracking-wider hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                        <Reply className="h-3 w-3" />
                        REPLY
                      </button>
                      <button className="h-7 px-3 border border-border font-mono text-[10px] tracking-wider hover:border-foreground/30 transition-colors flex items-center gap-1.5">
                        <Forward className="h-3 w-3" />
                        DELEGATE
                      </button>
                      <button className="h-7 px-3 border border-border font-mono text-[10px] tracking-wider hover:border-foreground/30 transition-colors flex items-center gap-1.5">
                        <Eye className="h-3 w-3" />
                        VIEW_FULL
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
