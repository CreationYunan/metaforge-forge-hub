import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Zap, 
  Hammer, 
  Sword, 
  Shield, 
  Star,
  Users,
  TrendingUp,
  Trophy
} from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const Home = () => {
  // Mock statistics - would come from real DB in production
  const stats = {
    supportedGames: 5,
    analyzedItems: 47532,
    avgConfidence: 94.2,
    activeUsers: 8234
  };

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Upload screenshots and get instant item analysis with confidence scoring",
      color: "text-primary"
    },
    {
      icon: Hammer,
      title: "Visual Build Creator",
      description: "Create and customize builds with our intuitive drag-and-drop interface",
      color: "text-accent"
    },
    {
      icon: Sword,
      title: "Metaforge Optimization",
      description: "Let our AI optimize your builds based on current meta and your inventory",
      color: "text-premium"
    },
    {
      icon: TrendingUp,
      title: "Evaluate Agent (Optimizer)",
      description: "AI analysis of your builds with pros, cons, and improvement suggestions",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "Build Management",
      description: "Save, compare, and export your builds with detailed analytics",
      color: "text-success"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background-secondary to-background-tertiary" />
        <div className="absolute inset-0 opacity-20">
          <img 
            src={heroImage} 
            alt="Metaforge Hero" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient-primary">Metaforge</span>
              <br />
              <span className="text-foreground">Level Up Your Gaming</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Upload your RPG items, optimize builds with AI, and dominate the meta. 
              The ultimate platform for competitive gamers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/demo">Try Demo</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-background-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{stats.supportedGames}</div>
              <div className="text-muted-foreground">Supported Games</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">{stats.analyzedItems.toLocaleString()}</div>
              <div className="text-muted-foreground">Items Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-success mb-2">{stats.avgConfidence}%</div>
              <div className="text-muted-foreground">Avg Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-premium mb-2">{stats.activeUsers.toLocaleString()}</div>
              <div className="text-muted-foreground">Active Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to <span className="text-gradient-primary">Dominate</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From item analysis to build optimization, Metaforge provides all the tools 
              you need to stay ahead of the competition.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="card-gaming p-6 text-center">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${feature.color.split('-')[1]} to-${feature.color.split('-')[1]}-light mx-auto mb-4 flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-accent/10 to-premium/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start <span className="text-gradient-primary">Forging</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of gamers who are already optimizing their builds with Metaforge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/register">Sign Up Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/demo">Explore Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};