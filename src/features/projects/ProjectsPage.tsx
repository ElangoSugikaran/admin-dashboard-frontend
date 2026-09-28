import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ProjectForm } from './ProjectForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Mock types
interface Project {
  id: string;
  title: string;
  status: string;
  techStack: string[];
}

export default function ProjectsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch projects (mocking it if backend isn't ready)
  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      // return apiClient.get('/projects').then(res => res.data);
      // For now, return mock data since backend isn't connected
      return [
        { id: '1', title: 'Admin Dashboard', status: 'published', techStack: ['React', 'Vite', 'Tailwind'] },
        { id: '2', title: 'E-commerce Platform', status: 'draft', techStack: ['Next.js', 'Prisma', 'Stripe'] },
      ];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // return apiClient.post('/projects', data);
      console.log('Creating project:', data);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsFormOpen(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your portfolio projects here.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Project
        </Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground">
              Loading projects...
            </div>
          ) : projects?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground mb-4">No projects found. Add one to get started.</p>
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>Create Project</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {projects?.map((project: Project) => (
                <div key={project.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-semibold text-lg">{project.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                        {project.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{project.techStack.join(', ')}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <ProjectForm 
              onSubmit={(data) => createMutation.mutate(data)} 
              isLoading={createMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
