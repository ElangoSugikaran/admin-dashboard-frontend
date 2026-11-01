import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme, type ThemeMode } from '@/store/themeStore';
import { Sun, Moon, Laptop, Check, Palette, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { toast } from 'sonner';
import { mediaService } from '@/services/api/mediaService';
import { settingsService, type BrandLogo } from '@/services/api/settingsService';
import { ContentSkeleton, PageError } from '@/components/ui/page-feedback';

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const queryClient = useQueryClient();
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingsService.getSettings,
  });
  const [selectedBrandLogo, setSelectedBrandLogo] = useState<BrandLogo | null | undefined>(undefined);
  const brandLogo = selectedBrandLogo === undefined
    ? settingsQuery.data?.brandLogo ?? null
    : selectedBrandLogo;

  const updateLogoMutation = useMutation({
    mutationFn: () => settingsService.updateSettings({ brandLogoId: brandLogo?.id || null }),
    onSuccess: (settings) => {
      queryClient.setQueryData(['settings'], settings);
      setSelectedBrandLogo(settings.brandLogo);
      toast.success('Portfolio logo updated successfully.');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Failed to update portfolio logo.';
      toast.error(message);
    },
  });

  const themeOptions: { id: ThemeMode; label: string; desc: string; icon: typeof Sun }[] = [
    { id: 'light', label: 'Light', desc: 'Crisp light background with high contrast text', icon: Sun },
    { id: 'dark', label: 'Dark', desc: 'Sleek dark theme easy on the eyes in low light', icon: Moon },
    { id: 'system', label: 'System', desc: 'Sync automatically with your device settings', icon: Laptop },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage portfolio branding and dashboard appearance.</p>
      </div>

      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <Image className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Portfolio Logo</CardTitle>
          </div>
          <CardDescription>
            This image is used in the public portfolio navbar and footer. It is separate from the About Me profile picture.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {settingsQuery.isLoading && (
            <ContentSkeleton count={1} />
          )}
          {settingsQuery.isError && (
            <PageError message="Could not retrieve the portfolio logo." onRetry={() => void settingsQuery.refetch()} />
          )}
          {!settingsQuery.isLoading && !settingsQuery.isError && (
            <>
              <FileUpload
                value={brandLogo}
                onChange={(file) => setSelectedBrandLogo(file && typeof file !== 'string' ? file : null)}
                onUpload={mediaService.uploadFile}
                accept="image/*"
                maxSize={5 * 1024 * 1024}
                label="Upload the portfolio logo image"
              />
              <p className="text-xs text-muted-foreground">
                Use a square, high-quality image. Updating this logo will not change your About Me portrait.
              </p>
            </>
          )}
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={() => updateLogoMutation.mutate()}
              disabled={settingsQuery.isLoading || settingsQuery.isError || updateLogoMutation.isPending}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {updateLogoMutation.isPending ? 'Saving...' : 'Save Portfolio Logo'}
            </Button>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}
