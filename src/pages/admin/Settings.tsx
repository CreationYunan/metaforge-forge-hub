import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, CheckCircle2, Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

type AgentConfig = {
  id: string;
  agent_name: string;
  version: string;
  model_name?: string;
  parameters: any;
  active: boolean;
  updated_at: string;
  updated_by?: string;
};

export default function Settings() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [configs, setConfigs] = useState<AgentConfig[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showNewConfigDialog, setShowNewConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AgentConfig | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    agent_name: "",
    version: "",
    model_name: "",
    parameters: "{}"
  });

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchConfigs();
    }
  }, [isAdmin]);

  const fetchConfigs = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('agent_configs')
        .select('*')
        .order('agent_name', { ascending: true })
        .order('version', { ascending: false });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching configs:', error);
      toast({
        title: "Error",
        description: "Failed to load agent configurations",
        variant: "destructive"
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      // Validate JSON
      JSON.parse(formData.parameters);
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Parameters must be valid JSON",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        agent_name: formData.agent_name,
        version: formData.version,
        model_name: formData.model_name || null,
        parameters: JSON.parse(formData.parameters)
      };

      if (editingConfig) {
        const { error } = await supabase
          .from('agent_configs')
          .update(payload)
          .eq('id', editingConfig.id);

        if (error) throw error;

        toast({ title: "Success", description: "Configuration updated" });
      } else {
        const { error } = await supabase
          .from('agent_configs')
          .insert(payload);

        if (error) throw error;

        toast({ title: "Success", description: "Configuration created" });
      }

      // Audit log
      await supabase.functions.invoke('audit-agent', {
        body: {
          entity_type: 'agent_config',
          entity_id: editingConfig?.id,
          action: editingConfig ? 'agent_config_update' : 'agent_config_create',
          summary: `${editingConfig ? 'Updated' : 'Created'} config for ${formData.agent_name}`,
          details: payload
        }
      });

      setShowNewConfigDialog(false);
      setEditingConfig(null);
      setFormData({ agent_name: "", version: "", model_name: "", parameters: "{}" });
      fetchConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (agentName: string, version: string) => {
    try {
      const { error } = await supabase.rpc('set_active_agent_version', {
        p_agent_name: agentName,
        p_version: version
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Version ${version} is now active for ${agentName}`
      });

      fetchConfigs();
    } catch (error) {
      console.error('Error setting active version:', error);
      toast({
        title: "Error",
        description: "Failed to set active version",
        variant: "destructive"
      });
    }
  };

  const groupedConfigs = configs.reduce((acc, config) => {
    if (!acc[config.agent_name]) {
      acc[config.agent_name] = [];
    }
    acc[config.agent_name].push(config);
    return acc;
  }, {} as Record<string, AgentConfig[]>);

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
          <h1 className="text-3xl font-bold text-gradient-primary">Admin Settings</h1>
          <p className="text-muted-foreground">System configuration and agent versioning</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin')}>
          Back to Admin
        </Button>
      </div>

      <Tabs defaultValue="agents" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="agents">Agent Versions</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="space-y-4">
          <Card className="card-gaming">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Agent Version Management</CardTitle>
                  <CardDescription>Configure and manage agent versions and models</CardDescription>
                </div>
                <Button onClick={() => {
                  setShowNewConfigDialog(true);
                  setEditingConfig(null);
                  setFormData({ agent_name: "", version: "", model_name: "", parameters: "{}" });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Version
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedConfigs).map(([agentName, versions]) => (
                <div key={agentName} className="border border-border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    {agentName}
                  </h3>
                  <div className="space-y-2">
                    {versions.map((config) => (
                      <div
                        key={config.id}
                        className="flex items-center justify-between p-3 border border-border rounded hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{config.version}</Badge>
                            {config.active && (
                              <Badge variant="default" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Active
                              </Badge>
                            )}
                            {config.model_name && (
                              <Badge variant="secondary">{config.model_name}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Updated: {new Date(config.updated_at).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {!config.active && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSetActive(agentName, config.version)}
                            >
                              Set Active
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingConfig(config);
                              setFormData({
                                agent_name: config.agent_name,
                                version: config.version,
                                model_name: config.model_name || "",
                                parameters: JSON.stringify(config.parameters, null, 2)
                              });
                              setShowNewConfigDialog(true);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {Object.keys(groupedConfigs).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No agent configurations yet. Create one to get started!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card className="card-gaming">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Global system configuration (coming soon)</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Additional system settings will be available in future updates.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showNewConfigDialog} onOpenChange={setShowNewConfigDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingConfig ? 'Edit' : 'Create'} Agent Configuration</DialogTitle>
            <DialogDescription>
              Configure agent version, model, and parameters
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="agent_name">Agent Name</Label>
              <Input
                id="agent_name"
                placeholder="e.g., evaluate-build-agent"
                value={formData.agent_name}
                onChange={(e) => setFormData({ ...formData, agent_name: e.target.value })}
                disabled={!!editingConfig}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                placeholder="e.g., v2025.10.07.001"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                disabled={!!editingConfig}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model_name">Model Name (optional)</Label>
              <Input
                id="model_name"
                placeholder="e.g., gpt-4o-mini, gemini-pro"
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parameters">Parameters (JSON)</Label>
              <Textarea
                id="parameters"
                placeholder='{"temperature": 0.7, "max_tokens": 1000}'
                value={formData.parameters}
                onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewConfigDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={saving || !formData.agent_name || !formData.version}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingConfig ? 'Update' : 'Create'} Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
