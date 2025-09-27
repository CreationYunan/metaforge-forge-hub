import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  User,
  Upload,
  Shield,
  Sword,
  Zap,
  TrendingUp,
  Star,
  Calendar,
  Trophy,
  Activity,
  Plus,
  Eye,
  Settings,
  Bell
} from "lucide-react";

// Mock user data
const mockUser = {
  username: "GameMaster2024",
  email: "gamer@example.com",
  premium: false,
  role: "user" as const,
  joinDate: new Date("2024-01-01"),
  stats: {
    itemsUploaded: 47,
    buildsCreated: 12,
    metaforgeRuns: 8,
    forgeBuilds: 4
  }
};

const mockRecentActivity = [
  {
    id: "1",
    type: "upload",
    description: "Analyzed 3 new items in Diablo 4",
    timestamp: new Date("2024-01-15T10:30:00"),
    confidence: 0.92
  },
  {
    id: "2", 
    type: "metaforge",
    description: "Generated optimized DPS build",
    timestamp: new Date("2024-01-14T15:45:00"),
    score: 0.94
  },
  {
    id: "3",
    type: "build",
    description: "Created 'Tank Fortress' build",
    timestamp: new Date("2024-01-13T09:20:00")
  },
  {
    id: "4",
    type: "forge",
    description: "Modified 'Speed Runner Elite' build",
    timestamp: new Date("2024-01-12T14:10:00")
  }
];

const mockQuickActions = [
  {
    title: "Upload Items",
    description: "Analyze new game screenshots",
    icon: Upload,
    href: "/upload",
    color: "accent"
  },
  {
    title: "Create Build", 
    description: "Start building with Forge",
    icon: Shield,
    href: "/forge",
    color: "primary"
  },
  {
    title: "Run Metaforge",
    description: "AI-optimize your builds",
    icon: Sword,
    href: "/metaforge", 
    color: "premium"
  },
  {
    title: "View Builds",
    description: "Manage your collection",
    icon: Eye,
    href: "/builds",
    color: "success"
  }
];

export const Dashboard = () => {
  const [user] = useState(mockUser);
  const [recentActivity] = useState(mockRecentActivity);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload': return Upload;
      case 'metaforge': return Sword;
      case 'build': return Shield;
      case 'forge': return Settings;
      default: return Activity;
    }
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      accent: "from-accent to-accent-dark",
      primary: "from-primary to-primary-dark", 
      premium: "from-premium to-premium-dark",
      success: "from-success to-success/80"
    };
    return colors[color] || "from-muted to-muted-foreground";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, <span className="text-gradient-primary">{user.username}</span>
              </h1>
              <p className="text-muted-foreground">
                Here's your gaming performance overview
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {!user.premium && (
                <Button variant="premium" asChild>
                  <a href="/premium">
                    <Star className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="card-gaming text-center">
                <CardContent className="pt-6">
                  <div className="p-3 rounded-full bg-gradient-to-br from-accent to-accent-dark w-fit mx-auto mb-3">
                    <Upload className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-accent mb-1">{user.stats.itemsUploaded}</div>
                  <div className="text-xs text-muted-foreground">Items Analyzed</div>
                </CardContent>
              </Card>

              <Card className="card-gaming text-center">
                <CardContent className="pt-6">
                  <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary-dark w-fit mx-auto mb-3">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-primary mb-1">{user.stats.buildsCreated}</div>
                  <div className="text-xs text-muted-foreground">Builds Created</div>
                </CardContent>
              </Card>

              <Card className="card-gaming text-center">
                <CardContent className="pt-6">
                  <div className="p-3 rounded-full bg-gradient-to-br from-premium to-premium-dark w-fit mx-auto mb-3">
                    <Sword className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-premium mb-1">{user.stats.metaforgeRuns}</div>
                  <div className="text-xs text-muted-foreground">Metaforge Runs</div>
                </CardContent>
              </Card>

              <Card className="card-gaming text-center">
                <CardContent className="pt-6">
                  <div className="p-3 rounded-full bg-gradient-to-br from-success to-success/80 w-fit mx-auto mb-3">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-success mb-1">{user.stats.forgeBuilds}</div>
                  <div className="text-xs text-muted-foreground">Forge Builds</div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {mockQuickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="h-auto p-4 flex-col space-y-2 text-center"
                      asChild
                    >
                      <a href={action.href}>
                        <div className={`p-3 rounded-full bg-gradient-to-br ${getColorClass(action.color)} mb-2`}>
                          <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{action.title}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-center space-x-4 p-3 bg-background-secondary rounded-lg">
                        <div className="p-2 rounded-lg bg-muted">
                          <ActivityIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{activity.description}</div>
                          <div className="text-xs text-muted-foreground flex items-center space-x-2">
                            <Calendar className="w-3 h-3" />
                            <span>{activity.timestamp.toLocaleDateString()}</span>
                            <span>{activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        {activity.confidence && (
                          <Badge className="confidence-high">
                            {(activity.confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                        {activity.score && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-current text-premium" />
                            <span className="text-sm font-medium">{(activity.score * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary-dark mx-auto mb-3 flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-semibold">{user.username}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    <Badge variant={user.premium ? "default" : "outline"}>
                      {user.premium ? "Premium" : "Free"}
                    </Badge>
                    <Badge variant="outline">{user.role}</Badge>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span>{user.joinDate.getFullYear()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total uploads</span>
                    <span className="font-medium">{user.stats.itemsUploaded}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Builds created</span>
                    <span className="font-medium">{user.stats.buildsCreated}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Progress (Free Users) */}
            {!user.premium && (
              <Card className="card-gaming">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span>Usage This Hour</span>
                    <Bell className="w-4 h-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Uploads</span>
                        <span>3/20</span>
                      </div>
                      <Progress value={15} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Metaforge</span>
                        <span>1/2</span>
                      </div>
                      <Progress value={50} className="h-2" />
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-3">
                        Upgrade to Premium for unlimited usage
                      </p>
                      <Button variant="premium" size="sm" className="w-full">
                        <Star className="w-4 h-4 mr-2" />
                        Upgrade Now
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Game Suggestion */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="text-sm">Suggest a Game</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Want to see your favorite game on Metaforge? Let us know!
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Suggest Game
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};