import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Gamepad2, Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

interface GameSuggestion {
  id: string;
  game_name: string;
  details: string | null;
  status: string;
  created_at: string;
  user_id: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export const GameSuggestions = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<GameSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate("/dashboard");
      return;
    }

    if (isAdmin) {
      fetchSuggestions();
    }
  }, [isAdmin, authLoading, navigate]);

  const fetchSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from("game_suggestions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSuggestions(data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast({
        title: "Failed to load suggestions",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("game_suggestions")
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Suggestion marked as ${newStatus}`
      });

      fetchSuggestions();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return <Badge className="bg-success"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Open</Badge>;
    }
  };

  const openSuggestions = suggestions.filter(s => s.status === "open");
  const reviewedSuggestions = suggestions.filter(s => s.status !== "open");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              <span className="text-gradient-primary">Game</span> Suggestions
            </h1>
          </div>
          <p className="text-muted-foreground">
            Review and manage game suggestions from users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="card-gaming">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-primary">{openSuggestions.length}</div>
              <div className="text-sm text-muted-foreground">Open</div>
            </CardContent>
          </Card>
          <Card className="card-gaming">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-success">
                {suggestions.filter(s => s.status === "accepted").length}
              </div>
              <div className="text-sm text-muted-foreground">Accepted</div>
            </CardContent>
          </Card>
          <Card className="card-gaming">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-destructive">
                {suggestions.filter(s => s.status === "rejected").length}
              </div>
              <div className="text-sm text-muted-foreground">Rejected</div>
            </CardContent>
          </Card>
        </div>

        {/* Open Suggestions */}
        {openSuggestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Pending Review</h2>
            <div className="space-y-4">
              {openSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="card-gaming">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{suggestion.game_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted {new Date(suggestion.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {getStatusBadge(suggestion.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {suggestion.details && (
                      <p className="text-muted-foreground mb-4">{suggestion.details}</p>
                    )}
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="bg-success hover:bg-success/90"
                        onClick={() => updateStatus(suggestion.id, "accepted")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus(suggestion.id, "rejected")}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Reviewed Suggestions */}
        {reviewedSuggestions.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Reviewed</h2>
            <div className="space-y-4">
              {reviewedSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="card-gaming opacity-75">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{suggestion.game_name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reviewed {suggestion.reviewed_at ? new Date(suggestion.reviewed_at).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      {getStatusBadge(suggestion.status)}
                    </div>
                  </CardHeader>
                  {suggestion.details && (
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{suggestion.details}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {suggestions.length === 0 && (
          <Card className="card-gaming">
            <CardContent className="pt-6 text-center text-muted-foreground">
              No game suggestions yet
            </CardContent>
          </Card>
        )}

        <div className="mt-6">
          <Button variant="outline" onClick={() => navigate("/admin")}>
            ← Back to Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
