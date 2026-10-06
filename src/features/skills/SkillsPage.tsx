import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { skillsService } from '@/services/api/skillsService';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { SkillForm } from './SkillForm';
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
import { toast } from 'sonner';
import * as devIcons from '@dev.icons/react';

export default function SkillsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  
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
      toast.success('Skill created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create skill');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => skillsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setIsFormOpen(false);
      setSelectedItem(null);
      toast.success('Skill updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update skill');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: skillsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      setItemToDelete(null);
      toast.success('Skill deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete skill');
    }
  });

  const openCreateDialog = () => {
    setSelectedItem(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Skills</h1>
          <p className="text-muted-foreground mt-1">Manage your technical skills.</p>
        </div>
        <Button onClick={openCreateDialog}><Plus className="mr-2 h-4 w-4" /> Add Skill</Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? <p className="text-muted-foreground text-center">Loading...</p> : items?.length === 0 ? <p className="text-muted-foreground text-center">No skills found.</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors overflow-hidden">
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComp = item.icon ? (devIcons as any)[item.icon] : null;
                        return IconComp ? <IconComp className="w-5 h-5 shrink-0" /> : null;
                      })()}
                      <h3 className="font-semibold truncate">{item.name}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">
                        {item.category.split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')}
                      </Badge>
                      {item.showInSkills ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400">
                          Visible on Portfolio
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground hover:bg-muted">
                          Hidden
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground self-center">Order: {item.sortOrder}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setItemToDelete(item)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedItem ? 'Edit Skill' : 'Add Skill'}</DialogTitle></DialogHeader>
          <div className="py-4">
            <SkillForm 
              key={selectedItem?.id || 'new'} 
              initialValues={selectedItem || undefined} 
              onSubmit={(data) => {
                if (selectedItem) {
                  updateMutation.mutate({ id: selectedItem.id, data });
                } else {
                  createMutation.mutate(data);
                }
              }} 
              isLoading={createMutation.isPending || updateMutation.isPending} 
            />
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the skill "{itemToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                if (itemToDelete?.id) {
                  deleteMutation.mutate(itemToDelete.id);
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
