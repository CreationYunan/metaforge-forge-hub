import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, Plus } from "lucide-react";

interface GemItem {
  id: string;
  name: string;
  rarity: string;
  stats: Record<string, number>;
  gem_type?: string;
}

interface GemInventorySectionProps {
  gems: GemItem[];
  getRarityColor: (rarity: string) => string;
  onAddGem: () => void;
}

export const GemInventorySection = ({ gems, getRarityColor, onAddGem }: GemInventorySectionProps) => {
  return (
    <Card className="card-gaming">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Gem className="w-4 h-4" />
            <span>Gems</span>
          </div>
          <Button variant="outline" size="sm" onClick={onAddGem}>
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {gems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <p>No gems yet</p>
            <p className="text-xs mt-1">Click Add to create gems</p>
          </div>
        ) : (
          gems.map((gem) => (
            <div key={gem.id} className="p-3 border border-border rounded-lg bg-background-tertiary">
              <h5 className={`text-sm font-medium ${getRarityColor(gem.rarity)} mb-2`}>
                {gem.name}
              </h5>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs">{gem.rarity}</Badge>
                {gem.gem_type && (
                  <Badge variant="outline" className="text-xs">{gem.gem_type}</Badge>
                )}
              </div>
              <div className="space-y-1">
                {Object.entries(gem.stats || {}).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{stat}</span>
                    <span className="text-accent">+{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
