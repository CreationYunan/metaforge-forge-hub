import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, ArrowRight, Crown } from "lucide-react";

interface PreOptimizerAdProps {
  onContinue: () => void;
  isPremium?: boolean;
}

export const PreOptimizerAd = ({ onContinue, isPremium }: PreOptimizerAdProps) => {
  if (isPremium) {
    // Premium users skip the ad
    onContinue();
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="card-gaming max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-br from-premium to-accent">
              <Crown className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">
            <span className="text-gradient-primary">Upgrade to Premium</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Get the most out of your builds with premium features
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-background-secondary">
              <Zap className="w-5 h-5 text-premium mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Advanced Optimization</h4>
                <p className="text-sm text-muted-foreground">
                  Get deeper insights and more detailed suggestions for your builds
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-background-secondary">
              <Zap className="w-5 h-5 text-premium mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Unlimited Analyses</h4>
                <p className="text-sm text-muted-foreground">
                  Optimize as many builds as you want without limits
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg bg-background-secondary">
              <Zap className="w-5 h-5 text-premium mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-medium mb-1">Priority Support</h4>
                <p className="text-sm text-muted-foreground">
                  Get help faster with dedicated premium support
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="hero" className="flex-1" asChild>
              <a href="/premium">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade Now
              </a>
            </Button>
            <Button variant="outline" className="flex-1" onClick={onContinue}>
              Continue with Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Free users can still access optimizer with basic features
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
