import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/api/projectsService';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectForm, type ProjectFormValues } from './ProjectForm';
import { ProjectGanttTable } from '@/components/ui/project-gantt-table';
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
        objectives: values.objectives.map((o: any) => o.value),
        features: values.features.map((f: any) => f.value),
        skillsDemonstrated: values.skillsDemonstrated.map((s: any) => s.value),
        phases: values.phases?.map((p: any, idx: number) => ({
          name: p.name,
          tasks: p.tasks.map((t: any) => t.value).filter(Boolean),
          startDate: p.startDate ? new Date(p.startDate).toISOString() : null,
          endDate: p.endDate ? new Date(p.endDate).toISOString() : null,
          sortOrder: p.sortOrder ?? idx
        })) || [],
        categoryId: values.categoryId === "" ? null : values.categoryId,
        githubUrl: values.githubUrl === "" ? null : values.githubUrl,
        liveUrl: values.liveUrl === "" ? null : values.liveUrl,
        methodology: values.methodology === "" ? null : values.methodology,
        aim: values.aim === "" ? null : values.aim,
        startedAt: values.startedAt === "" ? null : values.startedAt,
        completedAt: values.completedAt === "" ? null : values.completedAt,
        thumbnailId,
        projectMedia: values.projectMedia?.map((m: any) => ({
          mediaId: m.mediaId,
          role: m.role,
          group: m.group === "" ? null : m.group,
          caption: m.caption === "" ? null : m.caption,
          sortOrder: m.sortOrder
        })) || []
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
    phases: selectedProject.phases?.map((p: any) => ({
      id: p.id,
      name: p.name,
      tasks: Array.isArray(p.tasks) ? p.tasks.map((t: string) => ({ value: t })) : [],
      startDate: p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '',
      endDate: p.endDate ? new Date(p.endDate).toISOString().split('T')[0] : '',
      sortOrder: p.sortOrder ?? 0
    })) || [],
    projectMedia: selectedProject.media?.map((m: any) => ({
      mediaId: m.mediaId,
      url: m.media?.url,
      role: m.role,
      group: m.group || '',
      caption: m.caption || '',
      sortOrder: m.sortOrder
    })) || [],
  } : undefined;

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and curate your portfolio projects.</p>
        </div>
        <Button onClick={() => { setEditingId(null); setIsFormOpen(true); }} className="self-start sm:self-auto gap-2">
          <Plus className="h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="border border-border/80 rounded-xl bg-card text-card-foreground shadow-xs">
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <p className="text-muted-foreground text-center py-8">Loading projects...</p>
          ) : projects?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No projects found.</p>
              <Button variant="outline" onClick={() => { setEditingId(null); setIsFormOpen(true); }}>
                Add First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {projects?.map((project: any) => (
                <div key={project.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border border-border/80 rounded-xl hover:bg-muted/40 transition-all shadow-xs">
                  {project.thumbnail?.url ? (
                    <img src={project.thumbnail.url} alt={project.title} className="w-full sm:w-24 h-36 sm:h-24 object-cover rounded-lg shrink-0" />
                  ) : (
                    <div className="w-full sm:w-24 h-24 bg-muted/60 flex items-center justify-center rounded-lg shrink-0 text-muted-foreground text-xs text-center p-2 border border-border/40">
                      No Image
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    <h3 className="font-semibold text-base sm:text-lg truncate text-foreground">{project.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-0.5">{project.shortDescription}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant={project.status === 'PUBLISHED' ? 'default' : 'secondary'} className="text-[11px]">
                        {project.status}
                      </Badge>
                      {project.featured && (
                        <Badge variant="outline" className="border-amber-500/40 text-amber-500 text-[11px] bg-amber-500/10">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-2 sm:mt-0 w-full sm:w-auto shrink-0 justify-end">
                    <Button variant="secondary" size="sm" onClick={() => setViewItem(project)} className="flex-1 sm:flex-initial text-xs">View</Button>
                    <Button variant="outline" size="sm" onClick={() => handleEdit(project)} className="flex-1 sm:flex-initial text-xs">Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => setProjectToDelete(project)} className="flex-1 sm:flex-initial text-xs">Delete</Button>
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

                                {viewItem.category && (
                  <div>
                    <span className="block font-medium text-sm mb-1 text-muted-foreground">Category</span>
                    <Badge variant="outline">{viewItem.category.name}</Badge>
                  </div>
                )}

                {viewItem.technologies && viewItem.technologies.length > 0 && (
                  <div>
                    <span className="block font-medium text-sm mb-2 text-muted-foreground">Technologies</span>
                    <div className="flex flex-wrap gap-1.5">
                      {viewItem.technologies.map((t: any) => (
                        <Badge key={t.id || t.name} variant="secondary" className="text-xs">
                          {t.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {viewItem.aim && (
                  <div className="bg-muted/40 p-3 rounded-lg border">
                    <span className="block font-semibold text-sm mb-1 text-foreground">Aim & Objective</span>
                    <p className="text-sm text-muted-foreground">{viewItem.aim}</p>
                  </div>
                )}

                {viewItem.methodology && (
                  <div className="bg-muted/40 p-3 rounded-lg border">
                    <span className="block font-semibold text-sm mb-1 text-foreground">Methodology & Implementation</span>
                    <p className="text-sm text-muted-foreground">{viewItem.methodology}</p>
                  </div>
                )}

                {viewItem.objectives && viewItem.objectives.length > 0 && (
                  <div className="border p-4 rounded-lg bg-card">
                    <span className="block font-semibold text-sm mb-2 text-foreground">Objectives</span>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {viewItem.objectives.map((obj: string, i: number) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {viewItem.features && viewItem.features.length > 0 && (
                  <div className="border p-4 rounded-lg bg-card">
                    <span className="block font-semibold text-sm mb-2 text-foreground">Core Features</span>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {viewItem.features.map((feat: string, i: number) => (
                        <li key={i}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {viewItem.skillsDemonstrated && viewItem.skillsDemonstrated.length > 0 && (
                  <div className="border p-4 rounded-lg bg-card">
                    <span className="block font-semibold text-sm mb-2 text-foreground">Skills & Innovations Demonstrated</span>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                      {viewItem.skillsDemonstrated.map((skill: string, i: number) => (
                        <li key={i}>{skill}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {viewItem.phases && viewItem.phases.length > 0 && (
                  <div className="border p-4 rounded-lg bg-card/40 shadow-sm">
                    <ProjectGanttTable phases={viewItem.phases} />
                  </div>
                )}

                {viewItem.description && (
                  <div>
                    <span className="block font-medium text-sm mb-2">Full Description</span>
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-4 bg-muted/20"
                      dangerouslySetInnerHTML={{ __html: viewItem.description }}
                    />
                  </div>
                )}

                {viewItem.media && viewItem.media.length > 0 && (
                  <div>
                    <span className="block font-medium text-sm mb-2">Attached Media</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {viewItem.media.map((m: any, idx: number) => (
                        <div key={idx} className="border rounded-md overflow-hidden bg-card shadow-sm">
                          {m.media?.url ? (
                             <img src={m.media.url} alt={m.caption || m.role} className="w-full h-32 object-cover" />
                          ) : (
                             <div className="w-full h-32 bg-muted flex items-center justify-center text-xs">No Preview</div>
                          )}
                          <div className="p-2">
                            <Badge variant="secondary" className="text-[10px] mb-1">{m.role}</Badge>
                            {m.group && <p className="text-xs text-muted-foreground">Tab: {m.group}</p>}
                            {m.caption && <p className="text-xs font-medium truncate" title={m.caption}>{m.caption}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
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
