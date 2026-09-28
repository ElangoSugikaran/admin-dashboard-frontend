import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { useMutation, useQuery } from '@tanstack/react-query';

const settingsSchema = z.object({
  heroHeadline: z.string().min(1, 'Headline is required'),
  heroSubheadline: z.string().optional(),
  heroMedia: z.any().optional(), // image or video
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { data: initialSettings, isLoading: isFetching } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      return {
        heroHeadline: 'Hi, I am a Developer.',
        heroSubheadline: 'I build scalable web applications.',
        heroMedia: null,
      };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: SettingsFormValues) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('Saved settings:', data);
      return data;
    },
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: initialSettings,
  });

  if (isFetching) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global site settings and hero section.</p>
      </div>

      <div className="border rounded-lg bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Hero Section Configuration</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6 w-full">
            <FormField
              control={form.control}
              name="heroHeadline"
              render={({ field }) => (
                <FormItem><FormLabel>Main Headline</FormLabel><FormControl><Input placeholder="Hi, I am..." {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heroSubheadline"
              render={({ field }) => (
                <FormItem><FormLabel>Sub-headline</FormLabel><FormControl><Input placeholder="I build things..." {...field} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="heroMedia"
              render={({ field }) => (
                <FormItem><FormLabel>Hero Media (Video or Photo)</FormLabel><FormControl><FileUpload value={field.value} onChange={field.onChange} accept="image/*,video/*" maxSize={20 * 1024 * 1024} /></FormControl><FormMessage /></FormItem>
              )}
            />
            <Button type="submit" disabled={updateMutation.isPending}>{updateMutation.isPending ? 'Saving...' : 'Save Settings'}</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
