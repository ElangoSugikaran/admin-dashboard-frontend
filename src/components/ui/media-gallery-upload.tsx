import * as React from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Image, Loader2, UploadCloud, Video, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { AboutMedia } from '@/services/api/aboutService';

interface MediaGalleryUploadProps {
  value: AboutMedia[];
  onChange: (media: AboutMedia[]) => void;
  onUpload: (file: File) => Promise<{ id: string; url: string; fileName?: string }>;
  maxSize: number;
}

export function MediaGalleryUpload({ value, onChange, onUpload, maxSize }: MediaGalleryUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);

  const onDrop = React.useCallback(
    async (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      fileRejections.forEach(({ file, errors }) => {
        toast.error(`${file.name}: ${errors[0]?.message || 'This file cannot be uploaded.'}`);
      });

      if (acceptedFiles.length === 0) return;

      setIsUploading(true);
      try {
        let updatedMedia = [...value];
        for (const file of acceptedFiles) {
          const toastId = toast.loading(`Uploading ${file.name}...`);
          try {
            const uploaded = await onUpload(file);
            updatedMedia = [
              ...updatedMedia,
              {
                id: uploaded.id,
                url: uploaded.url,
                fileName: uploaded.fileName || file.name,
                type: file.type.startsWith('video/') ? 'video' : 'image',
              },
            ];
            onChange(updatedMedia);
            toast.success(`${file.name} uploaded successfully.`, { id: toastId });
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Please try again.';
            toast.error(`Failed to upload ${file.name}: ${message}`, { id: toastId });
          }
        }
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, onUpload, value],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [], 'video/*': [] },
    maxSize,
    multiple: true,
    disabled: isUploading,
  });

  const removeMedia = (id: string) => {
    onChange(value.filter((media) => media.id !== id));
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex min-h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isUploading
            ? 'cursor-wait border-primary/40 bg-primary/5'
            : isDragActive
              ? 'cursor-copy border-primary bg-primary/5'
              : 'cursor-pointer border-border/80 hover:border-primary/50 hover:bg-muted/40'
        }`}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 className="mb-3 h-7 w-7 animate-spin text-primary" />
        ) : (
          <UploadCloud className="mb-3 h-7 w-7 text-muted-foreground" />
        )}
        <p className="text-sm font-medium text-foreground">
          {isUploading ? 'Uploading selected media...' : isDragActive ? 'Drop your files here' : 'Add images and videos'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Select or drag multiple image and video files. Max {Math.round(maxSize / 1024 / 1024)}MB per file.
        </p>
      </div>

      {value.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {value.map((media) => {
            const isVideo = media.type === 'video';
            return (
              <div key={media.id} className="relative overflow-hidden rounded-xl border border-border/80 bg-muted/20">
                {isVideo ? (
                  <video src={media.url} controls className="h-44 w-full bg-black object-contain" />
                ) : (
                  <img
                    src={media.url}
                    alt={media.fileName || 'About Me gallery image'}
                    className="h-44 w-full object-cover"
                  />
                )}
                <div className="flex items-center gap-2 p-3 pr-12">
                  {isVideo ? (
                    <Video className="h-4 w-4 shrink-0 text-amber-500" />
                  ) : (
                    <Image className="h-4 w-4 shrink-0 text-primary" />
                  )}
                  <span className="truncate text-xs font-medium text-foreground">
                    {media.fileName || (isVideo ? 'Video' : 'Image')}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute right-2 top-2 h-8 w-8 rounded-full shadow"
                  onClick={() => removeMedia(media.id)}
                  disabled={isUploading}
                  title={`Remove ${media.fileName || 'media'}`}
                  aria-label={`Remove ${media.fileName || 'media'}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
