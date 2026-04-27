import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getRouteMeta, initialWorkbenchTabs } from "@/lib/ubik-data";
import { ShellStateContext, type ShellPageStateMap } from "@/components/shell-state-context";
import type { DrawerSurfaceContent, RuntimeContent, WorkbenchTab } from "@/lib/ubik-types";

let tabSequence = 10;
const MAX_WORKBENCH_TABS = 8;

const KNOW_ANYTHING_DEFAULTS = {
  composer: "",
  mode: "listening",
  sources: ["org_knowledge"] as string[],
  attachments: [] as string[],
  connectorScope: null as string | null,
  references: [] as { id: string; label: string; kind: string; href?: string }[],
  scheduledPrompt: null as null | {
    title: string;
    cadence: string;
    date: string;
    time: string;
    mode: string;
  },
};

function getCanonicalPath(pathname: string) {
  if (pathname.startsWith("/inbox/")) {
    return "/inbox";
  }

  if (pathname === "/workflows") {
    return "/projects/templates";
  }

  if (pathname.startsWith("/projects/")) {
    return "/projects";
  }

  return pathname;
}

function makeTabId(routeKey: string) {
  tabSequence += 1;
  return `${routeKey}-${tabSequence}`;
}

function buildRouteTab(pathname: string): WorkbenchTab {
  const route = getRouteMeta(pathname);
  const canonicalPath = getCanonicalPath(pathname);

  return {
    id: makeTabId(route?.key ?? "tab"),
    routeKey: route?.key ?? "tab",
    title: route?.title ?? "Workspace",
    path: canonicalPath,
    pinned: canonicalPath === "/",
    closable: canonicalPath !== "/",
  };
}

function buildTemporaryKnowAnythingTab(): WorkbenchTab {
  return {
    ...buildRouteTab("/"),
    title: "Temp Chat",
    pinned: false,
    closable: true,
    temporary: true,
  };
}

function insertTabAt(tabs: WorkbenchTab[], tab: WorkbenchTab, index: number) {
  const nextTabs = [...tabs];
  nextTabs.splice(index, 0, tab);
  return nextTabs;
}

function buildTabFromRoute(pathname: string, fallbackId: string): WorkbenchTab {
  const route = getRouteMeta(pathname);
  const canonicalPath = getCanonicalPath(pathname);

  return {
    id: fallbackId,
    routeKey: route?.key ?? "tab",
    title: route?.title ?? "Workspace",
    path: canonicalPath,
    pinned: canonicalPath === "/",
    closable: canonicalPath !== "/",
  };
}

function getKnowAnythingPageState(pageState: ShellPageStateMap, tabId: string) {
  return {
    composer: (pageState[`${tabId}:chat-composer`] as string | undefined) ?? KNOW_ANYTHING_DEFAULTS.composer,
    mode: (pageState[`${tabId}:chat-mode`] as string | undefined) ?? KNOW_ANYTHING_DEFAULTS.mode,
    sources: (pageState[`${tabId}:chat-sources`] as string[] | undefined) ?? KNOW_ANYTHING_DEFAULTS.sources,
    attachments:
      (pageState[`${tabId}:chat-attachments`] as string[] | undefined) ?? KNOW_ANYTHING_DEFAULTS.attachments,
    connectorScope:
      (pageState[`${tabId}:chat-connector-scope`] as string | null | undefined) ??
      KNOW_ANYTHING_DEFAULTS.connectorScope,
    references:
      (pageState[`${tabId}:chat-context-references`] as typeof KNOW_ANYTHING_DEFAULTS.references | undefined) ??
      KNOW_ANYTHING_DEFAULTS.references,
    scheduledPrompt:
      (pageState[`${tabId}:chat-scheduled-prompt`] as typeof KNOW_ANYTHING_DEFAULTS.scheduledPrompt | undefined) ??
      KNOW_ANYTHING_DEFAULTS.scheduledPrompt,
  };
}

function isKnowAnythingTabPristine(tab: WorkbenchTab | undefined, pageState: ShellPageStateMap) {
  if (!tab || tab.path !== "/") return false;

  const chatState = getKnowAnythingPageState(pageState, tab.id);
  return (
    chatState.composer === "" &&
    chatState.mode === KNOW_ANYTHING_DEFAULTS.mode &&
    chatState.attachments.length === 0 &&
    chatState.connectorScope === null &&
    chatState.references.length === 0 &&
    chatState.scheduledPrompt === null &&
    chatState.sources.length === 1 &&
    chatState.sources[0] === "org_knowledge"
  );
}

