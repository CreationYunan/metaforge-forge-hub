import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  TrendingUp,
  X
} from "lucide-react";

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

interface OptimizationResultData {
  pros: string[];
  cons: string[];
  suggestions: OptimizationSuggestion[];
  overallScore: number;
}

interface OptimizationResultProps {
  result: OptimizationResultData;
  onApplySuggestion: (suggestion: OptimizationSuggestion) => void;
  onClose: () => void;
}

export const OptimizationResult = ({ result, onApplySuggestion, onClose }: OptimizationResultProps) => {
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'text-premium';
      case 'epic': return 'text-primary';
      case 'rare': return 'text-accent';
      default: return 'text-muted-foreground';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleApplySuggestion = (suggestion: OptimizationSuggestion) => {
    const suggestionKey = `${suggestion.slot}-${suggestion.suggestedItem.id}`;
    setAppliedSuggestions(prev => new Set(prev).add(suggestionKey));
    onApplySuggestion(suggestion);
  };

  const isSuggestionApplied = (suggestion: OptimizationSuggestion) => {
    const suggestionKey = `${suggestion.slot}-${suggestion.suggestedItem.id}`;
    return appliedSuggestions.has(suggestionKey);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background border-b border-border p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">Build Optimization Analysis</h2>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Overall Score:</span>
              <span className={`text-xl font-bold ${getScoreColor(result.overallScore)}`}>
                {result.overallScore}/100
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Pros and Cons */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pros */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  <span>Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.pros.map((pro, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{pro}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Cons */}
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-500">
                  <AlertCircle className="w-5 h-5" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.cons.map((con, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{con}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <Card className="card-gaming">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Optimization Suggestions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg bg-background-secondary">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium text-lg">{suggestion.slot} Upgrade</h4>
                        <p className="text-sm text-muted-foreground mt-1">{suggestion.reason}</p>
                      </div>
                      <Button
                        variant={isSuggestionApplied(suggestion) ? "outline" : "hero"}
                        size="sm"
                        onClick={() => handleApplySuggestion(suggestion)}
                        disabled={isSuggestionApplied(suggestion)}
                      >
                        {isSuggestionApplied(suggestion) ? 'Applied' : 'Apply'}
                      </Button>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 items-center">
                      {/* Current Item */}
                      <div className="text-center">
                        <h5 className="text-sm font-medium mb-2">Current</h5>
                        <div className="p-3 border border-border rounded bg-background-tertiary min-h-[80px] flex items-center justify-center">
                          {suggestion.currentItem ? (
                            <span className="text-sm text-muted-foreground">{suggestion.currentItem}</span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">Empty Slot</span>
                          )}
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex justify-center">
                        <ArrowRight className="w-6 h-6 text-accent" />
                      </div>

                      {/* Suggested Item */}
                      <div className="text-center">
                        <h5 className="text-sm font-medium mb-2">Suggested</h5>
                        <div className="p-3 border border-border rounded bg-background-tertiary">
                          <h6 className={`text-sm font-medium ${getRarityColor(suggestion.suggestedItem.rarity)} mb-1`}>
                            {suggestion.suggestedItem.name}
                          </h6>
                          <Badge variant="outline" className="text-xs mb-2">
                            {suggestion.suggestedItem.rarity}
                          </Badge>
                          <div className="space-y-1">
                            {Object.entries(suggestion.suggestedItem.stats).map(([stat, value]) => (
                              <div key={stat} className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{stat}</span>
                                <span className="text-accent">+{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stat Improvements */}
                    {Object.keys(suggestion.statImprovement).length > 0 && (
                      <>
                        <Separator className="my-3" />
                        <div>
                          <h6 className="text-sm font-medium mb-2">Stat Changes:</h6>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(suggestion.statImprovement).map(([stat, change]) => (
                              <Badge 
                                key={stat} 
                                variant="outline" 
                                className={`text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}
                              >
                                {stat}: {change > 0 ? '+' : ''}{change}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};