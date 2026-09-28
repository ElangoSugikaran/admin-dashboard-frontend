import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CertificateForm } from './CertificateForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function CertificatesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: items, isLoading } = useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      return [{ id: '1', title: 'AWS Cloud Practitioner', issuingBody: 'AWS', date: '2023-01' }];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      setIsFormOpen(false);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
          <p className="text-muted-foreground mt-1">Manage your e-certificates and credentials.</p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Certificate</Button>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-6">
          {isLoading ? <p className="text-muted-foreground text-center">Loading...</p> : items?.length === 0 ? <p className="text-muted-foreground text-center">No certificates found.</p> : (
            <div className="space-y-4">
              {items?.map((item: any) => (
                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-muted/50 transition-colors gap-4">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-muted-foreground">{item.issuingBody}</p>
                    <span className="text-sm text-muted-foreground mt-1">Issued: {item.date}</span>
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
          <DialogHeader><DialogTitle>Add Certificate</DialogTitle></DialogHeader>
          <div className="py-4">
            <CertificateForm onSubmit={(data) => createMutation.mutate(data)} isLoading={createMutation.isPending} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
