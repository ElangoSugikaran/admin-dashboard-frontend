import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/api/projectsService';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectForm, type ProjectFormValues } from './ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function ProjectsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: projectsService.create,
    onSuccess: () => {
      toast.success('Project created successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsFormOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create project');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => projectsService.update(id, data),
    onSuccess: () => {
      toast.success('Project updated successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsFormOpen(false);
      setEditingId(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update project');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: projectsService.delete,
    onSuccess: () => {
      toast.success('Project deleted');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setProjectToDelete(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  });

  const handleSubmit = async (values: ProjectFormValues) => {
    try {
      // FileUpload handles the async upload immediately, so values.thumbnail is an object { id, url }.
      // We just need to assign it to thumbnailId.
      let thumbnailId = values.thumbnail?.id || null;

      // Convert arrays back to flat strings as expected by the backend,
      // and map empty strings to null for optional fields to prevent DB errors.
      const payload = {
        ...values,
        objectives: values.objectives.map(o => o.value),
        features: values.features.map(f => f.value),
        skillsDemonstrated: values.skillsDemonstrated.map(s => s.value),
        categoryId: values.categoryId === "" ? null : values.categoryId,
        githubUrl: values.githubUrl === "" ? null : values.githubUrl,
        liveUrl: values.liveUrl === "" ? null : values.liveUrl,
        methodology: values.methodology === "" ? null : values.methodology,
        aim: values.aim === "" ? null : values.aim,
        startedAt: values.startedAt === "" ? null : values.startedAt,
        completedAt: values.completedAt === "" ? null : values.completedAt,
        thumbnailId
      };

      // Strip out the raw File object from the payload before sending
      delete payload.thumbnail;

      if (editingId) {
        updateMutation.mutate({ id: editingId, data: payload });
      } else {
        createMutation.mutate(payload);
      }
    } catch (error) {
      toast.error('Error handling media upload. Please try again.');
    }
  };

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setIsFormOpen(true);
  };

  const selectedProject = projects?.find((p: any) => p.id === editingId);

  // Form initial values mapped from the backend DTO
  const initialValues = selectedProject ? {
    ...selectedProject,
    thumbnail: selectedProject.thumbnail ? { id: selectedProject.thumbnail.id, url: selectedProject.thumbnail.url } : null,
    objectives: selectedProject.objectives?.map((v: string) => ({ value: v })) || [],
    features: selectedProject.features?.map((v: string) => ({ value: v })) || [],
    skillsDemonstrated: selectedProject.skillsDemonstrated?.map((v: string) => ({ value: v })) || [],
    technologyIds: selectedProject.technologies?.map((t: any) => t.id) || [],
  } : undefined;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio projects.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setIsFormOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <p className="text-muted-foreground text-center">Loading projects...</p>
          ) : projects?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No projects found.</p>
              <Button variant="outline" onClick={() => { setEditingId(null); setIsFormOpen(true); }}>
                Add Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {projects?.map((project: any) => (
                <div key={project.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-md hover:bg-muted/50 transition-colors">
                  {project.thumbnail?.url ? (
                    <img src={project.thumbnail.url} alt={project.title} className="w-24 h-24 object-cover rounded-md flex-shrink-0" />
                  ) : (
                    <div className="w-24 h-24 bg-muted flex items-center justify-center rounded-md flex-shrink-0 text-muted-foreground text-xs text-center p-2">
                      No Image
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate">{project.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{project.shortDescription}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={project.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                      {project.featured && <Badge variant="outline" className="border-yellow-500 text-yellow-600">Featured</Badge>}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
                    <Button variant="secondary" size="sm" onClick={() => setViewItem(project)}>View</Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => setProjectToDelete(project)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Project' : 'Add Project'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ProjectForm
              key={editingId || 'new'}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              isLoading={isSaving}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Project Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {viewItem && (
              <>
                <div className="flex flex-col sm:flex-row gap-6">
                  {viewItem.thumbnail?.url ? (
                    <img src={viewItem.thumbnail.url} alt={viewItem.title} className="w-full sm:w-48 h-auto object-cover rounded-md" />
                  ) : (
                    <div className="w-full sm:w-48 h-32 bg-muted flex items-center justify-center rounded-md">No Image</div>
                  )}
                  <div className="flex-1 space-y-2">
                    <h3 className="text-2xl font-bold">{viewItem.title}</h3>
                    <p className="text-muted-foreground">{viewItem.shortDescription}</p>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge variant={viewItem.status === 'PUBLISHED' ? 'default' : 'secondary'}>{viewItem.status}</Badge>
                      {viewItem.featured && <Badge variant="outline" className="border-yellow-500 text-yellow-600">Featured</Badge>}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {viewItem.liveUrl && (
                    <div>
                      <span className="block font-medium text-sm mb-1">Live URL</span>
                      <a href={viewItem.liveUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                        {viewItem.liveUrl}
                      </a>
                    </div>
                  )}
                  {viewItem.githubUrl && (
                    <div>
                      <span className="block font-medium text-sm mb-1">GitHub URL</span>
                      <a href={viewItem.githubUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                        {viewItem.githubUrl}
                      </a>
                    </div>
                  )}
                </div>

                {viewItem.description && (
                  <div>
                    <span className="block font-medium text-sm mb-2">Full Description</span>
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-4 bg-muted/20"
                      dangerouslySetInnerHTML={{ __html: viewItem.description }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!projectToDelete} onOpenChange={(open) => !open && setProjectToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{projectToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                if (projectToDelete?.id) {
                  deleteMutation.mutate(projectToDelete.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
