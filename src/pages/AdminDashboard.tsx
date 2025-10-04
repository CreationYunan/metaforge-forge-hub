import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Users, 
  Database, 
  Activity, 
  Settings,
  AlertTriangle,
  FileText,
  Gamepad2,
  Brain
} from "lucide-react";

export const AdminDashboard = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const adminSections = [
    {
      title: "User Management",
      icon: Users,
      description: "Manage users, roles, and permissions",
      color: "primary",
      link: "/admin/users"
    },
    {
      title: "Game Management",
      icon: Database,
      description: "Configure games, categories, and metadata",
      color: "accent",
      link: "/admin/games"
    },
    {
      title: "Game Suggestions",
      icon: Gamepad2,
      description: "Review and approve user game suggestions",
      color: "premium",
      link: "/admin/suggestions"
    },
    {
      title: "Agent Logs",
      icon: Activity,
      description: "View AI agent execution logs and performance",
      color: "premium",
      link: "/admin/logs"
    },
    {
      title: "Reports",
      icon: AlertTriangle,
      description: "Review user reports and issues",
      color: "destructive",
      link: "/admin/reports"
    },
    {
      title: "Training Agent",
      icon: Brain,
      description: "Manage AI training data and model versions",
      color: "from-purple-500 to-pink-500",
      link: "/admin/training"
    },
    {
      title: "System Settings",
      icon: Settings,
      description: "Configure system-wide settings",
      color: "muted",
      link: "/admin/settings"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-8 h-8 text-premium" />
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-primary">Admin</span> Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage all aspects of the Metaforge platform
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-gaming">
            <CardContent className="pt-6 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">1,234</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </CardContent>
          </Card>
          <Card className="card-gaming">
            <CardContent className="pt-6 text-center">
              <Database className="w-8 h-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold">5</div>
              <div className="text-sm text-muted-foreground">Active Games</div>
            </CardContent>
          </Card>
          <Card className="card-gaming">
            <CardContent className="pt-6 text-center">
              <Activity className="w-8 h-8 mx-auto mb-2 text-premium" />
              <div className="text-2xl font-bold">12,345</div>
              <div className="text-sm text-muted-foreground">Agent Runs</div>
            </CardContent>
          </Card>
          <Card className="card-gaming">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-destructive" />
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm text-muted-foreground">Pending Reports</div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section, index) => (
            <Card key={index} className="card-gaming hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg bg-${section.color}/10`}>
                    <section.icon className={`w-5 h-5 text-${section.color}`} />
                  </div>
                  <span>{section.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
                <Button variant="outline" className="w-full" asChild>
                  <a href={section.link}>
                    Manage
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity */}
        <Card className="card-gaming mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Recent System Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "New user registered", time: "2 minutes ago", status: "success" },
                { action: "Game metadata updated", time: "15 minutes ago", status: "info" },
                { action: "Report submitted", time: "1 hour ago", status: "warning" },
                { action: "Training run completed", time: "3 hours ago", status: "success" }
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                  <span className="text-sm">{activity.action}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    <Badge variant={activity.status === "success" ? "default" : "outline"}>
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
