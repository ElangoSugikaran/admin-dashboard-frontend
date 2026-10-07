import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
import { Trash2, Mail, Archive } from 'lucide-react';
import { messagesService, type Message } from '@/services/api/messagesService';
import { toast } from 'sonner';

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Message | null>(null);
  const [filter, setFilter] = useState<'inbox' | 'archived'>('inbox');
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: messagesService.getAll,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { isRead?: boolean; isArchived?: boolean } }) => 
      messagesService.updateStatus(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] }),
    onError: () => toast.error('Failed to update message status'),
  });

  const deleteMessage = useMutation({
    mutationFn: messagesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setItemToDelete(null);
      setSelectedMessage(null);
      toast.success('Message deleted successfully');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete message. Make sure the backend DELETE endpoint is configured.');
      setItemToDelete(null);
    },
  });

  const filteredMessages = messages?.filter(msg => 
    filter === 'archived' ? msg.isArchived : !msg.isArchived
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground mt-1">Inbox for public site contact form submissions.</p>
        </div>
        <div className="flex rounded-md border p-1 bg-muted/20">
          <Button 
            variant={filter === 'inbox' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('inbox')}
            className="w-24"
          >
            Inbox
          </Button>
          <Button 
            variant={filter === 'archived' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('archived')}
            className="w-24"
          >
            Archived
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-0">
          {isLoading ? (
            <p className="p-6 text-muted-foreground text-center">Loading messages...</p>
          ) : filteredMessages.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-2">No {filter} messages found.</p>
              {filter === 'archived' && <p className="text-sm text-muted-foreground">Archived messages will appear here.</p>}
            </div>
          ) : (
            <div className="divide-y">
              {filteredMessages.map((msg: Message) => (
                <div 
                  key={msg.id} 
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.isRead) updateStatusMutation.mutate({ id: msg.id, data: { isRead: true } });
                  }}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${!msg.isRead ? 'bg-muted/10' : ''}`}
                >
                  <div className="flex flex-col overflow-hidden pr-4">
                    <div className="flex items-center gap-2">
                      {!msg.isRead && <div className="w-2 h-2 shrink-0 bg-primary rounded-full"></div>}
                      <h3 className={`text-base truncate ${!msg.isRead ? 'font-semibold' : 'font-medium'}`}>{msg.name}</h3>
                      <span className="text-sm text-muted-foreground hidden sm:inline truncate">&lt;{msg.email}&gt;</span>
                    </div>
                    <p className={`text-sm truncate ${!msg.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{msg.subject || `Message from ${msg.name}`}</p>
                  </div>
                  <div className="text-sm shrink-0 text-muted-foreground mt-2 sm:mt-0 whitespace-nowrap">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedMessage?.subject || `Message from ${selectedMessage?.name || 'Guest'}`}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-semibold text-lg">{selectedMessage?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedMessage?.email}</p>
              </div>
              <p className="text-sm text-muted-foreground">{selectedMessage?.createdAt ? new Date(selectedMessage.createdAt).toLocaleString() : ''}</p>
            </div>
            <div className="whitespace-pre-wrap text-base leading-relaxed min-h-[150px] p-4 bg-muted/30 rounded-md">
              {selectedMessage?.body}
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between items-center w-full gap-2">
            <Button variant="destructive" size="sm" onClick={() => {
              if (selectedMessage) setItemToDelete(selectedMessage);
            }}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  if (selectedMessage) {
                    updateStatusMutation.mutate({ id: selectedMessage.id, data: { isArchived: !selectedMessage.isArchived } });
                    setSelectedMessage(null); // Close the dialog after archiving
                  }
                }}
              >
                <Archive className="h-4 w-4 mr-2" /> 
                {selectedMessage?.isArchived ? 'Move to Inbox' : 'Archive'}
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject || `Message from ${selectedMessage?.name || 'Guest'}`}`}>
                <Mail className="h-4 w-4 mr-2" /> Reply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the message from "{itemToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMessage.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                if (itemToDelete?.id) {
                  deleteMessage.mutate(itemToDelete.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMessage.isPending}
            >
              {deleteMessage.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