function resetKnowAnythingPageState(pageState: ShellPageStateMap, tabId: string): ShellPageStateMap {
  return {
    ...pageState,
    [`${tabId}:chat-composer`]: KNOW_ANYTHING_DEFAULTS.composer,
    [`${tabId}:chat-mode`]: KNOW_ANYTHING_DEFAULTS.mode,
    [`${tabId}:chat-sources`]: [...KNOW_ANYTHING_DEFAULTS.sources],
    [`${tabId}:chat-attachments`]: [...KNOW_ANYTHING_DEFAULTS.attachments],
    [`${tabId}:chat-connector-scope`]: KNOW_ANYTHING_DEFAULTS.connectorScope,
    [`${tabId}:chat-context-references`]: [...KNOW_ANYTHING_DEFAULTS.references],
    [`${tabId}:chat-scheduled-prompt`]: KNOW_ANYTHING_DEFAULTS.scheduledPrompt,
  };
}

export function ShellStateProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<WorkbenchTab[]>(initialWorkbenchTabs);
  const [closedTabs, setClosedTabs] = useState<WorkbenchTab[]>([]);
  const [activeTabId, setActiveTabId] = useState(initialWorkbenchTabs[0].id);
  const [drawerContent, setDrawerContent] = useState<DrawerSurfaceContent | null>(null);
  const [runtimeContent, setRuntimeContent] = useState<RuntimeContent | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [pageState, setPageStateMap] = useState<ShellPageStateMap>({});

  const showTabLimitReached = () => {
    setDrawerContent({
      title: "Tab limit reached",
      eyebrow: "Workbench",
      description: `You can keep up to ${MAX_WORKBENCH_TABS} tabs open at once to protect the web layout.`,
      actions: ["Close a tab", "Return to Know Anything"],
    });
  };

  useEffect(() => {
    if (location.pathname === "/workflows") {
      navigate(
        {
          pathname: "/projects/templates",
          search: location.search,
        },
        { replace: true },
      );
      return;
    }

    const params = new URLSearchParams(location.search);
    const requestedTabId = params.get("tab");
    const canonicalPath = getCanonicalPath(location.pathname);
    let resolvedTab = requestedTabId
      ? tabs.find((tab) => tab.id === requestedTabId && tab.path === canonicalPath)
      : undefined;

    if (!resolvedTab) {
      resolvedTab = tabs.find((tab) => tab.path === canonicalPath);
    }

    if (!resolvedTab) {
      resolvedTab = buildRouteTab(location.pathname);
      setTabs((current) => [...current, resolvedTab as WorkbenchTab]);
    }

    if (resolvedTab.id !== requestedTabId) {
      const nextParams = new URLSearchParams(location.search);
      nextParams.set("tab", resolvedTab.id);
      navigate(
        {
          pathname: location.pathname,
          search: nextParams.toString(),
        },
        { replace: true },
      );
    }

    setActiveTabId(resolvedTab.id);
  }, [location.pathname, location.search, navigate, tabs]);

  const selectTab = (id: string) => {
    const tab = tabs.find((item) => item.id === id);
    if (!tab) return;

    navigate({
      pathname: tab.path,
      search: `tab=${tab.id}`,
    });
  };

  const createTab = (pathname: string) => {
    const route = getRouteMeta(pathname);
    const canonicalPath = getCanonicalPath(pathname);
    if (!route) return null;
    if (tabs.length >= MAX_WORKBENCH_TABS) {
      showTabLimitReached();
      return null;
    }

    const nextTab: WorkbenchTab =
      canonicalPath === "/"
        ? {
            ...buildRouteTab(pathname),
            pinned: false,
            closable: true,
          }
        : buildRouteTab(pathname);
    const activeIndex = tabs.findIndex((item) => item.id === activeTabId);
    const insertIndex = activeIndex === -1 ? tabs.length : activeIndex + 1;
    const nextTabs = insertTabAt(tabs, nextTab, insertIndex);

    setTabs(nextTabs);
    navigate({
      pathname: route.path,
      search: `tab=${nextTab.id}`,
    });
    return nextTab.id;
  };

  const openFreshKnowAnything = () => {
    const activeTab = tabs.find((item) => item.id === activeTabId);

    if (isKnowAnythingTabPristine(activeTab, pageState)) {
      setPageStateMap((current) => resetKnowAnythingPageState(current, activeTab.id));
      navigate({
        pathname: "/",
        search: `tab=${activeTab.id}`,
      });
      return activeTab.id;
    }

    const nextTabId = createTab("/");
    if (!nextTabId) return null;

    setPageStateMap((current) => resetKnowAnythingPageState(current, nextTabId));
    return nextTabId;
  };

  const openTemporaryKnowAnything = () => {
    if (tabs.length >= MAX_WORKBENCH_TABS) {
      showTabLimitReached();
      return null;
    }

    const nextTab = buildTemporaryKnowAnythingTab();
    const activeIndex = tabs.findIndex((item) => item.id === activeTabId);
    const insertIndex = activeIndex === -1 ? tabs.length : activeIndex + 1;
    const nextTabs = insertTabAt(tabs, nextTab, insertIndex);

    setTabs(nextTabs);
    setPageStateMap((current) => resetKnowAnythingPageState(current, nextTab.id));
    navigate({
      pathname: "/",
      search: `tab=${nextTab.id}`,
    });
    return nextTab.id;
  };

  const navigateCurrentTab = (pathname: string) => {
    const canonicalPath = getCanonicalPath(pathname);
    const activeTab = tabs.find((item) => item.id === activeTabId);
    const existingTab = tabs.find((item) => item.path === canonicalPath);
    const route = getRouteMeta(pathname);

    if (existingTab) {
      navigate({
        pathname: existingTab.path,
        search: `tab=${existingTab.id}`,
      });
      return;
    }

    if (!activeTab || !route) {
      navigate({ pathname });
      return;
    }

    const nextTab = {
      ...buildTabFromRoute(pathname, activeTab.id),
      pinned: activeTab.id === "chat-home" && canonicalPath === "/",
      closable: !(activeTab.id === "chat-home" && canonicalPath === "/"),
    };
    setTabs((current) => current.map((item) => (item.id === activeTab.id ? nextTab : item)));
    navigate({
      pathname: route.path,
      search: `tab=${activeTab.id}`,
    });
  };

  const closeTab = (id: string) => {
    const tab = tabs.find((item) => item.id === id);
    if (!tab || tab.closable === false) return;

    const remaining = tabs.filter((item) => item.id !== id);
    setTabs(remaining);
    setClosedTabs((current) => [tab, ...current.filter((item) => item.id !== id)].slice(0, 8));

    if (activeTabId === id) {
      const fallback = remaining[Math.max(0, tabs.findIndex((item) => item.id === id) - 1)] ?? remaining[0];
      if (fallback) {
        navigate({
          pathname: fallback.path,
          search: `tab=${fallback.id}`,
        });
      }
    }
  };

  const duplicateTab = (id: string) => {
    const source = tabs.find((item) => item.id === id);
    if (!source) return;
    if (tabs.length >= MAX_WORKBENCH_TABS) {
      showTabLimitReached();
      return;
    }

    const duplicate: WorkbenchTab = {
      ...source,
      id: makeTabId(source.routeKey),
      title: `${source.title} Copy`,
      pinned: false,
      closable: true,
    };

    const index = tabs.findIndex((item) => item.id === id);
    const nextTabs = [...tabs];
    nextTabs.splice(index + 1, 0, duplicate);
    setTabs(nextTabs);
    navigate({
      pathname: duplicate.path,
      search: `tab=${duplicate.id}`,
    });
  };

  const moveTab = (id: string, direction: "left" | "right") => {
    const index = tabs.findIndex((item) => item.id === id);
    if (index === -1) return;

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= tabs.length) return;

    const nextTabs = [...tabs];
    const [moved] = nextTabs.splice(index, 1);
    nextTabs.splice(targetIndex, 0, moved);
    setTabs(nextTabs);
  };

  const reorderTab = (id: string, targetId: string) => {
    if (id === targetId) return;

    const sourceIndex = tabs.findIndex((item) => item.id === id);
    const targetIndex = tabs.findIndex((item) => item.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const nextTabs = [...tabs];
    const [moved] = nextTabs.splice(sourceIndex, 1);
    nextTabs.splice(targetIndex, 0, moved);
    setTabs(nextTabs);
  };

  const togglePin = (id: string) => {
    setTabs((current) =>
      current.map((tab) => (tab.id === id ? { ...tab, pinned: !tab.pinned } : tab)),
    );
  };

  const reopenTab = (id: string) => {
    const closed = closedTabs.find((tab) => tab.id === id);
    if (!closed) return;

    setClosedTabs((current) => current.filter((tab) => tab.id !== id));
    setTabs((current) => [...current, closed]);
    navigate({
      pathname: closed.path,
      search: `tab=${closed.id}`,
    });
  };

  const getPageState = <T,>(key: string, fallback: T) => {
    return (pageState[key] as T | undefined) ?? fallback;
  };

  const setPageState = <T,>(key: string, value: T) => {
    setPageStateMap((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const value = {
    activeTabId,
    tabs,
    closedTabs,
    drawerContent,
    runtimeContent,
    commandPaletteOpen,
    setCommandPaletteOpen,
    selectTab,
    createTab,
    openFreshKnowAnything,
    openTemporaryKnowAnything,
    navigateCurrentTab,
    closeTab,
    duplicateTab,
    moveTab,
    reorderTab,
    togglePin,
    reopenTab,
    openDrawer: setDrawerContent,
    openRuntime: setRuntimeContent,
    getPageState,
    setPageState,
  };

  return <ShellStateContext.Provider value={value}>{children}</ShellStateContext.Provider>;
}
