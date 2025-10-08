import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
import TrainingAgent from "./pages/admin/TrainingAgent";
import Users from "./pages/admin/Users";
import Games from "./pages/admin/Games";
import AgentLogs from "./pages/admin/AgentLogs";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";

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
              <Route path="/premium" element={<Premium />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/demo" element={<Demo />} />
              
              {/* Protected Routes */}
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/forge" element={<ProtectedRoute><Forge /></ProtectedRoute>} />
              <Route path="/metaforge" element={<ProtectedRoute><Metaforge /></ProtectedRoute>} />
              <Route path="/builds" element={<ProtectedRoute><Builds /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/suggest-game" element={<ProtectedRoute><SuggestGame /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
              <Route path="/admin/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
              <Route path="/admin/suggestions" element={<ProtectedRoute><GameSuggestions /></ProtectedRoute>} />
              <Route path="/admin/logs" element={<ProtectedRoute><AgentLogs /></ProtectedRoute>} />
              <Route path="/admin/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
              <Route path="/admin/training" element={<ProtectedRoute><TrainingAgent /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              
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
