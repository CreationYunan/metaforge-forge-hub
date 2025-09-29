import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface AddGemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (gemData: { name: string; rarity: string; stats: Record<string, number>; gem_type?: string }) => Promise<boolean>;
}

export const AddGemModal = ({ open, onOpenChange, onAdd }: AddGemModalProps) => {
  const [name, setName] = useState("");
  const [rarity, setRarity] = useState("Common");
  const [gemType, setGemType] = useState("");
  const [statName, setStatName] = useState("");
  const [statValue, setStatValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !statName || !statValue) {
      return;
    }

    setIsSubmitting(true);
    const stats: Record<string, number> = {
      [statName]: parseFloat(statValue)
    };

    const success = await onAdd({
      name,
      rarity,
      stats,
      gem_type: gemType || undefined
    });

    setIsSubmitting(false);

    if (success) {
      // Reset form
      setName("");
      setRarity("Common");
      setGemType("");
      setStatName("");
      setStatValue("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Gem</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Gem Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ruby of Strength"
              className="input-gaming"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rarity">Rarity</Label>
            <Select value={rarity} onValueChange={setRarity}>
              <SelectTrigger id="rarity" className="input-gaming">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Common">Common</SelectItem>
                <SelectItem value="Uncommon">Uncommon</SelectItem>
                <SelectItem value="Rare">Rare</SelectItem>
                <SelectItem value="Epic">Epic</SelectItem>
                <SelectItem value="Legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="type">Gem Type (Optional)</Label>
            <Input
              id="type"
              value={gemType}
              onChange={(e) => setGemType(e.target.value)}
              placeholder="Offensive, Defensive, Utility..."
              className="input-gaming"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="statName">Stat Name</Label>
            <Input
              id="statName"
              value={statName}
              onChange={(e) => setStatName(e.target.value)}
              placeholder="Attack Power, Defense..."
              className="input-gaming"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="statValue">Stat Value</Label>
            <Input
              id="statValue"
              type="number"
              value={statValue}
              onChange={(e) => setStatValue(e.target.value)}
              placeholder="50"
              className="input-gaming"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!name || !statName || !statValue || isSubmitting}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Gem
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
