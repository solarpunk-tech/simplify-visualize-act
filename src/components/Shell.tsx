import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { FloatingChat } from "./FloatingChat";
import { CommandPalette } from "./CommandPalette";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar />
          <main className="flex-1 overflow-auto pb-28">
            {children}
          </main>
          <FloatingChat />
        </div>
      </div>
      <CommandPalette />
    </SidebarProvider>
  );
}
