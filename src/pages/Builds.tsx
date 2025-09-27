import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield,
  Search,
  Filter,
  Download,
  Share,
  Edit3,
  Trash2,
  Eye,
  Calendar,
  Star,
  Target,
  TrendingUp,
  Hammer,
  Sword
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Build {
  id: string;
  name: string;
  game: string;
  type: 'forge' | 'metaforge';
  context: 'pve' | 'pvp' | 'hybrid';
  created: Date;
  version: number;
  items: Array<{
    slot: string;
    name: string;
    rarity: string;
  }>;
  totalStats: Record<string, number>;
  score?: number;
}

// Mock builds data
const mockBuilds: Build[] = [
  {
    id: "build-1",
    name: "Ultimate DPS Destroyer",
    game: "Diablo 4",
    type: "metaforge",
    context: "pve",
    created: new Date("2024-01-15"),
    version: 3,
    items: [
      { slot: "Weapon", name: "Legendary Blade of Destruction", rarity: "Legendary" },
      { slot: "Helmet", name: "Epic Crown of Power", rarity: "Epic" },
      { slot: "Chest", name: "Mythic Armor of Domination", rarity: "Mythic" }
    ],
    totalStats: { "Attack Power": 1250, "Crit Chance": 35, "Crit Damage": 180 },
    score: 0.94
  },
  {
    id: "build-2", 
    name: "Tank Fortress",
    game: "Diablo 4",
    type: "forge",
    context: "pvp",
    created: new Date("2024-01-10"),
    version: 1,
    items: [
      { slot: "Helmet", name: "Legendary Helm of Protection", rarity: "Legendary" },
      { slot: "Chest", name: "Epic Platemail of Fortitude", rarity: "Epic" },
      { slot: "Shield", name: "Rare Shield of Blocking", rarity: "Rare" }
    ],
    totalStats: { "Defense": 980, "HP": 2500, "Block Chance": 45 },
    score: 0.87
  },
  {
    id: "build-3",
    name: "Speed Runner Elite",
    game: "RAID: Shadow Legends",
    type: "metaforge", 
    context: "pve",
    created: new Date("2024-01-05"),
    version: 2,
    items: [
      { slot: "Boots", name: "Swift Runners of Wind", rarity: "Epic" },
      { slot: "Weapon", name: "Blade of Velocity", rarity: "Legendary" },
      { slot: "Ring", name: "Ring of Haste", rarity: "Rare" }
    ],
    totalStats: { "Speed": 85, "Attack Power": 650, "Crit Chance": 28 },
    score: 0.91
  }
];

