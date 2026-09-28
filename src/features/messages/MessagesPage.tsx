import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Trash2, Mail } from 'lucide-react';

export default function MessagesPage() {
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      return [
        { id: '1', senderName: 'Jane Doe', email: 'jane@example.com', subject: 'Freelance Inquiry', body: 'Hi, I love your portfolio. Are you available for a new project? Let me know your rates.', date: '2023-10-01', read: false },
        { id: '2', senderName: 'Tech Recruiter', email: 'jobs@tech.com', subject: 'Job Opportunity', body: 'We are looking for a full stack developer to join our team.', date: '2023-09-28', read: true },
      ];
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      console.log('Marking as read:', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['messages'] })
  });

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting message:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setSelectedMessage(null);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
        <p className="text-muted-foreground mt-1">Inbox for public site contact form submissions.</p>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm">
        <div className="p-0">
          {isLoading ? <p className="p-6 text-muted-foreground text-center">Loading inbox...</p> : messages?.length === 0 ? <p className="p-6 text-muted-foreground text-center">No messages.</p> : (
            <div className="divide-y">
              {messages?.map((msg: any) => (
                <div 
                  key={msg.id} 
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (!msg.read) markAsRead.mutate(msg.id);
                  }}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors ${!msg.read ? 'bg-muted/10' : ''}`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      {!msg.read && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                      <h3 className={`text-base ${!msg.read ? 'font-semibold' : 'font-medium'}`}>{msg.senderName}</h3>
                      <span className="text-sm text-muted-foreground hidden sm:inline">&lt;{msg.email}&gt;</span>
                    </div>
                    <p className={`text-sm ${!msg.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{msg.subject}</p>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 sm:mt-0 whitespace-nowrap">
                    {msg.date}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selectedMessage?.subject}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="font-semibold text-lg">{selectedMessage?.senderName}</p>
                <p className="text-sm text-muted-foreground">{selectedMessage?.email}</p>
              </div>
              <p className="text-sm text-muted-foreground">{selectedMessage?.date}</p>
            </div>
            <div className="whitespace-pre-wrap text-base leading-relaxed min-h-37.5 p-4 bg-muted/30 rounded-md">
              {selectedMessage?.body}
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between items-center w-full">
            <Button variant="destructive" size="sm" onClick={() => deleteMessage.mutate(selectedMessage?.id)}>
              <Trash2 className="h-4 w-4 mr-2" /> Delete
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => window.location.href = `mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject}`}>
                <Mail className="h-4 w-4 mr-2" /> Reply
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
