import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, UserCog, Shield, Crown, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserProfile = {
  id: string;
  username: string;
  role: string;
  premium: boolean;
  created_at: string;
  email?: string;
  last_sign_in_at?: string;
};

export default function Users() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [premiumFilter, setPremiumFilter] = useState<string>("all");

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [savingRole, setSavingRole] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, premiumFilter]);

  const fetchUsers = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, role, premium, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch emails from auth.users via admin function
      const usersWithEmails = await Promise.all(
        (data || []).map(async (profile) => {
          try {
            const { data: authData } = await supabase.auth.admin.getUserById(profile.id);
            return {
              ...profile,
              email: authData?.user?.email,
              last_sign_in_at: authData?.user?.last_sign_in_at
            };
          } catch {
            return { ...profile, email: undefined, last_sign_in_at: undefined };
          }
        })
      );

      setUsers(usersWithEmails);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(u => u.role === roleFilter);
    }

    if (premiumFilter !== "all") {
      const isPremium = premiumFilter === "premium";
      filtered = filtered.filter(u => u.premium === isPremium);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async () => {
    if (!editingUser || !newRole) return;

    setSavingRole(true);
    try {
      const oldRole = editingUser.role;
      
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', editingUser.id);

      if (error) throw error;

      // Audit log
      await supabase.functions.invoke('audit-agent', {
        body: {
          entity_type: 'profile',
          entity_id: editingUser.id,
          action: 'set_role',
          summary: `Role changed from ${oldRole} to ${newRole}`,
          details: { old_role: oldRole, new_role: newRole }
        }
      });

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`
      });

      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    } finally {
      setSavingRole(false);
    }
  };

  const handlePremiumToggle = async (userId: string, currentPremium: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ premium: !currentPremium })
        .eq('id', userId);

      if (error) throw error;

      // Audit log
      await supabase.functions.invoke('audit-agent', {
        body: {
          entity_type: 'profile',
          entity_id: userId,
          action: 'set_premium',
          summary: `Premium ${!currentPremium ? 'enabled' : 'disabled'}`,
          details: { value: !currentPremium }
        }
      });

      toast({
        title: "Success",
        description: `Premium ${!currentPremium ? 'enabled' : 'disabled'}`
      });

      fetchUsers();
    } catch (error) {
      console.error('Error updating premium:', error);
      toast({
        title: "Error",
        description: "Failed to update premium status",
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { variant: any; icon: any }> = {
      admin: { variant: "destructive", icon: Shield },
      trainer: { variant: "default", icon: UserCog },
      mod: { variant: "secondary", icon: UserCog },
      user: { variant: "outline", icon: User }
    };
    const config = variants[role] || variants.user;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">User Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Back to Admin
        </Button>
      </div>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
          <CardDescription>Filter and search through users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="trainer">Trainer</SelectItem>
                <SelectItem value="mod">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Select value={premiumFilter} onValueChange={setPremiumFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by premium" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="free">Free</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">{user.username}</p>
                    {getRoleBadge(user.role)}
                    {user.premium && (
                      <Badge variant="default" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{user.email || 'No email'}</p>
                  <p className="text-xs text-muted-foreground">
                    Joined: {new Date(user.created_at).toLocaleDateString()}
                    {user.last_sign_in_at && ` • Last login: ${new Date(user.last_sign_in_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(user);
                      setNewRole(user.role);
                    }}
                  >
                    Change Role
                  </Button>
                  <Button
                    size="sm"
                    variant={user.premium ? "secondary" : "default"}
                    onClick={() => handlePremiumToggle(user.id, user.premium)}
                  >
                    {user.premium ? 'Remove Premium' : 'Grant Premium'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {editingUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="trainer">Trainer</SelectItem>
                <SelectItem value="mod">Moderator</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={savingRole}>
              Cancel
            </Button>
            <Button onClick={handleRoleChange} disabled={savingRole || newRole === editingUser?.role}>
              {savingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
