import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Shell } from "@/components/Shell";
import Index from "./pages/Index";
import Agents from "./pages/Agents";
import Inbox from "./pages/Inbox";
import Projects from "./pages/Projects";
import Placeholder from "./pages/Placeholder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/meetings" element={<Placeholder />} />
            <Route path="/settings" element={<Placeholder />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Shell>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