export const Builds = () => {
  const [builds] = useState<Build[]>(mockBuilds);
  const [searchTerm, setSearchTerm] = useState("");
  const [gameFilter, setGameFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedBuilds, setSelectedBuilds] = useState<string[]>([]);
  const { toast } = useToast();

  const filteredBuilds = builds.filter(build => {
    const matchesSearch = build.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGame = gameFilter === "all" || build.game === gameFilter;
    const matchesType = typeFilter === "all" || build.type === typeFilter;
    return matchesSearch && matchesGame && matchesType;
  });

  const toggleBuildSelection = (buildId: string) => {
    setSelectedBuilds(prev => 
      prev.includes(buildId) 
        ? prev.filter(id => id !== buildId)
        : prev.length < 2 
          ? [...prev, buildId] 
          : [prev[1], buildId]
    );
  };

  const exportBuild = (build: Build, format: 'json' | 'image') => {
    toast({
      title: `Exporting ${build.name}`,
      description: `Preparing ${format.toUpperCase()} export...`,
    });
  };

  const deleteBuild = (buildId: string) => {
    toast({
      title: "Build deleted",
      description: "Build has been removed from your collection",
      variant: "destructive"
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'mythic': return 'text-purple-400';
      case 'legendary': return 'text-premium';
      case 'epic': return 'text-primary';
      case 'rare': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'metaforge' ? Sword : Hammer;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-success to-success/80">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Your <span className="text-gradient-primary">Build</span> Collection
          </h1>
          <p className="text-muted-foreground">
            Manage, compare, and export your saved builds
          </p>
        </div>

        {/* Filters & Search */}
        <Card className="card-gaming mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search builds..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-gaming pl-10"
                />
              </div>
              
              <Select value={gameFilter} onValueChange={setGameFilter}>
                <SelectTrigger className="input-gaming">
                  <SelectValue placeholder="All Games" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Games</SelectItem>
                  <SelectItem value="Diablo 4">Diablo 4</SelectItem>
                  <SelectItem value="RAID: Shadow Legends">RAID: Shadow Legends</SelectItem>
                  <SelectItem value="World of Warcraft">World of Warcraft</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="input-gaming">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="forge">Forge (Manual)</SelectItem>
                  <SelectItem value="metaforge">Metaforge (AI)</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  disabled={selectedBuilds.length !== 2}
                  onClick={() => toast({ title: "Build Comparison", description: "Opening comparison view..." })}
                >
                  Compare ({selectedBuilds.length}/2)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Build List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Builds ({filteredBuilds.length})
            </h2>
          </div>

          {filteredBuilds.map((build) => {
            const TypeIcon = getTypeIcon(build.type);
            const isSelected = selectedBuilds.includes(build.id);
            
            return (
              <Card key={build.id} className={`card-gaming cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}>
                <CardContent className="pt-6">
                  <div className="grid lg:grid-cols-4 gap-6">
                    {/* Build Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBuildSelection(build.id)}
                            className="rounded border-border"
                          />
                          <div className={`p-2 rounded-lg ${build.type === 'metaforge' ? 'bg-gradient-to-br from-primary to-primary-dark' : 'bg-gradient-to-br from-accent to-accent-dark'}`}>
                            <TypeIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{build.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{build.game}</Badge>
                              <Badge variant={build.type === 'metaforge' ? 'default' : 'secondary'}>
                                {build.type === 'metaforge' ? 'AI Generated' : 'Manual Build'}
                              </Badge>
                              <Badge variant="outline">{build.context.toUpperCase()}</Badge>
                              {build.score && (
                                <div className="flex items-center space-x-1">
                                  <Star className="w-3 h-3 fill-current text-premium" />
                                  <span className="text-xs font-medium">{(build.score * 100).toFixed(0)}%</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Equipment</h4>
                        <div className="space-y-1">
                          {build.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <Badge variant="outline" className="text-xs">{item.slot}</Badge>
                              <span className={`${getRarityColor(item.rarity)}`}>
                                {item.name}
                              </span>
                            </div>
                          ))}
                          {build.items.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{build.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Total Stats</h4>
                      <div className="space-y-2">
                        {Object.entries(build.totalStats).slice(0, 4).map(([stat, value]) => (
                          <div key={stat} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{stat}</span>
                            <span className="text-primary font-medium">+{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{build.created.toLocaleDateString()}</span>
                        </div>
                        <span>v{build.version}</span>
                      </div>

                      <div className="space-y-2">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit3 className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteBuild(build.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>

                        <Tabs defaultValue="json" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
                            <TabsTrigger value="image" className="text-xs">Image</TabsTrigger>
                          </TabsList>
                          <TabsContent value="json" className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => exportBuild(build, 'json')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export JSON
                            </Button>
                          </TabsContent>
                          <TabsContent value="image" className="mt-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full"
                              onClick={() => exportBuild(build, 'image')}
                            >
                              <Share className="w-4 h-4 mr-2" />
                              Export Image
                            </Button>
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredBuilds.length === 0 && (
            <Card className="card-gaming">
              <CardContent className="pt-6 text-center py-12">
                <Shield className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No builds found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || gameFilter !== "all" || typeFilter !== "all" 
                    ? "Try adjusting your search criteria" 
                    : "Create your first build to get started"}
                </p>
                <Button variant="hero" asChild>
                  <a href="/forge">Create Your First Build</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};