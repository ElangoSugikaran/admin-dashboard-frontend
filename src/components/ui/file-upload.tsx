import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
  value?: File | string | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export function FileUpload({ value, onChange, accept = 'image/*', maxSize = 5 * 1024 * 1024 }: FileUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(
    typeof value === 'string' ? value : null
  );

  React.useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    } else if (!value) {
      setPreview(null);
    }
  }, [value]);

  const onDrop = React.useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        onChange(file);
      }
    },
    [onChange]
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
            className="w-full h-auto object-cover max-h-48"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={clearFile}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center w-full max-w-sm h-32 border-2 border-dashed rounded-md cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
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
