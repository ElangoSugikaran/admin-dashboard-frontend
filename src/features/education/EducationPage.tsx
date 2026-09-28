import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { EducationForm } from './EducationForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function EducationPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['education'],
    queryFn: async () => {
      return [
        { id: '1', institution: 'University of Example', degree: 'B.S. Computer Science', startDate: '2018-08', endDate: '2022-05' },
      ];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      setIsFormOpen(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Education</h1>
          <p className="text-muted-foreground mt-1">Manage your educational background.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Education
        </Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <p className="text-muted-foreground text-center">Loading...</p>
          ) : items?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No education history found.</p>
              <Button variant="outline" onClick={() => setIsFormOpen(true)}>Add Education</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items?.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg">{item.institution}</h3>
                    <p className="text-muted-foreground">{item.degree}</p>
                    <span className="text-sm text-muted-foreground mt-1">
                      {item.startDate} — {item.endDate || 'Present'}
                    </span>
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
            <DialogTitle>Add Education</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <EducationForm 
              onSubmit={(data) => createMutation.mutate(data)} 
              isLoading={createMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
