import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { useState } from "react";

interface Item {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  stats: Record<string, number>;
  item_category?: string;
  socket_count?: number;
}

interface InventorySectionProps {
  items: Item[];
  usedItemIds: string[];
  onAddToSlot: (item: Item) => void;
  getRarityColor: (rarity: string) => string;
}

export const InventorySection = ({ items, usedItemIds, onAddToSlot, getRarityColor }: InventorySectionProps) => {
  // Get unique categories from items
  const categories = Array.from(new Set(items.map(item => item.item_category || item.slot)));
  const [activeCategory, setActiveCategory] = useState(categories[0] || 'all');

  // Filter items: not used + matches category
  const availableItems = items.filter(item => !usedItemIds.includes(item.id));
  
  const filteredItems = activeCategory === 'all' 
    ? availableItems
    : availableItems.filter(item => 
        (item.item_category || item.slot) === activeCategory
      );

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No items in inventory</p>
        <p className="text-sm mt-2">Upload items to start building</p>
      </div>
    );
  }

  return (
    <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
      <TabsList className="w-full flex-wrap h-auto">
        <TabsTrigger value="all">All</TabsTrigger>
        {categories.map(category => (
          <TabsTrigger key={category} value={category}>
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <TabsContent value={activeCategory} className="space-y-3 mt-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No items in this category
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="p-3 border border-border rounded-lg bg-background-tertiary">
              <div className="flex justify-between items-start mb-2">
                <h5 className={`text-sm font-medium ${getRarityColor(item.rarity)}`}>
                  {item.name}
                </h5>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onAddToSlot(item)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-between text-xs mb-2">
                <Badge variant="outline" className="text-xs">{item.slot}</Badge>
                <Badge variant="outline" className="text-xs">{item.rarity}</Badge>
              </div>
              {item.socket_count && item.socket_count > 0 && (
                <div className="text-xs text-muted-foreground mb-2">
                  Sockets: {item.socket_count}
                </div>
              )}
              <div className="space-y-1">
                {Object.entries(item.stats || {}).map(([stat, value]) => (
                  <div key={stat} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{stat}</span>
                    <span className="text-accent">+{value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </TabsContent>
    </Tabs>
  );
};
