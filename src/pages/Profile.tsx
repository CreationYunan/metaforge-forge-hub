import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, Loader2, Calendar } from "lucide-react";

export const Profile = () => {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [daysUntilChange, setDaysUntilChange] = useState(0);

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || "");
      
      // Check if username can be changed (30 days limit)
      if (profile.username_changed_at) {
        const lastChanged = new Date(profile.username_changed_at);
        const now = new Date();
        const daysSinceChange = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceChange < 30) {
          setCanChangeUsername(false);
          setDaysUntilChange(30 - daysSinceChange);
        }
      }
    }
    
    if (user?.email) {
      setEmail(user.email);
    }
  }, [profile, user]);

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canChangeUsername) {
      toast({
        title: "Username change not allowed",
        description: `You can change your username again in ${daysUntilChange} days`,
        variant: "destructive"
      });
      return;
    }

    if (!username.trim() || username.length < 3) {
      toast({
        title: "Invalid username",
        description: "Username must be at least 3 characters",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingUsername(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim(),
          username_changed_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Username updated",
        description: "You can change it again in 30 days"
      });

      setCanChangeUsername(false);
      setDaysUntilChange(30);
    } catch (error) {
      console.error("Error updating username:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingEmail(true);

    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });

      if (error) throw error;

      toast({
        title: "Email update initiated",
        description: "Please check your new email for confirmation"
      });
    } catch (error) {
      console.error("Error updating email:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been changed successfully"
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <User className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-primary">Profile</span> Settings
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Username Section */}
          <Card className="card-gaming">
            <CardHeader>
              <CardTitle>Username</CardTitle>
              <CardDescription>
                Change your username (can be changed once every 30 days)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUsernameUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={!canChangeUsername}
                    maxLength={50}
                  />
                  {!canChangeUsername && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Available in {daysUntilChange} days</span>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={!canChangeUsername || isUpdatingUsername}
                >
                  {isUpdatingUsername ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Username"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Email Section */}
          <Card className="card-gaming">
            <CardHeader>
              <CardTitle>Email</CardTitle>
              <CardDescription>
                Update your email address (requires confirmation)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isUpdatingEmail}
                >
                  {isUpdatingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Email"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Password Section */}
          <Card className="card-gaming">
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>
                Change your password (minimum 6 characters)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
};
