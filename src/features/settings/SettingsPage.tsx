import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTheme, type ThemeMode } from '@/store/themeStore';
import { Sun, Moon, Laptop, Check, Palette } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const settingsSchema = z.object({
  heroHeadline: z.string().min(1, 'Headline is required'),
  heroSubheadline: z.string().optional(),
  heroMedia: z.any().optional(), // image or video
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();

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
      await new Promise(resolve => setTimeout(resolve, 600));
      return data;
    },
    onSuccess: () => {
      toast.success('Site settings updated successfully');
    },
    onError: () => {
      toast.error('Failed to update settings');
    }
  });

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    values: initialSettings,
  });

  const themeOptions: { id: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', desc: 'Crisp light background with high contrast text', icon: Sun },
    { id: 'dark', label: 'Dark', desc: 'Sleek dark theme easy on the eyes in low light', icon: Moon },
    { id: 'system', label: 'System', desc: 'Sync automatically with your device settings', icon: Laptop },
  ];

  if (isFetching) return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage global site appearance, theme, and hero section.</p>
      </div>

      {/* Theme & Appearance Section */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Appearance & Theme</CardTitle>
          </div>
          <CardDescription>
            Customize your dashboard interface theme. Changes apply across all pages in real time.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {themeOptions.map((opt) => {
              const isSelected = theme === opt.id;
              const Icon = opt.icon;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    toast.success(`Theme set to ${opt.label} mode`);
                  }}
                  className={`relative flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5 shadow-xs'
                      : 'border-border/80 hover:border-border hover:bg-muted/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-3">
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-sm text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground mt-1 leading-relaxed">{opt.desc}</span>
                  {opt.id === 'system' && isSelected && (
                    <span className="mt-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      Active: {resolvedTheme}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Hero Section Configuration */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <CardTitle className="text-lg">Hero Section Configuration</CardTitle>
          <CardDescription>
            Configure the main introduction headline and media presented on your public portfolio homepage.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6 w-full">
              <FormField
                control={form.control}
                name="heroHeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Headline</FormLabel>
                    <FormControl><Input placeholder="Hi, I am..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroSubheadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-headline</FormLabel>
                    <FormControl><Input placeholder="I build things..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroMedia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Media (Video or Photo)</FormLabel>
                    <FormControl>
                      <FileUpload value={field.value} onChange={field.onChange} accept="image/*,video/*" maxSize={20 * 1024 * 1024} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
