import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Gem {
  id: string;
  name: string;
  rarity: string;
  stats: Record<string, number>;
  gem_type?: string;
  effect?: Record<string, any>;
  game_id: string;
  user_id: string;
}

export const useGems = (gameId: string | null, userId: string | null) => {
  const [gems, setGems] = useState<Gem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchGems = async () => {
    if (!gameId || !userId) {
      setGems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('gems')
        .select('*')
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGems(data || []);
    } catch (error) {
      console.error('Error fetching gems:', error);
      toast({
        title: "Failed to load gems",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addGem = async (gemData: { name: string; rarity: string; stats: Record<string, number>; gem_type?: string }) => {
    if (!gameId || !userId) {
      toast({
        title: "Cannot add gem",
        description: "Please select a game first",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('gems')
        .insert({
          ...gemData,
          game_id: gameId,
          user_id: userId
        });

      if (error) throw error;

      toast({
        title: "Gem added successfully",
        description: `${gemData.name} has been added to your gem inventory`
      });

      await fetchGems();
      return true;
    } catch (error) {
      console.error('Error adding gem:', error);
      toast({
        title: "Failed to add gem",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchGems();
  }, [gameId, userId]);

  return {
    gems,
    loading,
    addGem,
    refetch: fetchGems
  };
};
