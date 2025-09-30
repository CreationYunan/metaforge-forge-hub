import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OptimizationSuggestion {
  slot: string;
  currentItem?: string;
  suggestedItem: {
    id: string;
    name: string;
    rarity: string;
    stats: Record<string, number>;
  };
  reason: string;
  statImprovement: Record<string, number>;
}

interface OptimizationResult {
  pros: string[];
  cons: string[];
  suggestions: OptimizationSuggestion[];
  overallScore: number;
}

export const useOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const { toast } = useToast();

  const optimizeBuild = async (buildData: any, gameId: string, userId: string) => {
    setIsOptimizing(true);
    try {
      console.log('Starting build optimization for:', { gameId, userId });
      
      const { data, error } = await supabase.functions.invoke('evaluate-agent', {
        body: {
          buildData,
          gameId,
          userId
        }
      });

      if (error) {
        console.error('Optimization error:', error);
        throw error;
      }

      if (!data || !data.success) {
        throw new Error(data?.error || 'Optimization failed');
      }

      console.log('Optimization completed:', data.result);
      setOptimizationResult(data.result);
      
      toast({
        title: "Optimization Complete",
        description: `Analysis finished with score: ${data.result.overallScore}/100`,
      });

    } catch (error) {
      console.error('Error during optimization:', error);
      toast({
        title: "Optimization Failed",
        description: error instanceof Error ? error.message : 'Failed to optimize build',
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  const clearResult = () => {
    setOptimizationResult(null);
  };

  return {
    isOptimizing,
    optimizationResult,
    optimizeBuild,
    clearResult
  };
};