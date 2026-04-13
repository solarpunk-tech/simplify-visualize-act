import { AppSidebar } from "./AppSidebar";
import { CommandPalette } from "./CommandPalette";
import { RightDrawer, RuntimePanel } from "./ShellPanels";
import { TopBar } from "./TopBar";
import { WorkbenchTabs } from "./WorkbenchTabs";
import { ShellStateProvider } from "./shell-state";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <SidebarProvider
      defaultOpen
      style={
        {
          "--sidebar-width": "18rem",
          "--sidebar-width-icon": "5.75rem",
        } as React.CSSProperties
      }
    >
      <ShellStateProvider>
        <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
          <AppSidebar />
          <SidebarInset className="min-h-0 min-w-0 border-l border-border">
            <WorkbenchTabs />
            <TopBar />
            <CommandPalette />
            <div className="flex min-h-0 flex-1 overflow-hidden">
              <main className="min-h-0 min-w-0 flex-1 overflow-auto">{children}</main>
              <RightDrawer />
              <RuntimePanel />
            </div>
          </SidebarInset>
        </div>
      </ShellStateProvider>
    </SidebarProvider>
  );
}
