import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ContentSkeleton, PageError } from '@/components/ui/page-feedback';
import { certificatesService } from '@/services/api/certificatesService';
import { Button } from '@/components/ui/button';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { CertificateForm } from './CertificateForm';
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

export default function CertificatesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  
  const queryClient = useQueryClient();

  const { data: items, isLoading, isError, refetch } = useQuery({
    queryKey: ['certificates'],
    queryFn: certificatesService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: certificatesService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setIsFormOpen(false);
      toast.success('Certificate created successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create certificate');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => certificatesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setIsFormOpen(false);
      setSelectedItem(null);
      toast.success('Certificate updated successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update certificate');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: certificatesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setItemToDelete(null);
      toast.success('Certificate deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete certificate');
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage credentials, awards, and certifications.</p>
        </div>
        <Button onClick={openCreateDialog} className="self-start sm:self-auto gap-2">
          <Plus className="h-4 w-4" /> Add Certificate
        </Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <ContentSkeleton count={4} />
          ) : isError ? (<PageError message="We could not retrieve this section. Try again." onRetry={() => void refetch()} />) : !items || items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No certificates found.</p>
              <Button variant="outline" onClick={openCreateDialog}>Add Certificate</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items?.map((item: any) => {
                const imgUrl = item.image?.url || item.file?.url || item.imageUrl;
                return (
                  <div key={item.id} className="flex flex-col justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors overflow-hidden gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt={item.title || item.name} 
                            className="w-12 h-12 object-cover rounded border flex-shrink-0 bg-muted" 
                          />
                        ) : null}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-base truncate" title={item.title || item.name}>
                            {item.title || item.name}
                          </h3>
                          <p className="text-muted-foreground text-sm truncate">
                            {item.issuingBody || item.issuer || 'No issuer specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(item)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item)} title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setItemToDelete(item)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="pt-2 border-t text-xs flex items-center justify-between text-muted-foreground">
                      <span>{item.date ? `Issued: ${item.date}` : 'Date not specified'}</span>
                      {item.category === 'DIGITAL' ? (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-medium">E-Certificate</span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">Primary / Academic</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl w-full max-h-[95vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selectedItem ? 'Edit Certificate' : 'Add Certificate'}</DialogTitle></DialogHeader>
          <div className="py-4">
            <CertificateForm 
              key={selectedItem?.id || 'new'}
              initialValues={selectedItem ? {
                ...selectedItem,
                title: selectedItem.title || selectedItem.name || '',
                issuingBody: selectedItem.issuingBody || selectedItem.issuer || '',
                date: selectedItem.date || (selectedItem.issuedAt ? selectedItem.issuedAt.split('T')[0].substring(0, 7) : ''),
                credentialUrl: selectedItem.credentialUrl || '',
                category: selectedItem.category || 'ACADEMIC',
                file: selectedItem.image ? { id: selectedItem.image.id, url: selectedItem.image.url } 
                     : selectedItem.file?.url ? selectedItem.file 
                     : selectedItem.imageId ? { id: selectedItem.imageId, url: selectedItem.imageUrl || '' }
                     : null,
              } : undefined}
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
            <DialogTitle>View Certificate Details</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {viewItem && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-xl">{viewItem.title || viewItem.name}</h3>
                    <p className="text-muted-foreground">{viewItem.issuingBody || viewItem.issuer || 'No issuer specified'}</p>
                  </div>
                  {viewItem.category === 'DIGITAL' ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">E-Certificate</span>
                  ) : (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">Primary / Academic</span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium block text-sm">Date Issued</span>
                    <span className="text-muted-foreground">{viewItem.date || 'Not specified'}</span>
                  </div>
                </div>

                {viewItem.credentialUrl && (
                  <div>
                    <span className="font-medium block text-sm">Credential URL</span>
                    <a href={viewItem.credentialUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">
                      {viewItem.credentialUrl}
                    </a>
                  </div>
                )}

                {(viewItem.image?.url || viewItem.file?.url || viewItem.imageUrl) && (
                  <div>
                    <span className="font-medium block text-sm mb-2">Certificate Document</span>
                    <div className="border rounded-md overflow-hidden bg-muted flex items-center justify-center p-2">
                      <img 
                        src={viewItem.image?.url || viewItem.file?.url || viewItem.imageUrl} 
                        alt="Certificate" 
                        className="max-h-[350px] w-auto object-contain rounded" 
                      />
                    </div>
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
              This will permanently delete the certificate "{itemToDelete?.title || itemToDelete?.name}". This action cannot be undone.
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
