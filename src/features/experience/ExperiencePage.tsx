import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ExperienceForm } from './ExperienceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ExperiencePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['experience'],
    queryFn: async () => {
      return [{ id: '1', company: 'Tech Corp', role: 'Software Engineer', startDate: '2022-06', endDate: '' }];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
      setIsFormOpen(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Experience</h1>
          <p className="text-muted-foreground mt-1">Manage your professional experience.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Experience</Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? <p className="text-muted-foreground text-center">Loading...</p> : items?.length === 0 ? <p className="text-muted-foreground text-center">No experience history found.</p> : (
            <div className="space-y-4">
              {items?.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg">{item.role}</h3>
                    <p className="text-muted-foreground font-medium">{item.company}</p>
                    <span className="text-sm text-muted-foreground mt-1">{item.startDate} — {item.endDate || 'Present'}</span>
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
          <DialogHeader><DialogTitle>Add Experience</DialogTitle></DialogHeader>
          <div className="py-4">
            <ExperienceForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
