import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

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
import NotFound from "./pages/NotFound";
import { AdminDashboard } from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Mock user - in real app this would come from auth context
const mockUser = {
  id: "user-1",
  username: "GameMaster2024", 
  premium: false,
  role: "user" as const
};

const App = () => {
  const [user, setUser] = useState<typeof mockUser | null>(mockUser);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout user={user} onLogout={handleLogout}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/forge" element={<Forge />} />
              <Route path="/metaforge" element={<Metaforge />} />
              <Route path="/builds" element={<Builds />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/premium" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold">Premium Features Coming Soon</h1></div>} />
              <Route path="/login" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold">Login Page Coming Soon</h1></div>} />
              <Route path="/register" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold">Register Page Coming Soon</h1></div>} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<div className="container mx-auto px-4 py-16 text-center"><h1 className="text-3xl font-bold">Profile Page Coming Soon</h1></div>} />
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
