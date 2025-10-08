import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, Copy, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AgentLog = {
  id: string;
  timestamp: string;
  agent_name: string;
  input: any;
  output: any;
  status: string;
  execution_time_ms: number;
  error_message?: string;
};

export default function AgentLogs() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AgentLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AgentLog | null>(null);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchLogs();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterLogs();
  }, [logs, agentFilter, statusFilter]);

  const fetchLogs = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('agent_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast({
        title: "Error",
        description: "Failed to load agent logs",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (agentFilter !== "all") {
      filtered = filtered.filter(log => log.agent_name === agentFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    setFilteredLogs(filtered);
  };

  const getUniqueAgents = () => {
    const agents = new Set(logs.map(log => log.agent_name));
    return Array.from(agents).sort();
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`
    });
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
          <h1 className="text-3xl font-bold text-gradient-primary">Agent Logs</h1>
          <p className="text-muted-foreground">Monitor edge function executions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchLogs} variant="outline">
            Refresh
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin')}>
            Back to Admin
          </Button>
        </div>
      </div>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Filter logs by agent and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {getUniqueAgents().map(agent => (
                  <SelectItem key={agent} value={agent}>{agent}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="card-gaming">
        <CardHeader>
          <CardTitle>Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-semibold">{log.agent_name}</p>
                    <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="gap-1">
                      {log.status === 'success' ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {log.status}
                    </Badge>
                    <Badge variant="outline">{log.execution_time_ms}ms</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                  {log.error_message && (
                    <p className="text-sm text-destructive">{log.error_message}</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedLog(log)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No logs found matching the filters
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Details - {selectedLog?.agent_name}</DialogTitle>
            <DialogDescription>
              {selectedLog && new Date(selectedLog.timestamp).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Input</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog.input, null, 2), 'Input')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(selectedLog.input, null, 2)}
                </pre>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">Output</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(JSON.stringify(selectedLog.output, null, 2), 'Output')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
                  {JSON.stringify(selectedLog.output, null, 2)}
                </pre>
              </div>

              {selectedLog.error_message && (
                <div>
                  <h3 className="font-semibold mb-2 text-destructive">Error Message</h3>
                  <p className="bg-destructive/10 p-4 rounded-lg text-sm text-destructive">
                    {selectedLog.error_message}
                  </p>
                </div>
              )}

              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Status: {selectedLog.status}</span>
                <span>Execution Time: {selectedLog.execution_time_ms}ms</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
