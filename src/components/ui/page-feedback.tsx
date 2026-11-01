import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function PageLoading({ label = 'Preparing your workspace...' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-64 w-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <LoaderCircle className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ContentSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div role="status" aria-label="Preparing page content" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-xl border p-5">
          <div className="flex gap-3"><Skeleton className="h-10 w-10 rounded-lg" /><Skeleton className="h-4 w-2/3" /></div>
          <Skeleton className="h-3 w-full" /><Skeleton className="h-3 w-4/5" /><Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

export function PageError({
  title = 'This page could not be loaded',
  message = 'Check your connection and try again.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex min-h-64 w-full flex-col items-center justify-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
      <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
      <h2 className="font-semibold text-foreground">{title}</h2>
      <p className="max-w-lg text-sm text-muted-foreground">{message}</p>
      {onRetry && <Button type="button" variant="outline" onClick={onRetry}>Try again</Button>}
    </div>
  );
}
