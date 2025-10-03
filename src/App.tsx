import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import { Layout } from "./components/Layout";

// Pages
import { Home } from "./pages/Home";
import { Upload } from "./pages/Upload";
import { Forge } from "./pages/Forge";
import { Metaforge } from "./pages/Metaforge";
import { Builds } from "./pages/Builds";
import { Dashboard } from "./pages/Dashboard";
import { Demo } from "./pages/Demo";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import NotFound from "./pages/NotFound";
import { AdminDashboard } from "./pages/AdminDashboard";
import { SuggestGame } from "./pages/SuggestGame";
import { Profile } from "./pages/Profile";
import { Premium } from "./pages/Premium";
import { GameSuggestions } from "./pages/admin/GameSuggestions";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/forge" element={<Forge />} />
              <Route path="/metaforge" element={<Metaforge />} />
              <Route path="/builds" element={<Builds />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/premium" element={<Premium />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/suggestions" element={<GameSuggestions />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/suggest-game" element={<SuggestGame />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
