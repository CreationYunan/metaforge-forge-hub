import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Hammer, 
  Plus, 
  Minus,
  Save,
  Trash2,
  Gem,
  Shield,
  Sword,
  Crown,
  CircleDot,
  Zap,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OptimizationResult } from "@/components/OptimizationResult";
import { useOptimization } from "@/hooks/useOptimization";

// Mock data
const mockInventory = [
  { id: "1", name: "Legendary Sword of Power", slot: "Weapon", rarity: "Legendary", stats: { "Attack Power": 450, "Crit Chance": 15 } },
  { id: "2", name: "Epic Steel Helmet", slot: "Helmet", rarity: "Epic", stats: { "Defense": 200, "HP": 150 } },
  { id: "3", name: "Rare Iron Boots", slot: "Boots", rarity: "Rare", stats: { "Defense": 120, "Speed": 10 } },
  { id: "4", name: "Mystic Ring of Wisdom", slot: "Ring", rarity: "Legendary", stats: { "Mana": 300, "Spell Power": 80 } },
  { id: "5", name: "Divine Chest Armor", slot: "Chest", rarity: "Legendary", stats: { "Defense": 350, "HP": 200 } },
  { id: "6", name: "Shadow Gloves", slot: "Gloves", rarity: "Epic", stats: { "Attack Power": 180, "Crit Chance": 8 } },
];

const mockGems = [
  { id: "g1", name: "Ruby of Strength", stats: { "Attack Power": 50 }, rarity: "Legendary" },
  { id: "g2", name: "Sapphire of Defense", stats: { "Defense": 75 }, rarity: "Epic" },
  { id: "g3", name: "Emerald of Speed", stats: { "Speed": 25 }, rarity: "Rare" },
];

const gameSlots = ["Helmet", "Chest", "Legs", "Boots", "Gloves", "Weapon", "Ring", "Necklace"];

interface BuildItem {
  slotName: string;
  item?: typeof mockInventory[0];
  gems?: typeof mockGems;
}

