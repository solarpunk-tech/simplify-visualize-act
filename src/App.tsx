import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/Shell";
import { MarketingLayout } from "@/components/marketing/MarketingLayout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Agents from "./pages/Agents";
import Approvals from "./pages/Approvals";
import Archive from "./pages/Archive";
import Help from "./pages/Help";
import Inbox from "./pages/Inbox";
import Intelligence from "./pages/Intelligence";
import Meetings from "./pages/Meetings";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Workflows from "./pages/Workflows";
import SiteHome from "./pages/SiteHome";
import SiteFeatures from "./pages/SiteFeatures";
import SitePricing from "./pages/SitePricing";
import SiteContact from "./pages/SiteContact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppShellLayout = () => (
  <Shell>
    <Outlet />
  </Shell>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="ubik-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
            <Routes>
              <Route path="/site" element={<MarketingLayout />}>
                <Route index element={<SiteHome />} />
                <Route path="features" element={<SiteFeatures />} />
                <Route path="pricing" element={<SitePricing />} />
                <Route path="contact" element={<SiteContact />} />
              </Route>

              <Route element={<AppShellLayout />}>
                <Route path="/" element={<Navigate to="/site" replace />} />
                <Route path="/chat" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/approvals" element={<Approvals />} />
                <Route path="/archive" element={<Archive />} />
                <Route path="/help" element={<Help />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/inbox/:threadId" element={<Inbox />} />
                <Route path="/intelligence" element={<Intelligence />} />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/meetings/:meetingId" element={<Meetings />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/workflows" element={<Workflows />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
