import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BuildCard } from "@/components/BuildCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "lucide-react";

export const Builds = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [builds, setBuilds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBuilds();
    }
  }, [user]);

  const fetchBuilds = async () => {
    if (!user) return;

    setIsLoading(true);
    const { data, error } = await supabase
      .from('builds')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching builds:', error);
      toast.error('Failed to load builds');
    } else {
      setBuilds(data || []);
    }
    setIsLoading(false);
  };

  const handleView = (id: string) => {
    navigate(`/builds/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/forge?buildId=${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this build?')) return;

    const { error } = await supabase
      .from('builds')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete build');
    } else {
      toast.success('Build deleted successfully');
      fetchBuilds();
    }
  };

  const handleExportJSON = (build: any) => {
    const jsonString = JSON.stringify(build, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${build.name.replace(/\s+/g, '_')}_build.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Build exported as JSON');
  };

  const handleExportImage = () => {
    toast.info('Image export coming soon!');
  };

  if (loading || isLoading) {
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
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold">My Builds</h1>
              <p className="text-muted-foreground">Manage your saved builds</p>
            </div>
          </div>
          <Button onClick={() => navigate('/forge')}>
            <Plus className="mr-2 h-4 w-4" />
            Create Build
          </Button>
        </div>

        {builds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No builds yet</p>
            <Button onClick={() => navigate('/forge')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Build
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((build) => (
              <BuildCard
                key={build.id}
                build={build}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onExportJSON={handleExportJSON}
                onExportImage={handleExportImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
