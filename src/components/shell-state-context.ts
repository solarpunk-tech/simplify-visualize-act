import { createContext } from "react";

import type { DrawerSurfaceContent, RuntimeContent, WorkbenchTab } from "@/lib/ubik-types";

type PageStateMap = Record<string, unknown>;

export type ShellStateContextValue = {
  activeTabId: string;
  tabs: WorkbenchTab[];
  closedTabs: WorkbenchTab[];
  drawerContent: DrawerSurfaceContent | null;
  runtimeContent: RuntimeContent | null;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  selectTab: (id: string) => void;
  createTab: (pathname: string) => string | null;
  openFreshKnowAnything: () => string | null;
  openTemporaryKnowAnything: () => string | null;
  navigateCurrentTab: (pathname: string) => void;
  closeTab: (id: string) => void;
  duplicateTab: (id: string) => void;
  moveTab: (id: string, direction: "left" | "right") => void;
  reorderTab: (id: string, targetId: string) => void;
  togglePin: (id: string) => void;
  reopenTab: (id: string) => void;
  openDrawer: (content: DrawerSurfaceContent | null) => void;
  openRuntime: (content: RuntimeContent | null) => void;
  getPageState: <T>(key: string, fallback: T) => T;
  setPageState: <T>(key: string, value: T) => void;
};

export type ShellPageStateMap = PageStateMap;

export const ShellStateContext = createContext<ShellStateContextValue | null>(null);
