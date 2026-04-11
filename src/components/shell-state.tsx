import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getRouteMeta, initialWorkbenchTabs } from "@/lib/ubik-data";
import { ShellStateContext, type ShellPageStateMap } from "@/components/shell-state-context";
import type { DrawerContent, RuntimeContent, WorkbenchTab } from "@/lib/ubik-types";

let tabSequence = 10;

function makeTabId(routeKey: string) {
  tabSequence += 1;
  return `${routeKey}-${tabSequence}`;
}

function buildRouteTab(pathname: string): WorkbenchTab {
  const route = getRouteMeta(pathname);

  return {
    id: makeTabId(route?.key ?? "tab"),
    routeKey: route?.key ?? "tab",
    title: route?.title ?? "Workspace",
    path: pathname,
    pinned: pathname === "/",
    closable: pathname !== "/",
  };
}

function insertTabAt(tabs: WorkbenchTab[], tab: WorkbenchTab, index: number) {
  const nextTabs = [...tabs];
  nextTabs.splice(index, 0, tab);
  return nextTabs;
}

function buildTabFromRoute(pathname: string, fallbackId: string): WorkbenchTab {
  const route = getRouteMeta(pathname);

  return {
    id: fallbackId,
    routeKey: route?.key ?? "tab",
    title: route?.title ?? "Workspace",
    path: pathname,
    pinned: pathname === "/",
    closable: pathname !== "/",
  };
}

export function ShellStateProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState<WorkbenchTab[]>(initialWorkbenchTabs);
  const [closedTabs, setClosedTabs] = useState<WorkbenchTab[]>([]);
  const [activeTabId, setActiveTabId] = useState(initialWorkbenchTabs[0].id);
  const [drawerContent, setDrawerContent] = useState<DrawerContent | null>(null);
  const [runtimeContent, setRuntimeContent] = useState<RuntimeContent | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [pageState, setPageStateMap] = useState<ShellPageStateMap>({});

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedTabId = params.get("tab");
    let resolvedTab = requestedTabId
      ? tabs.find((tab) => tab.id === requestedTabId && tab.path === location.pathname)
      : undefined;

    if (!resolvedTab) {
      resolvedTab = tabs.find((tab) => tab.path === location.pathname);
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
    if (!route) return null;

    const nextTab: WorkbenchTab =
      pathname === "/"
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

  const navigateCurrentTab = (pathname: string) => {
    const activeTab = tabs.find((item) => item.id === activeTabId);
    const existingTab = tabs.find((item) => item.path === pathname);
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
      pinned: activeTab.id === "chat-home" && pathname === "/",
      closable: !(activeTab.id === "chat-home" && pathname === "/"),
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
