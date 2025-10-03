import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Zap, Loader2 } from "lucide-react";

export const Premium = () => {
  const { user, isPremium, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  const features = [
    "Unlimited item uploads",
    "Priority AI processing",
    "Advanced build analytics",
    "Export builds to multiple formats",
    "No ads",
    "Early access to new games",
    "Premium support",
    "Custom build templates"
  ];

  const handlePurchase = () => {
    // Placeholder for payment integration
    alert("Payment integration coming soon! This will integrate with Stripe or similar payment provider.");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Crown className="w-12 h-12 text-premium" />
            <h1 className="text-4xl font-bold">
              <span className="text-gradient-primary">Premium</span>
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock the full power of Metaforge with Premium features
          </p>
        </div>

        {isPremium ? (
          <Card className="card-gaming border-premium">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Badge className="bg-premium text-white px-4 py-2">
                  <Crown className="w-4 h-4 mr-2 inline" />
                  Premium Active
                </Badge>
              </div>
              <CardTitle className="text-2xl">You're a Premium Member!</CardTitle>
              <CardDescription>
                Thank you for supporting Metaforge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-center text-muted-foreground">
                  Enjoy all premium features and exclusive benefits
                </p>
                <div className="grid md:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="w-5 h-5 text-premium flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 text-center">
                  <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <Card className="card-gaming">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Premium Membership</CardTitle>
                <CardDescription>
                  Get access to all premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center py-6">
                    <div className="text-4xl font-bold text-gradient-primary mb-2">
                      $9.99<span className="text-lg text-muted-foreground">/month</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Cancel anytime. No hidden fees.
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-lg flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-premium" />
                      What's Included:
                    </h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Check className="w-5 h-5 text-premium flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="pt-6">
                    <Button
                      className="w-full bg-premium hover:bg-premium/90"
                      size="lg"
                      onClick={handlePurchase}
                    >
                      <Crown className="w-5 h-5 mr-2" />
                      Upgrade to Premium
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-3">
                      Secure payment powered by Stripe
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Testimonials or additional info */}
            <Card className="card-gaming bg-background-secondary">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">
                    Join <span className="font-bold text-premium">2,500+</span> premium members
                  </p>
                  <p className="text-sm text-muted-foreground">
                    who are already optimizing their builds with advanced features
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
};
