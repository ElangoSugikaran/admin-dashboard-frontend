import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillsService } from '@/services/api/skillsService';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SkillForm } from './SkillForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

export default function SkillsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: items, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: skillsService.getAll,
  });
  
  const createMutation = useMutation({
    mutationFn: skillsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setIsFormOpen(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground mt-1">Manage your technical skills.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? <p className="text-muted-foreground text-center">Loading...</p> : items?.length === 0 ? <p className="text-muted-foreground text-center">No skills found.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{item.category}</Badge>
                      <Badge variant="secondary">{item.proficiency}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Add Skill</DialogTitle></DialogHeader>
          <div className="py-4">
            <SkillForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
