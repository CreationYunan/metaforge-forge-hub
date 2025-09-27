import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Sword, 
  Zap,
  Shield,
  Target,
  TrendingUp,
  Brain,
  Save,
  Eye,
  RefreshCw,
  Star,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OptimizedBuild {
  id: string;
  name: string;
  type: 'user_priority' | 'meta_optimized';
  items: Array<{
    slot: string;
    name: string;
    rarity: string;
    stats: Record<string, number>;
  }>;
  totalStats: Record<string, number>;
  pros: string[];
  cons: string[];
  score: number;
}

export const Metaforge = () => {
  const [selectedGame, setSelectedGame] = useState("diablo4");
  const [buildFocus, setBuildFocus] = useState("damage");
  const [context, setContext] = useState("pve");
  const [generating, setGenerating] = useState(false);
  const [optimizedBuilds, setOptimizedBuilds] = useState<OptimizedBuild[]>([]);
  const { toast } = useToast();

  const runMetaforge = async () => {
    setGenerating(true);
    
    // Simulate AI processing with current meta data
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockBuilds: OptimizedBuild[] = [
      {
        id: 'user-build',
        name: 'Optimized for Your Priorities',
        type: 'user_priority',
        items: [
          { slot: 'Weapon', name: 'Legendary Blade of Domination', rarity: 'Legendary', stats: { 'Attack Power': 520, 'Crit Chance': 18 } },
          { slot: 'Helmet', name: 'Epic Helm of Focus', rarity: 'Epic', stats: { 'Defense': 240, 'Crit Damage': 25 } },
          { slot: 'Chest', name: 'Mythic Armor of the Void', rarity: 'Mythic', stats: { 'Defense': 380, 'HP': 450 } },
        ],
        totalStats: { 'Attack Power': 520, 'Defense': 620, 'HP': 450, 'Crit Chance': 18, 'Crit Damage': 25 },
        pros: [
          '+35% higher damage than current build',
          'Optimal synergy between crit chance and damage',
          'Maintains defensive capabilities'
        ],
        cons: [
          '-10% movement speed compared to speed builds',
          'Requires 2 legendary items from inventory'
        ],
        score: 0.92
      },
      {
        id: 'meta-build',
        name: 'Current Meta Optimized',
        type: 'meta_optimized',
        items: [
          { slot: 'Weapon', name: 'Meta Sword of Current Patch', rarity: 'Legendary', stats: { 'Attack Power': 480, 'Speed': 15 } },
          { slot: 'Helmet', name: 'Trending Helm of Power', rarity: 'Epic', stats: { 'Attack Power': 120, 'Crit Chance': 12 } },
          { slot: 'Chest', name: 'Popular Chest of Dominance', rarity: 'Epic', stats: { 'Attack Power': 200, 'HP': 300 } },
        ],
        totalStats: { 'Attack Power': 800, 'HP': 300, 'Speed': 15, 'Crit Chance': 12 },
        pros: [
          'Follows current competitive meta trends',
          '+60% more raw attack power',
          'Excellent for speedrun strategies'
        ],
        cons: [
          'Lower survivability in extended fights',
          'Meta may change with next patch',
          'Requires specific playstyle'
        ],
        score: 0.88
      }
    ];

    setOptimizedBuilds(mockBuilds);
    setGenerating(false);

    toast({
      title: "Metaforge Complete!",
      description: "Generated 2 optimized builds based on your inventory and current meta",
    });
  };

  const saveBuild = (build: OptimizedBuild) => {
    toast({
      title: "Build saved!",
      description: `"${build.name}" has been saved to your builds`,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.9) return 'text-premium';
    if (score >= 0.8) return 'text-success';
    if (score >= 0.7) return 'text-accent';
    return 'text-warning';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-primary-dark glow-primary">
              <Sword className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            <span className="text-gradient-primary">Metaforge</span> AI Optimizer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Let our AI analyze your inventory and current meta trends to generate optimized builds
          </p>
        </div>

        {/* Configuration */}
        <Card className="card-gaming mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Optimization Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Game Selection */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Game</Label>
                <Select value={selectedGame} onValueChange={setSelectedGame}>
                  <SelectTrigger className="input-gaming">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diablo4">Diablo 4</SelectItem>
                    <SelectItem value="raid">RAID: Shadow Legends</SelectItem>
                    <SelectItem value="wow">World of Warcraft</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Build Focus */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Build Focus</Label>
                <RadioGroup value={buildFocus} onValueChange={setBuildFocus}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="damage" id="damage" />
                    <Label htmlFor="damage" className="text-sm">Maximize Damage</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="defense" id="defense" />
                    <Label htmlFor="defense" className="text-sm">Maximize Defense</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="balanced" />
                    <Label htmlFor="balanced" className="text-sm">Balanced Build</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Context */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Game Context</Label>
                <RadioGroup value={context} onValueChange={setContext}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pve" id="pve" />
                    <Label htmlFor="pve" className="text-sm">PvE (Player vs Environment)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pvp" id="pvp" />
                    <Label htmlFor="pvp" className="text-sm">PvP (Player vs Player)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hybrid" id="hybrid" />
                    <Label htmlFor="hybrid" className="text-sm">Hybrid</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <Separator />

            <div className="text-center">
              <Button 
                variant="hero" 
                size="lg"
                onClick={runMetaforge}
                disabled={generating}
                className="px-8"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Running Metaforge...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Run Metaforge AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Processing */}
        {generating && (
          <Card className="card-gaming mb-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <Brain className="w-12 h-12 text-primary mx-auto mb-4" />
                </div>
                <h3 className="text-xl font-semibold">AI Processing Your Build</h3>
                <div className="max-w-md mx-auto space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing inventory...</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Fetching current meta data...</span>
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Optimizing build combinations...</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  </div>
                </div>
                <Progress value={75} className="w-full max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optimized Builds */}
        {optimizedBuilds.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Optimized Build Suggestions</h2>
              <p className="text-muted-foreground">AI-generated builds based on your inventory and preferences</p>
            </div>

            {optimizedBuilds.map((build) => (
              <Card key={build.id} className="card-gaming">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${build.type === 'meta_optimized' ? 'bg-gradient-to-br from-accent to-accent-dark' : 'bg-gradient-to-br from-primary to-primary-dark'}`}>
                        {build.type === 'meta_optimized' ? 
                          <TrendingUp className="w-5 h-5 text-white" /> : 
                          <Target className="w-5 h-5 text-white" />
                        }
                      </div>
                      <div>
                        <CardTitle className="text-xl">{build.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant={build.type === 'meta_optimized' ? 'secondary' : 'default'}>
                            {build.type === 'meta_optimized' ? 'Meta Optimized' : 'Your Priorities'}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-current text-premium" />
                            <span className={`font-semibold ${getScoreColor(build.score)}`}>
                              {(build.score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {build.type === 'meta_optimized' && (
                    <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="w-5 h-5 text-accent mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-accent">Meta-Based Build</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            This build follows current community trends and may not match your selected priorities.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid lg:grid-cols-3 gap-6">
                    {/* Items */}
                    <div className="lg:col-span-2">
                      <h4 className="font-semibold mb-3">Equipment Setup</h4>
                      <div className="space-y-3">
                        {build.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-background-secondary rounded-lg">
                            <div>
                              <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="text-xs">{item.slot}</Badge>
                                <span className={`font-medium ${getRarityColor(item.rarity)}`}>
                                  {item.name}
                                </span>
                              </div>
                              <div className="flex space-x-4 mt-2 text-xs">
                                {Object.entries(item.stats).map(([stat, value]) => (
                                  <span key={stat} className="text-muted-foreground">
                                    {stat}: <span className="text-accent">+{value}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Stats & Analysis */}
                    <div className="space-y-4">
                      {/* Total Stats */}
                      <div>
                        <h4 className="font-semibold mb-3">Total Stats</h4>
                        <div className="space-y-2">
                          {Object.entries(build.totalStats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{stat}</span>
                              <span className="text-primary font-medium">+{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pros */}
                      <div>
                        <h4 className="font-semibold mb-3 text-success">Advantages</h4>
                        <ul className="space-y-1">
                          {build.pros.map((pro, index) => (
                            <li key={index} className="text-sm text-success flex items-start space-x-2">
                              <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Cons */}
                      <div>
                        <h4 className="font-semibold mb-3 text-warning">Trade-offs</h4>
                        <ul className="space-y-1">
                          {build.cons.map((con, index) => (
                            <li key={index} className="text-sm text-warning flex items-start space-x-2">
                              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="space-y-2 pt-2">
                        <Button 
                          variant="hero" 
                          size="sm" 
                          onClick={() => saveBuild(build)}
                          className="w-full"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Build
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm">
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Refine
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};