import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play,
  Zap,
  Hammer,
  Sword,
  Shield,
  Eye,
  Info,
  ArrowRight,
  Star,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const demoSteps = [
  {
    id: "upload",
    title: "Upload & Analyze",
    description: "See how AI analyzes game item screenshots",
    icon: Zap,
    color: "accent",
    mockData: {
      itemName: "Legendary Sword of Destruction",
      slot: "Weapon",
      rarity: "Legendary", 
      confidence: 0.94,
      stats: { "Attack Power": 485, "Crit Chance": 18, "Crit Damage": 25 }
    }
  },
  {
    id: "forge",
    title: "Manual Build Creation", 
    description: "Create builds with drag-and-drop interface",
    icon: Hammer,
    color: "primary",
    mockData: {
      buildName: "Demo Tank Build",
      items: 6,
      totalStats: { "Defense": 850, "HP": 1200, "Block Chance": 35 }
    }
  },
  {
    id: "metaforge",
    title: "AI Optimization",
    description: "Watch AI optimize builds based on meta",
    icon: Sword, 
    color: "premium",
    mockData: {
      buildName: "AI Optimized DPS",
      score: 0.92,
      improvements: "+35% Damage", 
      metaAlignment: "Current PvE Meta"
    }
  },
  {
    id: "evaluate",
    title: "Build Analysis",
    description: "Get detailed pros/cons analysis",
    icon: Shield,
    color: "success",
    mockData: {
      score: 0.89,
      pros: ["Excellent damage scaling", "Strong defensive base"],
      cons: ["Lower mobility", "Resource intensive"]
    }
  }
];

export const Demo = () => {
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { toast } = useToast();

  const runDemo = (stepId: string) => {
    setCurrentStep(stepId);
    
    setTimeout(() => {
      setCompletedSteps(prev => [...prev, stepId]);
      setCurrentStep(null);
      toast({
        title: "Demo step completed!",
        description: `${demoSteps.find(s => s.id === stepId)?.title} demo finished`,
      });
    }, 2000);
  };

  const getColorClasses = (color: string) => {
    const classes: Record<string, string> = {
      accent: "from-accent to-accent-dark text-white",
      primary: "from-primary to-primary-dark text-white",
      premium: "from-premium to-premium-dark text-black",
      success: "from-success to-success/80 text-white"
    };
    return classes[color] || "from-muted to-muted-foreground text-white";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-primary to-accent glow-primary">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-4">
            <span className="text-gradient-primary">Metaforge</span> Demo Experience
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the full Metaforge workflow with interactive demos. 
            No account required - see exactly how our AI-powered gaming tools work.
          </p>
        </div>

        {/* Demo Notice */}
        <Alert className="mb-8">
          <Info className="h-4 w-4" />
          <AlertDescription>
            This is a demo environment using mock data. Create an account to use real AI analysis 
            and save your builds permanently.
          </AlertDescription>
        </Alert>

        {/* Demo Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {demoSteps.map((step, index) => {
            const isRunning = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id);
            
            return (
              <Card key={step.id} className={`card-gaming ${isRunning ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${getColorClasses(step.color)}`}>
                        <step.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle className="w-6 h-6 text-success" />
                    )}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  {/* Mock Data Preview */}
                  <div className="mb-4 p-3 bg-background-secondary rounded-lg">
                    <div className="text-xs text-muted-foreground mb-2">Demo Output:</div>
                    {step.id === "upload" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Item:</span>
                          <span className="text-premium font-medium">{step.mockData.itemName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Confidence:</span>
                          <Badge className="confidence-high">{((step.mockData.confidence as number) * 100).toFixed(0)}%</Badge>
                        </div>
                        <div className="text-xs">
                          {Object.entries(step.mockData.stats as Record<string, number>).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between">
                              <span className="text-muted-foreground">{stat}:</span>
                              <span className="text-accent">+{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.id === "forge" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Build:</span>
                          <span className="font-medium">{step.mockData.buildName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Items:</span>
                          <span>{step.mockData.items}/8 slots</span>
                        </div>
                        <div className="text-xs">
                          {Object.entries(step.mockData.totalStats as Record<string, number>).map(([stat, value]) => (
                            <div key={stat} className="flex justify-between">
                              <span className="text-muted-foreground">{stat}:</span>
                              <span className="text-primary">+{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.id === "metaforge" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Build:</span>
                          <span className="font-medium">{step.mockData.buildName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Score:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current text-premium" />
                            <span>{((step.mockData.score as number) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Improvement:</span>
                            <span className="text-success">{step.mockData.improvements}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Meta:</span>
                            <span className="text-accent">{step.mockData.metaAlignment}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {step.id === "evaluate" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Score:</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current text-premium" />
                            <span>{((step.mockData.score as number) * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-success">Pros:</div>
                          {(step.mockData.pros as string[]).map((pro, idx) => (
                            <div key={idx} className="text-xs ml-2">• {pro}</div>
                          ))}
                          <div className="text-warning">Cons:</div>
                          {(step.mockData.cons as string[]).map((con, idx) => (
                            <div key={idx} className="text-xs ml-2">• {con}</div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant={isCompleted ? "outline" : "hero"}
                    onClick={() => runDemo(step.id)}
                    disabled={isRunning}
                    className="w-full"
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Running Demo...
                      </>
                    ) : isCompleted ? (
                      <>
                        <Eye className="w-4 h-4 mr-2" />
                        View Again
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Demo
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <Card className="card-gaming text-center">
          <CardContent className="pt-6">
            <h3 className="text-xl font-semibold mb-4">Ready to Build for Real?</h3>
            <p className="text-muted-foreground mb-6">
              Create your account to start analyzing your actual game items and building optimized setups.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <a href="/register">
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="/premium">View Premium Features</a>
              </Button>
            </div>
            
            {completedSteps.length === demoSteps.length && (
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-center justify-center space-x-2 text-success">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Demo Completed!</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  You've experienced the full Metaforge workflow. Ready to get started?
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};