import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContentSkeleton, PageError } from '@/components/ui/page-feedback';
import { educationService } from '@/services/api/educationService';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { EducationForm } from './EducationForm';
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

export default function EducationPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: items, isLoading, isError, refetch } = useQuery({
    queryKey: ['education'],
    queryFn: educationService.getAll,
  });

  const sortedItems = [...(items || [])].sort((a: any, b: any) => {
    const orderA = typeof a.sortOrder === 'number' ? a.sortOrder : 0;
    const orderB = typeof b.sortOrder === 'number' ? b.sortOrder : 0;
    if (orderA !== orderB) return orderA - orderB;
    return (b.startDate || '').localeCompare(a.startDate || '');
  });

  const createMutation = useMutation({
    mutationFn: educationService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      setIsFormOpen(false);
      toast.success('Education created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create education');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => educationService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      setIsFormOpen(false);
      setSelectedItem(null);
      toast.success('Education updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update education');
    }
  });

  const reorderMutation = useMutation({
    mutationFn: educationService.reorder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      toast.success('Education order updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update order');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: educationService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['education'] });
      setItemToDelete(null);
      toast.success('Education deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete education');
    }
  });

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!sortedItems || sortedItems.length <= 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedItems.length) return;

    const newItems = [...sortedItems];
    const currentItem = newItems[index];
    const targetItem = newItems[targetIndex];

    newItems[index] = targetItem;
    newItems[targetIndex] = currentItem;

    const orders = newItems.map((item, idx) => ({
      id: item.id,
      sortOrder: idx + 1,
    }));

    reorderMutation.mutate(orders);
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Education</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your educational background, degrees, and display order.</p>
        </div>
        <Button onClick={openCreateDialog} className="self-start sm:self-auto gap-2">
          <Plus className="h-4 w-4" /> Add Education
        </Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <ContentSkeleton count={4} />
          ) : isError ? (<PageError message="We could not retrieve this section. Try again." onRetry={() => void refetch()} />) : !sortedItems || sortedItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No education found.</p>
              <Button variant="outline" onClick={openCreateDialog}>Add Education</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedItems.map((item: any, index: number) => (
                <div key={item.id} className="flex items-start justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors overflow-hidden">
                  <div className="min-w-0 flex-1 pr-4">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const IconComp = item.icon ? (lucideIcons as any)[item.icon] : null;
                        return IconComp ? <IconComp className="w-8 h-8 shrink-0" /> : <div className="w-8 h-8 shrink-0 bg-muted rounded-md" />;
                      })()}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg truncate">{item.institution}</h3>
                          <Badge variant="outline" className="text-[11px] shrink-0 font-mono">
                            #{item.sortOrder ?? 0}
                          </Badge>
                          {item.showOnHome && (
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              Home
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground truncate">{item.title}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                      <span>{item.startDate} — {item.endDate || 'Present'}</span>
                      {item.grade && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {item.grade}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Move Up"
                      disabled={index === 0 || reorderMutation.isPending}
                      onClick={() => handleMove(index, 'up')}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Move Down"
                      disabled={index === sortedItems.length - 1 || reorderMutation.isPending}
                      onClick={() => handleMove(index, 'down')}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
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
          <DialogHeader>
            <DialogTitle>{selectedItem ? 'Edit Education' : 'Add Education'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <EducationForm 
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
            <DialogTitle>View Education Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {viewItem && (
              <>
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const IconComp = viewItem.icon ? (lucideIcons as any)[viewItem.icon] : null;
                    return IconComp ? <IconComp className="w-10 h-10 text-primary shrink-0" /> : <div className="w-10 h-10 shrink-0 bg-muted rounded-md" />;
                  })()}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-xl">{viewItem.institution}</h3>
                      <Badge variant="outline" className="text-xs font-mono">
                        Order: #{viewItem.sortOrder ?? 0}
                      </Badge>
                      {viewItem.showOnHome && (
                        <Badge variant="secondary" className="text-xs">
                          Featured on Home
                        </Badge>
                      )}
                      {viewItem.type && (
                        <Badge variant="outline" className="text-xs uppercase">
                          {viewItem.type}
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{viewItem.title}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium block text-sm">Start Date/Year</span>
                    <span className="text-muted-foreground">{viewItem.startDate}</span>
                  </div>
                  <div>
                    <span className="font-medium block text-sm">End Date/Year</span>
                    <span className="text-muted-foreground">{viewItem.endDate || 'Present'}</span>
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
              This will permanently delete the education record at "{itemToDelete?.institution}". This action cannot be undone.
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
