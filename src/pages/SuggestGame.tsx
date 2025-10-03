import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Loader2 } from "lucide-react";

export const SuggestGame = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [gameName, setGameName] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameName.trim()) {
      toast({
        title: "Game name required",
        description: "Please enter a game name",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from("game_suggestions")
        .insert({
          user_id: user.id,
          game_name: gameName.trim(),
          details: details.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Suggestion submitted!",
        description: "Thank you for your suggestion. Our team will review it soon."
      });

      setGameName("");
      setDetails("");
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-primary">Suggest</span> a Game
            </h1>
          </div>
          <p className="text-muted-foreground">
            Want to see your favorite game on Metaforge? Let us know!
          </p>
        </div>

        <Card className="card-gaming">
          <CardHeader>
            <CardTitle>Game Suggestion</CardTitle>
            <CardDescription>
              Tell us which game you'd like to see supported on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gameName">Game Name *</Label>
                <Input
                  id="gameName"
                  placeholder="e.g., Path of Exile, Last Epoch..."
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Additional Details (Optional)</Label>
                <Textarea
                  id="details"
                  placeholder="Tell us why you'd like to see this game supported, any specific features you'd like, etc."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={1000}
                  rows={5}
                />
                <p className="text-xs text-muted-foreground">
                  {details.length}/1000 characters
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Suggestion"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
        </div>
      </div>
    </div>
  );
};
