import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload as UploadIcon, 
  Image as ImageIcon, 
  Zap,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Edit3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import analyzeIcon from "@/assets/analyze-icon.png";

// Mock game data
const supportedGames = [
  { id: "diablo4", name: "Diablo 4", slots: ["Helmet", "Chest", "Legs", "Boots", "Gloves", "Weapon", "Ring"] },
  { id: "raid", name: "RAID: Shadow Legends", slots: ["Helmet", "Chest", "Gloves", "Boots", "Weapon", "Shield"] },
  { id: "wow", name: "World of Warcraft", slots: ["Head", "Shoulder", "Chest", "Wrist", "Hands", "Waist", "Legs", "Feet"] }
];

interface AnalyzedItem {
  id: string;
  name: string;
  slot: string;
  rarity: string;
  stats: Record<string, number>;
  perks: string[];
  sockets: number;
  confidence: number;
  screenshot?: string;
}

export const Upload = () => {
  const [selectedGame, setSelectedGame] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedItems, setAnalyzedItems] = useState<AnalyzedItem[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => 
      file.type === 'image/png' || file.type === 'image/jpeg'
    );

    if (validFiles.length !== files.length) {
      toast({
        title: "Invalid files detected",
        description: "Only PNG and JPEG files are supported",
        variant: "destructive"
      });
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeItems = async () => {
    if (!selectedGame || uploadedFiles.length === 0) {
      toast({
        title: "Missing requirements",
        description: "Please select a game and upload at least one screenshot",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);

    // Simulate AI analysis with mock results
    const mockAnalysis: AnalyzedItem[] = uploadedFiles.map((file, index) => ({
      id: `item-${index}`,
      name: `Legendary ${['Sword', 'Helmet', 'Armor', 'Boots'][index % 4]}`,
      slot: supportedGames.find(g => g.id === selectedGame)?.slots[index % 6] || "Weapon",
      rarity: ['Legendary', 'Epic', 'Rare'][Math.floor(Math.random() * 3)],
      stats: {
        'Attack Power': Math.floor(Math.random() * 500) + 200,
        'Critical Hit Chance': Math.floor(Math.random() * 25) + 5,
        'Defense': Math.floor(Math.random() * 300) + 100
      },
      perks: [
        '+15% Damage to Elites',
        '+10% Critical Strike Damage',
        '+5% Movement Speed'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      sockets: Math.floor(Math.random() * 3),
      confidence: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
      screenshot: URL.createObjectURL(file)
    }));

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    setAnalyzedItems(mockAnalysis);
    setAnalyzing(false);

    toast({
      title: "Analysis complete!",
      description: `Successfully analyzed ${mockAnalysis.length} items`,
    });
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.85) {
      return <Badge className="confidence-high">High ({(confidence * 100).toFixed(0)}%)</Badge>;
    } else if (confidence >= 0.65) {
      return <Badge className="confidence-medium">Medium ({(confidence * 100).toFixed(0)}%)</Badge>;
    } else {
      return <Badge className="confidence-low">Low ({(confidence * 100).toFixed(0)}%)</Badge>;
    }
  };

  const saveToInventory = (item: AnalyzedItem) => {
    toast({
      title: "Item saved!",
      description: `${item.name} has been added to your inventory`,
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={analyzeIcon} alt="Analyze" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Upload & <span className="text-gradient-primary">Analyze</span>
          </h1>
          <p className="text-muted-foreground">
            Upload screenshots of your game items for AI-powered analysis and optimization
          </p>
        </div>

        {/* Game Selection */}
        <Card className="card-gaming mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Select Game</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={setSelectedGame} value={selectedGame}>
              <SelectTrigger className="input-gaming">
                <SelectValue placeholder="Choose your game..." />
              </SelectTrigger>
              <SelectContent>
                {supportedGames.map(game => (
                  <SelectItem key={game.id} value={game.id}>
                    {game.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card className="card-gaming mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UploadIcon className="w-5 h-5 text-accent" />
              <span>Upload Screenshots</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
                <p className="text-muted-foreground">PNG and JPEG files supported</p>
              </label>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
                {uploadedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFile(index)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Analyze Button */}
            <div className="mt-6">
              <Button 
                variant="hero" 
                size="lg" 
                onClick={analyzeItems}
                disabled={analyzing || !selectedGame || uploadedFiles.length === 0}
                className="w-full"
              >
                {analyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Analyze Items
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Progress */}
        {analyzing && (
          <Card className="card-gaming mb-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="animate-pulse">
                  <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
                </div>
                <h3 className="text-lg font-semibold">AI Analysis in Progress</h3>
                <p className="text-muted-foreground">
                  Our AI is analyzing your items using advanced computer vision...
                </p>
                <Progress value={75} className="w-full max-w-md mx-auto" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Results */}
        {analyzedItems.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analysis Results</h2>
              <Badge variant="outline" className="text-success">
                <CheckCircle className="w-4 h-4 mr-1" />
                {analyzedItems.length} Items Detected
              </Badge>
            </div>

            {analyzedItems.map((item, index) => (
              <Card key={item.id} className="card-gaming">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Item Preview */}
                    {item.screenshot && (
                      <div className="space-y-3">
                        <img 
                          src={item.screenshot} 
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-48 object-contain bg-background-tertiary rounded-lg"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Confidence Score</span>
                          {getConfidenceBadge(item.confidence)}
                        </div>
                      </div>
                    )}

                    {/* Item Details */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                        <div className="flex space-x-2 mb-3">
                          <Badge variant="outline">{item.slot}</Badge>
                          <Badge variant="outline">{item.rarity}</Badge>
                          {item.sockets > 0 && (
                            <Badge variant="outline">{item.sockets} Sockets</Badge>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div>
                        <h4 className="font-medium mb-2">Stats</h4>
                        <div className="space-y-2">
                          {Object.entries(item.stats).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{stat}</span>
                              <span className="text-accent font-medium">+{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Perks */}
                      {item.perks.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Perks</h4>
                          <div className="space-y-1">
                            {item.perks.map((perk, perkIndex) => (
                              <div key={perkIndex} className="text-sm text-muted-foreground">
                                • {perk}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex space-x-2 pt-4">
                        <Button 
                          variant="hero" 
                          size="sm"
                          onClick={() => saveToInventory(item)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Save to Inventory
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit3 className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Preview
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};