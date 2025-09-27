import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Toaster } from "@/components/ui/toaster";

interface LayoutProps {
  children: ReactNode;
  user?: {
    id: string;
    username: string;
    premium: boolean;
    role: 'user' | 'premium' | 'mod' | 'trainer' | 'admin';
  } | null;
  onLogout?: () => void;
}

export const Layout = ({ children, user, onLogout }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} onLogout={onLogout} />
      <main className="flex-1">
        {children}
      </main>
      <Toaster />
    </div>
  );
};