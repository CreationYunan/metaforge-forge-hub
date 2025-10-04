import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Download, Image as ImageIcon } from "lucide-react";

interface BuildCardProps {
  build: {
    id: string;
    name: string;
    game_id: string;
    type: string;
    context: string;
    items: any;
    gems: any;
    feedback: any;
    version: number;
    created_at: string;
  };
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onExportJSON: (build: any) => void;
  onExportImage: (build: any) => void;
}

export function BuildCard({ build, onView, onEdit, onDelete, onExportJSON, onExportImage }: BuildCardProps) {
  // Calculate total stats from items
  const calculateStats = () => {
    const stats: Record<string, number> = {};
    
    if (build.items && typeof build.items === 'object') {
      Object.values(build.items).forEach((item: any) => {
        if (item?.stats) {
          Object.entries(item.stats).forEach(([key, value]) => {
            if (typeof value === 'number') {
              stats[key] = (stats[key] || 0) + value;
            }
          });
        }
      });
    }
    
    return stats;
  };

  const totalStats = calculateStats();
  const aiScore = build.feedback?.overall_score || 0;

  // Get equipment list
  const getEquipment = () => {
    if (!build.items || typeof build.items !== 'object') return [];
    
    return Object.entries(build.items)
      .filter(([_, item]) => item)
      .map(([slot, item]: [string, any]) => ({
        slot,
        name: item.name || 'Unknown',
        rarity: item.rarity || 'Common'
      }))
      .slice(0, 3);
  };

  const equipment = getEquipment();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl">{build.name}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{build.type}</Badge>
              <Badge variant="outline">{build.context}</Badge>
              {aiScore > 0 && (
                <Badge variant="outline" className="bg-primary/10">
                  AI Score: {aiScore}%
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {equipment.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Equipment:</h4>
            <div className="space-y-1">
              {equipment.map((item, idx) => (
                <div key={idx} className="text-sm">
                  <span className="font-medium">{item.slot}:</span>{' '}
                  <span className="text-muted-foreground">
                    {item.rarity} {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {Object.keys(totalStats).length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Total Stats:</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(totalStats).slice(0, 4).map(([stat, value]) => (
                <div key={stat} className="text-sm">
                  <span className="text-muted-foreground">{stat}:</span>{' '}
                  <span className="font-medium">+{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {new Date(build.created_at).toLocaleDateString()} | v{build.version}
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={() => onView(build.id)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(build.id)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="outline" onClick={() => onExportJSON(build)}>
            <Download className="h-4 w-4 mr-1" />
            JSON
          </Button>
          <Button size="sm" variant="outline" onClick={() => onExportImage(build)}>
            <ImageIcon className="h-4 w-4 mr-1" />
            Image
          </Button>
          <Button size="sm" variant="destructive" onClick={() => onDelete(build.id)}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
