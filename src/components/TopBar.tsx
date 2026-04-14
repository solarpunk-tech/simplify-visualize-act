import { useEffect, useRef, useState } from "react";

import { Check, Ghost, Globe, Link2, Lock, Mail, SquareArrowOutUpRight, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Surface } from "@/components/ubik-primitives";
import { useShellState } from "@/hooks/use-shell-state";
import { getRouteMeta, inboxThreads, settingsSections } from "@/lib/ubik-data";
import type { InboxThread, PageAction } from "@/lib/ubik-types";

const shareOptions = [
  {
    id: "private",
    title: "Only me",
    description: "Viewable by yourself only",
    icon: Lock,
    accentClass: "border-border bg-card text-foreground",
  },
  {
    id: "team",
    title: "Team access",
    description: "Everyone in Solarpunk",
    icon: "S",
    accentClass: "border-foreground bg-foreground text-background",
  },
  {
    id: "public",
    title: "Public access",
    description: "Anyone with a link can view",
    icon: Globe,
    accentClass: "border-border bg-card text-foreground",
  },
] as const;

type ShareOptionId = (typeof shareOptions)[number]["id"];

type MailProvider = "gmail" | "outlook";

function resolveMailProvider(preferredConnector: string | null) {
  if (preferredConnector === "outlook" || preferredConnector === "outlook_drive") {
    return "outlook" as const;
  }

  if (preferredConnector === "gmail") {
    return "gmail" as const;
  }

  const connectorSection = settingsSections.find((section) => section.title === "Connectors");
  const messagingValue = connectorSection?.values.find((value) => value.label === "Messaging")?.value.toLowerCase() ?? "";

  if (messagingValue.includes("outlook")) {
    return "outlook" as const;
  }

  return "gmail" as const;
}

function buildInboxSearchQuery(thread: InboxThread | null) {
  if (!thread) return "";
  return [thread.subject, thread.sender, thread.company].filter(Boolean).join(" ");
}

