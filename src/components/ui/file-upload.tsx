import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2, ExternalLink, Video, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  value?: { id: string, url: string; fileName?: string } | string | null;
  onChange: (file: { id: string, url: string; fileName?: string } | string | null) => void;
  onUpload?: (file: File) => Promise<{ id: string, url: string; fileName?: string }>;
  accept?: string;
  maxSize?: number; // in bytes
  label?: string;
}

export function FileUpload({ value, onChange, onUpload, accept = 'image/*', maxSize = 10 * 1024 * 1024, label }: FileUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(
    typeof value === 'string' ? value : null
  );
  const [fileName, setFileName] = React.useState<string | null>(null);

  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    if (value && typeof value === 'object' && 'url' in value) {
      setPreview(value.url);
      setFileName((value as any).fileName || (value as any).name || null);
    } else if (typeof value === 'string') {
      setPreview(value);
      setFileName(null);
    } else {
      setPreview(null);
      setFileName(null);
    }
  }, [value]);

  const isPdf = React.useMemo(() => {
    if (!preview) return false;
    const lower = preview.toLowerCase();
    return lower.endsWith('.pdf') || lower.includes('/pdf') || lower.includes('application/pdf');
  }, [preview]);

  const isVideo = React.useMemo(() => {
    if (!preview) return false;
    const lower = preview.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov') || lower.includes('/video/');
  }, [preview]);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (onUpload) {
        try {
          setIsUploading(true);
          const toastId = toast.loading(`Uploading ${file.name}...`);
          const result = await onUpload(file);
          setPreview(result.url);
          setFileName(result.fileName || file.name);
          onChange({ id: result.id, url: result.url, fileName: result.fileName || file.name });
          toast.success('File uploaded successfully!', { id: toastId });
        } catch (error) {
          toast.error('Failed to upload file. Please try again.');
        } finally {
          setIsUploading(false);
        }
      } else {
        onChange(file as any);
      }
    },
    [onChange, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple: false,
  });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setPreview(null);
    setFileName(null);
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative w-full max-w-md rounded-xl border border-border/80 bg-muted/20 p-3 overflow-hidden group">
          {isPdf ? (
            <div className="flex items-center gap-3 p-2">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400">
                <File className="h-6 w-6" />
              </div>
              <div className="flex-1 overflow-hidden pr-6">
                <p className="text-sm font-medium truncate text-foreground">
                  {fileName || 'PDF Document'}
                </p>
                <a
                  href={preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-0.5 font-medium"
                >
                  <ExternalLink className="h-3 w-3" /> View PDF
                </a>
              </div>
            </div>
          ) : isVideo ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pb-1">
                <Video className="h-4 w-4 text-primary" />
                <span>Video Preview</span>
              </div>
              <video
                src={preview}
                controls
                className="w-full h-auto max-h-56 rounded-lg bg-black/90 object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center overflow-hidden rounded-lg bg-background/50">
              <img
                src={preview}
                alt="Uploaded media preview"
                className="w-full h-auto object-cover max-h-56 rounded-lg"
              />
            </div>
          )}

          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-90 hover:opacity-100 transition-opacity rounded-full shadow-xs"
            onClick={clearFile}
            disabled={isUploading}
            title="Remove file"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      ) : isUploading ? (
        <div className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl border-primary/50 bg-primary/5">
          <Loader2 className="h-7 w-7 text-primary animate-spin mb-2" />
          <p className="text-sm text-foreground font-medium">Uploading file...</p>
          <p className="text-xs text-muted-foreground mt-0.5">Please wait a moment</p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center w-full h-44 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDragActive
              ? 'border-primary bg-primary/5 scale-[0.99]'
              : 'border-border/80 hover:border-primary/50 hover:bg-muted/40'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? 'Drop file here' : (label || 'Click or drag file to upload')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Accepts {accept.replace(/\*/g, '').replace(/,/g, ', ')} • Max size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      )}
    </div>
  );
}

