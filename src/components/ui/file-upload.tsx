import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FileUploadProps {
  value?: { id: string, url: string } | string | null;
  onChange: (file: { id: string, url: string } | string | null) => void;
  onUpload?: (file: File) => Promise<{ id: string, url: string }>;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUpload({ value, onChange, onUpload, accept = 'image/*', maxSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(
    typeof value === 'string' ? value : null
  );

  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    if (value && typeof value === 'object' && 'url' in value) {
      setPreview(value.url);
    } else if (typeof value === 'string') {
      setPreview(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (onUpload) {
        try {
          setIsUploading(true);
          const toastId = toast.loading('Uploading image...');
          const result = await onUpload(file);
          setPreview(result.url); // Use the returned remote URL for preview
          onChange({ id: result.id, url: result.url }); // Pass both ID and URL back to the form
          toast.success('Image uploaded successfully!', { id: toastId });
        } catch (error) {
          toast.error('Failed to upload image. Please try again.');
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
  };

  return (
    <div className="w-full">
      {preview ? (
        <div className="relative inline-block w-full max-w-sm rounded-md border border-input overflow-hidden group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-auto object-cover max-h-64"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={clearFile}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : isUploading ? (
        <div className="flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-md border-primary/50 bg-muted/20">
          <Loader2 className="h-8 w-8 text-primary animate-spin mb-2" />
          <p className="text-sm text-muted-foreground font-medium">Uploading image...</p>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-md cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:bg-muted/50'
          )}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground font-medium">
            {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Max size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      )}
    </div>
  );
}
