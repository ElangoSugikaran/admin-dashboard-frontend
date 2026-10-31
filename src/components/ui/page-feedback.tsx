import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-64 w-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <LoaderCircle className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
      <span className="text-sm">{label}</span>
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
