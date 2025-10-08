import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Loader2, Plus, Eye, Power } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type GameInfo = {
  id: string;
  game_name: string;
  active: boolean;
  version: string;
  slots: any[];
  rarities: any[];
  stats: any;
  perks: any;
  gems: any;
  created_at: string;
};

export default function Games() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [games, setGames] = useState<GameInfo[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showNewGameDialog, setShowNewGameDialog] = useState(false);
  const [newGameName, setNewGameName] = useState("");
  const [creatingGame, setCreatingGame] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameInfo | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchGames();
    }
  }, [isAdmin]);

  const fetchGames = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('games_info')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGames(data || []);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Error",
        description: "Failed to load games",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleCreateGameViaAI = async () => {
    if (!newGameName.trim()) return;

    setCreatingGame(true);
    try {
      const { data, error } = await supabase.functions.invoke('gameinfo-agent', {
        body: { gameName: newGameName }
      });

      if (error) throw error;

      // Audit log
      await supabase.functions.invoke('audit-agent', {
        body: {
          entity_type: 'games_info',
          action: 'create_game_via_ai',
          summary: `Created game "${newGameName}" via AI`,
          details: { gameName: newGameName, provider: 'gameinfo-agent' }
        }
      });

      toast({
        title: "Success",
        description: `Game "${newGameName}" created successfully`
      });

      setShowNewGameDialog(false);
      setNewGameName("");
      fetchGames();
    } catch (error) {
      console.error('Error creating game:', error);
      toast({
        title: "Error",
        description: "Failed to create game via AI",
        variant: "destructive"
      });
    } finally {
      setCreatingGame(false);
    }
  };

  const handleToggleActive = async (gameId: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('games_info')
        .update({ active: !currentActive })
        .eq('id', gameId);

      if (error) throw error;

      // Audit log
      await supabase.functions.invoke('audit-agent', {
        body: {
          entity_type: 'games_info',
          entity_id: gameId,
          action: 'set_game_active',
          summary: `Game ${!currentActive ? 'activated' : 'deactivated'}`,
          details: { active: !currentActive }
        }
      });

      toast({
        title: "Success",
        description: `Game ${!currentActive ? 'activated' : 'deactivated'}`
      });

      fetchGames();
    } catch (error) {
      console.error('Error toggling game status:', error);
      toast({
        title: "Error",
        description: "Failed to update game status",
        variant: "destructive"
      });
    }
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
          <h1 className="text-3xl font-bold text-gradient-primary">Game Management</h1>
          <p className="text-muted-foreground">Manage game configurations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowNewGameDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Game via AI
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Back to Admin
          </Button>
        </div>
      </div>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle>Games ({games.length})</CardTitle>
          <CardDescription>All configured games in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {games.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-lg">{game.game_name}</p>
                    <Badge variant={game.active ? "default" : "secondary"}>
                      {game.active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">v{game.version}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{game.slots?.length || 0} slots</span>
                    <span>{game.rarities?.length || 0} rarities</span>
                    <span>{Object.keys(game.stats || {}).length} stats</span>
                    <span>{Object.keys(game.perks || {}).length} perks</span>
                    <span>{Object.keys(game.gems || {}).length} gems</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Created: {new Date(game.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedGame(game)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                  <Button
                    size="sm"
                    variant={game.active ? "secondary" : "default"}
                    onClick={() => handleToggleActive(game.id, game.active)}
                  >
                    <Power className="mr-2 h-4 w-4" />
                    {game.active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}

            {games.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No games configured yet. Create one via AI!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNewGameDialog} onOpenChange={setShowNewGameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Game via AI</DialogTitle>
            <DialogDescription>
              Enter the game name and our AI will generate the configuration
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="e.g., Diablo 4, Path of Exile..."
              value={newGameName}
              onChange={(e) => setNewGameName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateGameViaAI()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewGameDialog(false)} disabled={creatingGame}>
              Cancel
            </Button>
            <Button onClick={handleCreateGameViaAI} disabled={creatingGame || !newGameName.trim()}>
              {creatingGame && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Game
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={!!selectedGame} onOpenChange={(open) => !open && setSelectedGame(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selectedGame?.game_name} - Details</DrawerTitle>
            <DrawerDescription>Game configuration data</DrawerDescription>
          </DrawerHeader>
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {selectedGame && (
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(
                  {
                    slots: selectedGame.slots,
                    rarities: selectedGame.rarities,
                    stats: selectedGame.stats,
                    perks: selectedGame.perks,
                    gems: selectedGame.gems
                  },
                  null,
                  2
                )}
              </pre>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