export const Forge = () => {
  const [selectedGame, setSelectedGame] = useState("diablo4");
  const [buildName, setBuildName] = useState("");
  const [buildSlots, setBuildSlots] = useState<BuildItem[]>(
    gameSlots.map(slot => ({ slotName: slot }))
  );
  const { toast } = useToast();
  const { isOptimizing, optimizationResult, optimizeBuild, clearResult } = useOptimization();

  const addItemToSlot = (slotIndex: number, item: typeof mockInventory[0]) => {
    setBuildSlots(prev => prev.map((slot, idx) => 
      idx === slotIndex ? { ...slot, item } : slot
    ));
  };

  const removeItemFromSlot = (slotIndex: number) => {
    setBuildSlots(prev => prev.map((slot, idx) => 
      idx === slotIndex ? { ...slot, item: undefined } : slot
    ));
  };

  const calculateTotalStats = () => {
    const totals: Record<string, number> = {};
    
    buildSlots.forEach(slot => {
      if (slot.item) {
        Object.entries(slot.item.stats).forEach(([stat, value]) => {
          totals[stat] = (totals[stat] || 0) + value;
        });
      }
    });

    return totals;
  };

  const saveBuild = () => {
    if (!buildName) {
      toast({
        title: "Build name required",
        description: "Please enter a name for your build",
        variant: "destructive"
      });
      return;
    }

    const filledSlots = buildSlots.filter(slot => slot.item).length;
    if (filledSlots === 0) {
      toast({
        title: "Empty build",
        description: "Please add at least one item to your build",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Build saved!",
      description: `"${buildName}" has been saved with ${filledSlots} items`,
    });
  };

  const handleOptimizeBuild = async () => {
    const filledSlots = buildSlots.filter(slot => slot.item).length;
    if (filledSlots === 0) {
      toast({
        title: "No items to optimize",
        description: "Please add at least one item to your build before optimizing",
        variant: "destructive"
      });
      return;
    }

    const mockUserId = "mock-user-id"; // In real app, this would come from auth
    const mockGameId = "mock-game-id"; // This would be mapped from selectedGame
    
    await optimizeBuild({ buildSlots }, mockGameId, mockUserId);
  };

  const handleApplySuggestion = (suggestion: any) => {
    // Find the item in mockInventory based on the suggested item ID
    const itemToApply = mockInventory.find(item => item.id === suggestion.suggestedItem.id);
    
    if (itemToApply) {
      // Find the slot index to update
      const slotIndex = buildSlots.findIndex(slot => slot.slotName === suggestion.slot);
      
      if (slotIndex !== -1) {
        addItemToSlot(slotIndex, itemToApply);
        toast({
          title: "Suggestion Applied",
          description: `${itemToApply.name} has been equipped to ${suggestion.slot}`,
        });
      }
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'text-premium';
      case 'epic': return 'text-primary';
      case 'rare': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const totalStats = calculateTotalStats();
  const filledSlots = buildSlots.filter(slot => slot.item).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-accent to-accent-dark">
              <Hammer className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            <span className="text-gradient-primary">Forge</span> Your Build
          </h1>
          <p className="text-muted-foreground">
            Create and customize builds using your analyzed items
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Build Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Game & Build Settings */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>Build Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Game</label>
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
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Build Name</label>
                  <Input
                    className="input-gaming"
                    placeholder="Enter build name..."
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Build Slots */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sword className="w-5 h-5" />
                    <span>Equipment Slots</span>
                  </div>
                  <Badge variant="outline">{filledSlots}/{gameSlots.length} Filled</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {buildSlots.map((slot, index) => (
                    <div key={slot.slotName} className="p-4 border border-border rounded-lg bg-background-secondary">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{slot.slotName}</h4>
                        {slot.item && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeItemFromSlot(index)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {slot.item ? (
                        <div className="space-y-2">
                          <h5 className={`font-medium ${getRarityColor(slot.item.rarity)}`}>
                            {slot.item.name}
                          </h5>
                          <Badge variant="outline" className="text-xs">
                            {slot.item.rarity}
                          </Badge>
                          <div className="space-y-1">
                            {Object.entries(slot.item.stats).map(([stat, value]) => (
                              <div key={stat} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{stat}</span>
                                <span className="text-accent">+{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CircleDot className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">Empty Slot</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Inventory & Stats */}
          <div className="space-y-6">
            {/* Build Stats */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="text-lg">Build Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(totalStats).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(totalStats).map(([stat, value]) => (
                      <div key={stat} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{stat}</span>
                        <span className="text-sm font-medium text-primary">+{value}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="pt-2 space-y-2">
                      <Button 
                        variant="hero" 
                        size="sm" 
                        onClick={saveBuild}
                        className="w-full"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Build
                      </Button>
                      
                      <Button
                        variant="gaming"
                        size="sm"
                        onClick={handleOptimizeBuild}
                        disabled={isOptimizing}
                        className="w-full"
                      >
                        {isOptimizing ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Zap className="w-4 h-4 mr-2" />
                        )}
                        {isOptimizing ? 'Optimizing...' : 'Optimizer'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Add items to see stats
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="text-lg">Your Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockInventory.map((item) => (
                  <div key={item.id} className="p-3 border border-border rounded-lg bg-background-tertiary">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                        {item.name}
                      </h5>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          const slotIndex = buildSlots.findIndex(s => s.slotName === item.slot && !s.item);
                          if (slotIndex !== -1) {
                            addItemToSlot(slotIndex, item);
                          } else {
                            toast({
                              title: "No available slot",
                              description: `No empty ${item.slot} slot available`,
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex justify-between text-xs mb-2">
                      <Badge variant="outline" className="text-xs">{item.slot}</Badge>
                      <Badge variant="outline" className="text-xs">{item.rarity}</Badge>
                    </div>
                    <div className="space-y-1">
                      {Object.entries(item.stats).map(([stat, value]) => (
                        <div key={stat} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{stat}</span>
                          <span className="text-accent">+{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Available Gems */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Gem className="w-4 h-4" />
                  <span>Gems</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockGems.map((gem) => (
                  <div key={gem.id} className="p-3 border border-border rounded-lg bg-background-tertiary">
                    <h5 className={`text-sm font-medium ${getRarityColor(gem.rarity)} mb-2`}>
                      {gem.name}
                    </h5>
                    <Badge variant="outline" className="text-xs mb-2">{gem.rarity}</Badge>
                    <div className="space-y-1">
                      {Object.entries(gem.stats).map(([stat, value]) => (
                        <div key={stat} className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{stat}</span>
                          <span className="text-accent">+{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Optimization Result Modal */}
      {optimizationResult && (
        <OptimizationResult
          result={optimizationResult}
          onApplySuggestion={handleApplySuggestion}
          onClose={clearResult}
        />
      )}
    </div>
  );
};