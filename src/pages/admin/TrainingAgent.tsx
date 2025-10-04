import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { ArrowLeft, Upload, CheckCircle, XCircle, Play, Rocket, AlertCircle } from "lucide-react";

interface TrainingData {
  id: string;
  user_id: string;
  item_id: string | null;
  screenshot_url: string | null;
  original_output: any;
  correction: any;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  expires_at: string | null;
  manual_upload: boolean;
}

interface TrainingRun {
  id: string;
  game_id: string;
  model_version: string;
  status: 'draft' | 'active' | 'archived';
  run_date: string;
  approved_corrections: number;
  notes: string | null;
  started_by: string | null;
}

export default function TrainingAgent() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [trainingRuns, setTrainingRuns] = useState<TrainingRun[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || (profile?.role !== 'admin' && profile?.role !== 'trainer'))) {
      navigate('/dashboard');
    }
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (user && (profile?.role === 'admin' || profile?.role === 'trainer')) {
      fetchTrainingData();
      fetchTrainingRuns();
    }
  }, [user, profile]);

  const fetchTrainingData = async () => {
    const { data, error } = await supabase
      .from('training_data')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching training data:', error);
      toast.error('Failed to fetch training data');
    } else {
      setTrainingData(data || []);
    }
  };

  const fetchTrainingRuns = async () => {
    const { data, error } = await supabase
      .from('training_runs')
      .select('*')
      .order('run_date', { ascending: false });

    if (error) {
      console.error('Error fetching training runs:', error);
      toast.error('Failed to fetch training runs');
    } else {
      setTrainingRuns(data || []);
    }
  };

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('training_data')
      .update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: user?.id })
      .eq('id', id);

    if (error) {
      toast.error('Failed to approve correction');
    } else {
      toast.success('Correction approved');
      fetchTrainingData();
    }
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from('training_data')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) {
      toast.error('Failed to reject correction');
    } else {
      toast.success('Correction rejected');
      fetchTrainingData();
    }
  };

  const handleStartRun = async () => {
    // Count approved corrections
    const approvedCount = trainingData.filter(d => d.status === 'approved').length;
    
    if (approvedCount === 0) {
      toast.error('No approved corrections available');
      return;
    }

    // Generate version number
    const today = new Date();
    const version = `v${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}.001`;

    const { error } = await supabase
      .from('training_runs')
      .insert({
        game_id: selectedGame === 'all' ? '00000000-0000-0000-0000-000000000000' : selectedGame,
        model_version: version,
        status: 'draft',
        approved_corrections: approvedCount,
        started_by: user?.id
      });

    if (error) {
      toast.error('Failed to start training run');
      console.error(error);
    } else {
      toast.success('Training run started');
      fetchTrainingRuns();
    }
  };

  const handleReleaseVersion = async (runId: string) => {
    // Archive old active runs
    await supabase
      .from('training_runs')
      .update({ status: 'archived' })
      .eq('status', 'active');

    // Activate new run
    const { error } = await supabase
      .from('training_runs')
      .update({ status: 'active' })
      .eq('id', runId);

    if (error) {
      toast.error('Failed to release version');
    } else {
      toast.success('Version released successfully');
      fetchTrainingRuns();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500">Rejected</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'active':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500">Active</Badge>;
      case 'archived':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredData = trainingData.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Training Agent</h1>
              <p className="text-muted-foreground">Manage AI training data and model versions</p>
            </div>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Training Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Training Data</DialogTitle>
                <DialogDescription>
                  Upload a new training correction manually
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Item ID (optional)</Label>
                  <Input placeholder="Leave empty for manual upload" />
                </div>
                <div>
                  <Label>Original Output (JSON)</Label>
                  <Textarea placeholder='{"name": "...", "stats": {...}}' rows={4} />
                </div>
                <div>
                  <Label>Correction (JSON)</Label>
                  <Textarea placeholder='{"name": "...", "stats": {...}}' rows={4} />
                </div>
                <Button className="w-full" disabled={isUploading}>
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="corrections" className="space-y-4">
          <TabsList>
            <TabsTrigger value="corrections">Training Corrections</TabsTrigger>
            <TabsTrigger value="runs">Training Runs</TabsTrigger>
          </TabsList>

          <TabsContent value="corrections" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Filter training corrections</CardDescription>
              </CardHeader>
              <CardContent className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Training Corrections ({filteredData.length})</CardTitle>
                <CardDescription>Review and approve training corrections</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((data) => (
                      <TableRow key={data.id}>
                        <TableCell className="font-mono text-xs">{data.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <Badge variant={data.manual_upload ? "default" : "secondary"}>
                            {data.manual_upload ? 'Manual' : 'Auto'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(data.status)}</TableCell>
                        <TableCell>{new Date(data.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {data.expires_at ? new Date(data.expires_at).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          {data.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleApprove(data.id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleReject(data.id)}>
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="runs" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Training Runs</CardTitle>
                  <CardDescription>Manage model training and releases</CardDescription>
                </div>
                <Button onClick={handleStartRun}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Training Run
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Corrections</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trainingRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-mono">{run.model_version}</TableCell>
                        <TableCell>{getStatusBadge(run.status)}</TableCell>
                        <TableCell>{run.approved_corrections}</TableCell>
                        <TableCell>{new Date(run.run_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          {run.status === 'draft' && (
                            <Button size="sm" onClick={() => handleReleaseVersion(run.id)}>
                              <Rocket className="h-4 w-4 mr-1" />
                              Release
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
