import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

  const { data: items, isLoading } = useQuery({
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground mt-1">Manage your e-certificates and credentials.</p>
        </div>
        <Button onClick={openCreateDialog}><Plus className="mr-2 h-4 w-4" /> Add Certificate</Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? (
            <p className="text-muted-foreground text-center">Loading...</p>
          ) : !items || items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No certificates found.</p>
              <Button variant="outline" onClick={openCreateDialog}>Add Certificate</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items?.map((item: any) => (
                <div key={item.id} className="flex flex-col p-4 border rounded-md hover:bg-muted/50 transition-colors overflow-hidden">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1 pr-4">
                      <h3 className="font-semibold text-lg truncate">{item.title || item.name}</h3>
                      <p className="text-muted-foreground truncate">{item.issuingBody || item.issuer}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewItem(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setItemToDelete(item)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm flex items-center justify-between text-muted-foreground">
                    <span>Issued: {item.date}</span>
                    {item.category === 'DIGITAL' ? (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded font-medium">E-Certificate</span>
                    ) : (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">Primary / Academic</span>
                    )}
                  </div>
                </div>
              ))}
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
                file: selectedItem.image ? { id: selectedItem.image.id, url: selectedItem.image.url } 
                     : selectedItem.file?.url ? selectedItem.file 
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
                    <p className="text-muted-foreground">{viewItem.issuingBody || viewItem.issuer}</p>
                  </div>
                  {viewItem.category === 'DIGITAL' ? (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">E-Certificate</span>
                  ) : (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-medium">Primary / Academic</span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium block text-sm">Date Issued</span>
                    <span className="text-muted-foreground">{viewItem.date}</span>
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

                {viewItem.file && (
                  <div>
                    <span className="font-medium block text-sm mb-2">Certificate Document</span>
                    {viewItem.file.url ? (
                      <div className="border rounded-md overflow-hidden bg-muted flex items-center justify-center p-2">
                        <img src={viewItem.file.url} alt="Certificate" className="max-h-[300px] object-contain" />
                      </div>
                    ) : (
                      <div className="border rounded-md p-4 text-center text-muted-foreground bg-muted/20">
                        {typeof viewItem.file === 'string' ? viewItem.file : 'Document available'}
                      </div>
                    )}
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
