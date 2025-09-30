import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "./Navigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (!loading && user) {
      const currentPath = window.location.pathname;
      if (currentPath === '/login' || currentPath === '/register') {
        if (profile?.role === 'admin' || profile?.role === 'mod' || profile?.role === 'trainer') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [user, profile, loading, navigate]);

  const navigationUser = user && profile ? {
    id: user.id,
    username: profile.username || 'User',
    premium: profile.premium || false,
    role: profile.role || 'user'
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={navigationUser} onLogout={handleLogout} />
      <main>{children}</main>
    </div>
  );
};
