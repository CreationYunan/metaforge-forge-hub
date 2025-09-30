import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Hammer, 
  Save,
  Zap,
  Loader2,
  Shield,
  Sword,
  CircleDot,
  Gem
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { OptimizationResult } from "@/components/OptimizationResult";
import { PreOptimizerAd } from "@/components/PreOptimizerAd";
import { useOptimization } from "@/hooks/useOptimization";
import { useAuth } from "@/hooks/useAuth";
import { useGames } from "@/hooks/useGames";
import { useItems } from "@/hooks/useItems";
import { useGems } from "@/hooks/useGems";
import { InventorySection } from "@/components/InventorySection";
import { GemInventorySection } from "@/components/GemInventorySection";
import { supabase } from "@/integrations/supabase/client";
import { AddGemModal } from "@/components/AddGemModal";

interface BuildSlot {
  slotName: string;
  item?: any;
  gems?: any[];
}

export const Forge = () => {
  const { user, profile, isAuthenticated } = useAuth();
  const { games, loading: gamesLoading } = useGames();
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [buildName, setBuildName] = useState("");
  const [buildSlots, setBuildSlots] = useState<BuildSlot[]>([]);
  const [showPreAd, setShowPreAd] = useState(false);
  const [showAddGemModal, setShowAddGemModal] = useState(false);
  const { toast } = useToast();
  const { isOptimizing, optimizationResult, optimizeBuild, clearResult } = useOptimization();

  const { items, loading: itemsLoading } = useItems(selectedGameId, user?.id || null);
  const { gems, loading: gemsLoading, addGem } = useGems(selectedGameId, user?.id || null);

  // Initialize slots when game is selected
  useEffect(() => {
    if (selectedGameId) {
      const selectedGame = games.find(g => g.id === selectedGameId);
      if (selectedGame?.slots) {
        const slots = Array.isArray(selectedGame.slots) 
          ? selectedGame.slots 
          : [];
        setBuildSlots(slots.map((slotName: string) => ({ slotName, gems: [] })));
      }
    }
  }, [selectedGameId, games]);

  const addItemToSlot = (slotIndex: number, item: any) => {
    setBuildSlots(prev => prev.map((slot, idx) => 
      idx === slotIndex ? { ...slot, item } : slot
    ));
  };

  const removeItemFromSlot = (slotIndex: number) => {
    setBuildSlots(prev => prev.map((slot, idx) => 
      idx === slotIndex ? { ...slot, item: undefined } : slot
    ));
  };

  const addGemToSlot = (slotIndex: number, gem: any) => {
    setBuildSlots(prev => prev.map((slot, idx) => {
      if (idx === slotIndex && slot.item) {
        const currentGems = slot.gems || [];
        const maxSockets = slot.item.socket_count || 0;
        
        if (currentGems.length < maxSockets) {
          return { ...slot, gems: [...currentGems, gem] };
        } else {
          toast({
            title: "No socket available",
            description: `This item only has ${maxSockets} socket(s)`,
            variant: "destructive"
          });
          return slot;
        }
      }
      return slot;
    }));
  };

  const calculateTotalStats = () => {
    const totals: Record<string, number> = {};
    
    buildSlots.forEach(slot => {
      if (slot.item?.stats) {
        Object.entries(slot.item.stats).forEach(([stat, value]) => {
          totals[stat] = (totals[stat] || 0) + (value as number);
        });
      }
      
      if (slot.gems) {
        slot.gems.forEach((gem: any) => {
          if (gem.stats) {
            Object.entries(gem.stats).forEach(([stat, value]) => {
              totals[stat] = (totals[stat] || 0) + (value as number);
            });
          }
        });
      }
    });

    return totals;
  };

  const saveBuild = async () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please login to save builds",
        variant: "destructive"
      });
      return;
    }

    if (!buildName) {
      toast({
        title: "Build name required",
        description: "Please enter a name for your build",
        variant: "destructive"
      });
      return;
    }

    if (!selectedGameId) {
      toast({
        title: "Game required",
        description: "Please select a game",
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

    try {
      const buildData = {
        name: buildName,
        game_id: selectedGameId,
        user_id: user.id,
        items: buildSlots.reduce((acc, slot) => {
          if (slot.item) {
            acc[slot.slotName] = slot.item.id;
          }
          return acc;
        }, {} as Record<string, string>),
        gems: buildSlots.reduce((acc, slot) => {
          if (slot.gems && slot.gems.length > 0) {
            acc[slot.slotName] = slot.gems.map(g => g.id);
          }
          return acc;
        }, {} as Record<string, string[]>),
        type: 'forge'
      };

      const { error } = await supabase.from('builds').insert(buildData);

      if (error) throw error;

      toast({
        title: "Build saved!",
        description: `"${buildName}" has been saved with ${filledSlots} items`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to save build",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleOptimizeBuild = () => {
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication required",
        description: "Please login to use optimizer",
        variant: "destructive"
      });
      return;
    }

    const filledSlots = buildSlots.filter(slot => slot.item).length;
    if (filledSlots === 0) {
      toast({
        title: "No items to optimize",
        description: "Please add at least one item to your build before optimizing",
        variant: "destructive"
      });
      return;
    }

    if (!selectedGameId) {
      toast({
        title: "Game required",
        description: "Please select a game",
        variant: "destructive"
      });
      return;
    }

    // Show pre-optimizer ad for non-premium users
    if (!profile?.premium) {
      setShowPreAd(true);
    } else {
      startOptimization();
    }
  };

  const startOptimization = async () => {
    setShowPreAd(false);
    await optimizeBuild({ buildSlots }, selectedGameId!, user!.id);
  };

  const handleApplySuggestion = (suggestion: any) => {
    const itemToApply = items.find(item => item.id === suggestion.suggestedItem.id);
    
    if (itemToApply) {
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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Authentication Required</h1>
        <p className="text-muted-foreground mb-8">Please login to use the Forge</p>
        <Button variant="hero" asChild>
          <a href="/login">Login</a>
        </Button>
      </div>
    );
  }

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
                  <Select value={selectedGameId || ""} onValueChange={setSelectedGameId}>
                    <SelectTrigger className="input-gaming">
                      <SelectValue placeholder="Select a game..." />
                    </SelectTrigger>
                    <SelectContent>
                      {games.map(game => (
                        <SelectItem key={game.id} value={game.id}>
                          {game.game_name}
                        </SelectItem>
                      ))}
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
                  <Badge variant="outline">{filledSlots}/{buildSlots.length} Filled</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {buildSlots.map((slot, index) => (
                    <div key={slot.slotName} className="p-4 border border-border rounded-lg bg-background-secondary">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{slot.slotName}</h4>
                      </div>

                      {slot.item ? (
                        <div className="space-y-2">
                          <h5 className={`font-medium ${getRarityColor(slot.item.rarity)}`}>
                            {slot.item.name}
                          </h5>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {slot.item.rarity}
                            </Badge>
                            {slot.item.socket_count > 0 && (
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <Gem className="w-3 h-3" />
                                {slot.gems?.length || 0}/{slot.item.socket_count}
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-1">
                            {Object.entries(slot.item.stats || {}).map(([stat, value]) => (
                              <div key={stat} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{stat}</span>
                                <span className="text-accent">+{value as number}</span>
                              </div>
                            ))}
                          </div>
                          {slot.gems && slot.gems.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border">
                              <p className="text-xs font-medium mb-1">Socketed Gems:</p>
                              {slot.gems.map((gem, gIdx) => (
                                <p key={gIdx} className={`text-xs ${getRarityColor(gem.rarity)}`}>
                                  • {gem.name}
                                </p>
                              ))}
                            </div>
                          )}
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

          {/* Sidebar */}
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
              <CardContent>
                {itemsLoading ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <p>No items in inventory</p>
                    <p className="text-xs mt-1">Upload items to start building</p>
                  </div>
                ) : (
                  <InventorySection
                    items={items}
                    usedItemIds={buildSlots.filter(s => s.item).map(s => s.item.id)}
                    onAddToSlot={(item) => {
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
                    getRarityColor={getRarityColor}
                  />
                )}
              </CardContent>
            </Card>

            {/* Gems */}
            <GemInventorySection
              gems={gems}
              getRarityColor={getRarityColor}
              onAddGem={() => setShowAddGemModal(true)}
            />
          </div>
        </div>
      </div>

      {/* Add Gem Modal */}
      <AddGemModal
        open={showAddGemModal}
        onOpenChange={setShowAddGemModal}
        onAdd={async (gemData) => {
          const success = await addGem(gemData);
          return success || false;
        }}
      />

      {/* Pre-Optimizer Ad */}
      {showPreAd && (
        <PreOptimizerAd
          onContinue={startOptimization}
          isPremium={profile?.premium}
        />
      )}

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
