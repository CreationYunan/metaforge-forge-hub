import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AuditLog = {
  id: string;
  created_at: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: any;
};

export default function Reports() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [criticalLogs, setCriticalLogs] = useState<AuditLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchCriticalLogs();
    }
  }, [isAdmin]);

  const fetchCriticalLogs = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Filter for potentially critical actions
      const critical = (data || []).filter(log => 
        log.action.includes('delete') || 
        log.action.includes('role') || 
        log.action.includes('premium') ||
        log.details?.severity === 'high'
      );

      setCriticalLogs(critical);
    } catch (error) {
      console.error('Error fetching critical logs:', error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Reports & Monitoring</h1>
          <p className="text-muted-foreground">System health and critical actions</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Back to Admin
        </Button>
      </div>

      <Card className="card-gaming border-yellow-500/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Reports System Status
          </CardTitle>
          <CardDescription>
            The dedicated reports system is not yet fully configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            As a temporary measure, this page shows critical audit log entries. 
            A full reports system with user-submitted bug reports and feature requests will be added in a future update.
          </p>
        </CardContent>
      </Card>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle>Critical Audit Logs ({criticalLogs.length})</CardTitle>
          <CardDescription>Recent high-priority system actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {criticalLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">{log.action}</Badge>
                    <Badge variant="outline">{log.entity_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                  {log.details?.summary && (
                    <p className="text-sm">{log.details.summary}</p>
                  )}
                  {log.entity_id && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Entity ID: {log.entity_id}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {criticalLogs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No critical actions logged recently
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