function buildComposeUrl(provider: MailProvider) {
  if (provider === "outlook") {
    return "https://outlook.office.com/mail/deeplink/compose";
  }

  const params = new URLSearchParams({ view: "cm", fs: "1", tf: "1" });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function buildOpenMailboxUrl(provider: MailProvider) {
  if (provider === "outlook") {
    return "https://outlook.office.com/mail/";
  }

  return "https://mail.google.com/mail/u/0/#inbox";
}

export function TopBar() {
  const location = useLocation();
  const { activeTabId, getPageState, openDrawer, openFreshKnowAnything, openTemporaryKnowAnything } = useShellState();
  const route = getRouteMeta(location.pathname);
  const shareWrapRef = useRef<HTMLDivElement | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareAccess, setShareAccess] = useState<ShareOptionId>("team");
  const preferredConnector = getPageState<string | null>(`${activeTabId}:mail-connector`, null);
  const mailProvider = resolveMailProvider(preferredConnector);
  const inboxThreadState = getPageState<InboxThread[]>(`${activeTabId}:inbox-threads`, inboxThreads);
  const selectedInboxThreadId = getPageState<string>(`${activeTabId}:inbox-thread`, inboxThreadState[0]?.id ?? "");
  const selectedInboxThread = inboxThreadState.find((thread) => thread.id === selectedInboxThreadId) ?? inboxThreadState[0] ?? null;
  const inboxActions: PageAction[] = [
    { label: "Compose", kind: "primary" },
    { label: mailProvider === "outlook" ? "Open Outlook" : "Open Gmail", kind: "secondary" },
  ];
  const actions = route?.key === "inbox" ? inboxActions : route?.actions ?? [];

  const handleAction = (label: string) => {
    if (route?.key === "chat" && label === "New Thread") {
      openFreshKnowAnything();
      return;
    }

    if (route?.key === "chat" && label === "Share") {
      setShareOpen((current) => !current);
      return;
    }

    if (route?.key === "inbox" && label === "Compose") {
      window.open(buildComposeUrl(mailProvider), "_blank", "noopener,noreferrer");
      return;
    }

    if (route?.key === "inbox" && label === "Open Outlook") {
      window.open(buildOpenMailboxUrl("outlook"), "_blank", "noopener,noreferrer");
      return;
    }

    if (route?.key === "inbox" && label === "Open Gmail") {
      window.open(buildOpenMailboxUrl("gmail"), "_blank", "noopener,noreferrer");
      return;
    }

    openDrawer({
      title: label,
      eyebrow: route?.title,
      description: `Action surface for ${label.toLowerCase()} on the ${route?.title} page.`,
      metadata: [
        { label: "Page", value: route?.title ?? "Workspace" },
        { label: "Mode", value: "Frontend seeded" },
      ],
    });
  };

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (shareWrapRef.current && !shareWrapRef.current.contains(event.target as Node)) {
        setShareOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  const copyInternalLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareOpen(false);
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="border border-border md:hidden" />
          <p className="max-w-3xl text-sm text-muted-foreground lg:text-[15px]">{route?.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="relative flex flex-wrap items-center gap-2" ref={shareWrapRef}>
            {actions.map((action) => (
              <button
                key={action.label}
                className={`inline-flex h-9 items-center justify-center border px-3.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                  action.kind === "primary"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-card text-foreground"
                }`}
                onClick={() => handleAction(action.label)}
                type="button"
              >
                {route?.key === "inbox" && action.label === "Compose" ? <Mail className="mr-1.5 h-3.5 w-3.5" /> : null}
                {route?.key === "inbox" && action.label !== "Compose" ? <SquareArrowOutUpRight className="mr-1.5 h-3.5 w-3.5" /> : null}
                {action.label}
              </button>
            ))}
            {shareOpen && route?.key === "chat" ? (
              <div className="absolute right-0 top-[calc(100%+0.75rem)] z-20 w-[min(18rem,calc(100vw-1rem))]">
                <Surface className="border-border bg-background p-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
                  <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                    <h3 className="pt-0.5 font-mono text-[13px] font-semibold uppercase tracking-[0.12em] text-foreground">
                      Share
                    </h3>
                    <button
                      className="flex h-8 w-8 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                      onClick={() => setShareOpen(false)}
                      type="button"
                      aria-label="Close share"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 py-3">
                    {shareOptions.map((option) => {
                      const selected = shareAccess === option.id;

                      return (
                        <button
                          key={option.id}
                          className={`flex w-full items-center gap-2.5 border px-2.5 py-2.5 text-left transition-colors ${
                            selected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-background hover:bg-card"
                          }`}
                          onClick={() => setShareAccess(option.id)}
                          type="button"
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-[13px] font-semibold ${
                              selected
                                ? "border-background/20 bg-background/10 text-background"
                                : option.accentClass
                            }`}
                          >
                            {typeof option.icon === "string" ? (
                              <span className="leading-none">{option.icon}</span>
                            ) : (
                              <option.icon className="h-4 w-4" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block font-mono text-[9px] uppercase tracking-[0.14em] ${
                                selected ? "text-background" : "text-foreground"
                              }`}
                            >
                              {option.title}
                            </span>
                            <span
                              className={`mt-0.5 block text-[11px] leading-snug ${
                                selected ? "text-background/80" : "text-muted-foreground"
                              }`}
                            >
                              {option.description}
                            </span>
                          </span>
                          <span className="flex w-6 justify-center">
                            {selected ? <Check className="h-4 w-4 text-background" /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    className="mt-1 flex h-10 w-full items-center justify-center gap-2 border border-foreground bg-foreground px-3 font-mono text-[10px] uppercase tracking-[0.14em] text-background transition-opacity hover:opacity-90"
                    type="button"
                    onClick={copyInternalLink}
                  >
                    <Link2 className="h-4 w-4" />
                    Copy link
                  </button>
                </Surface>
              </div>
            ) : null}
          </div>
          {route?.key === "chat" ? (
            <button
              className="flex h-9 w-9 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
              onClick={() => openTemporaryKnowAnything()}
              aria-label="Open temporary chat"
              type="button"
            >
              <Ghost className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
