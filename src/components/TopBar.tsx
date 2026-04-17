import { useState } from "react";

import { CheckIcon, EnvelopeSimpleIcon, GhostIcon, GlobeHemisphereWestIcon, LinkIcon, LockKeyIcon, SignOutIcon } from "@phosphor-icons/react";
import { useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useShellState } from "@/hooks/use-shell-state";
import { getRouteMeta, inboxThreads, settingsSections } from "@/lib/ubik-data";
import type { InboxThread, PageAction } from "@/lib/ubik-types";

const shareOptions = [
  {
    id: "private",
    title: "Only me",
    description: "Viewable by yourself only",
    icon: LockKeyIcon,
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
    icon: GlobeHemisphereWestIcon,
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
  const { state } = useSidebar();
  const location = useLocation();
  const { activeTabId, getPageState, openDrawer, openFreshKnowAnything, openTemporaryKnowAnything } = useShellState();
  const route = getRouteMeta(location.pathname);
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

  const copyInternalLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setShareOpen(false);
  };

  return (
    <header className="border-b border-border/70 bg-background/95 px-4 py-3 lg:px-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card/90 px-3 py-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <SidebarTrigger className={`${state === "collapsed" ? "inline-flex" : "md:hidden"} border border-border`} />
          <div className="min-w-0">
            <p className="section-label text-foreground">{route?.title ?? "Workspace"}</p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {route?.description ?? "Operator surface"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div className="relative flex flex-wrap items-center gap-2">
            {actions.map((action) => (
              route?.key === "chat" && action.label === "Share" ? (
                <Popover key={action.label} open={shareOpen} onOpenChange={setShareOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={action.kind === "primary" ? "default" : "outline"}
                      size="sm"
                      className="text-xs font-medium shadow-none"
                      type="button"
                    >
                      {action.label}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-[18rem] gap-3 p-3">
                    <PopoverHeader>
                      <h3 className="font-heading font-medium">Share</h3>
                      <PopoverDescription>Choose who can access this thread.</PopoverDescription>
                    </PopoverHeader>

                    <div className="flex flex-col gap-2">
                      {shareOptions.map((option) => {
                        const selected = shareAccess === option.id;

                        return (
                          <Button
                            key={option.id}
                            variant={selected ? "default" : "outline"}
                            className="h-auto w-full justify-start px-3 py-3 text-left"
                            onClick={() => setShareAccess(option.id)}
                            type="button"
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center border font-mono text-[13px] font-semibold ${
                                selected
                                  ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
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
                              <span className={`block text-sm font-medium ${selected ? "text-primary-foreground" : "text-foreground"}`}>
                                {option.title}
                              </span>
                              <span
                                className={`mt-0.5 block text-[11px] leading-snug ${
                                  selected ? "text-primary-foreground/80" : "text-muted-foreground"
                                }`}
                              >
                                {option.description}
                              </span>
                            </span>
                            <span className="flex w-6 justify-center">
                              {selected ? <CheckIcon className="h-4 w-4 text-primary-foreground" /> : null}
                            </span>
                          </Button>
                        );
                      })}
                    </div>

                    <Button className="w-full" type="button" onClick={copyInternalLink}>
                      <LinkIcon data-icon="inline-start" />
                      Copy link
                    </Button>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button
                  key={action.label}
                  variant={action.kind === "primary" ? "default" : "outline"}
                  size="sm"
                  className="text-xs font-medium shadow-none"
                  onClick={() => handleAction(action.label)}
                  type="button"
                >
                  {route?.key === "inbox" && action.label === "Compose" ? <EnvelopeSimpleIcon data-icon="inline-start" /> : null}
                  {route?.key === "inbox" && action.label !== "Compose" ? <SignOutIcon data-icon="inline-start" /> : null}
                  {action.label}
                </Button>
              )
            ))}
          </div>
          {route?.key === "chat" ? (
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => openTemporaryKnowAnything()}
              aria-label="Open temporary chat"
              type="button"
            >
              <GhostIcon />
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
