import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContentSkeleton, PageError } from '@/components/ui/page-feedback';
import { experienceService } from '@/services/api/experienceService';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { ExperienceForm } from './ExperienceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
import * as lucideIcons from 'lucide-react';

export default function ExperiencePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);

  const queryClient = useQueryClient();

  const { data: items, isLoading, isError, refetch } = useQuery({
    queryKey: ['experience'],
    queryFn: experienceService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: experienceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
      setIsFormOpen(false);
      toast.success('Experience created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create experience');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => experienceService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
      setIsFormOpen(false);
      setSelectedItem(null);
      toast.success('Experience updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update experience');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: experienceService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience'] });
      setItemToDelete(null);
      toast.success('Experience deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete experience');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Experience</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your professional career and work history.</p>
        </div>
        <Button onClick={openCreateDialog} className="self-start sm:self-auto gap-2">
          <Plus className="h-4 w-4" /> Add Experience
        </Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <ContentSkeleton count={4} />
          ) : isError ? (<PageError message="We could not retrieve this section. Try again." onRetry={() => void refetch()} />) : !items || items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No experience found.</p>
              <Button variant="outline" onClick={openCreateDialog}>Add Experience</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items?.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors overflow-hidden">
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const IconComp = item.icon ? (lucideIcons as any)[item.icon] : null;
                        return IconComp ? <IconComp className="w-8 h-8 shrink-0" /> : <div className="w-8 h-8 shrink-0 bg-muted rounded-md" />;
                      })()}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg truncate">{item.role || item.position}</h3>
                        <div className="flex items-center text-muted-foreground font-medium truncate">
                          {item.company}
                          {item.companyUrl && (
                            <a href={item.companyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center ml-2 text-primary hover:text-primary/80 transition-colors" title="Visit Company Website">
                              <lucideIcons.ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <span>{item.startDate} — {item.endDate || 'Present'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setViewItem(item)}>
                      <Eye className="h-4 w-4" />
                    </Button>
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
          <DialogHeader><DialogTitle>{selectedItem ? 'Edit Experience' : 'Add Experience'}</DialogTitle></DialogHeader>
          <div className="py-4">
            <ExperienceForm 
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

      <Dialog open={!!viewItem} onOpenChange={(open) => !open && setViewItem(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl w-full">
          <DialogHeader>
            <DialogTitle>View Experience Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {viewItem && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const IconComp = viewItem.icon ? (lucideIcons as any)[viewItem.icon] : null;
                    return IconComp ? <IconComp className="w-10 h-10 text-primary shrink-0" /> : <div className="w-10 h-10 shrink-0 bg-muted rounded-md" />;
                  })()}
                  <div>
                    <h3 className="font-bold text-xl">{viewItem.role || viewItem.position}</h3>
                    <div className="flex items-center text-muted-foreground">
                      {viewItem.company}
                      {viewItem.companyUrl && (
                        <a href={viewItem.companyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center ml-2 text-primary hover:text-primary/80 transition-colors">
                          <lucideIcons.ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium block text-sm">Start Date</span>
                    <span className="text-muted-foreground">{viewItem.startDate}</span>
                  </div>
                  <div>
                    <span className="font-medium block text-sm">End Date</span>
                    <span className="text-muted-foreground">{viewItem.isCurrent ? 'Present' : (viewItem.endDate || 'N/A')}</span>
                  </div>
                </div>

                {viewItem.description && (
                  <div>
                    <span className="font-medium block text-sm mb-1">Description</span>
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none border rounded-md p-3 bg-muted/20"
                      dangerouslySetInnerHTML={{ __html: viewItem.description }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the experience record at "{itemToDelete?.company}". This action cannot be undone.
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
