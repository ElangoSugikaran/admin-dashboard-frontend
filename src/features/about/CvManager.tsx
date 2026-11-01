import { useRef, useState, type ChangeEvent } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Download,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { ContentSkeleton } from '@/components/ui/page-feedback';
import {
  cvService,
  MAX_CV_SIZE,
  MAX_CVS,
  type CvDocument,
} from '@/services/api/cvService';

function errorMessage(error: any, fallback: string): string {
  return error?.response?.data?.message || error?.message || fallback;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatSize(cv: CvDocument): string {
  if (cv.fileSize) return cv.fileSize;
  if (!cv.sizeBytes) return 'Unknown size';
  return formatBytes(cv.sizeBytes);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function deriveTitle(fileName: string): string {
  const base = fileName.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();
  return base ? base.replace(/\b\w/g, (char) => char.toUpperCase()) : 'Curriculum Vitae';
}

function validatePdf(file: File): string | null {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) return 'Only PDF files are accepted.';
  if (file.size > MAX_CV_SIZE) return 'CV file size must not exceed 10MB.';
  return null;
}

export function CvManager() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<CvDocument | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<CvDocument | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const { data: cvs = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['cvs'],
    queryFn: cvService.list,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['cvs'] });
    queryClient.invalidateQueries({ queryKey: ['aboutMe'] });
  };

  const uploadMutation = useMutation({
    mutationFn: ({ file, cvTitle }: { file: File; cvTitle?: string }) =>
      cvService.upload(file, cvTitle),
    onSuccess: () => {
      toast.success('CV uploaded successfully.');
      setSelectedFile(null);
      setTitle('');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to upload CV.')),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, cvTitle, file }: { id: string; cvTitle?: string; file?: File }) =>
      cvService.update(id, { title: cvTitle, file }),
    onSuccess: (_data, variables) => {
      toast.success(variables.file ? 'CV replaced successfully.' : 'CV title updated.');
      setEditingId(null);
      setEditingTitle('');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to update CV.')),
  });

  const primaryMutation = useMutation({
    mutationFn: (id: string) => cvService.setPrimary(id),
    onSuccess: () => {
      toast.success('Primary CV updated.');
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to set primary CV.')),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => cvService.delete(id),
    onSuccess: () => {
      toast.success('CV deleted.');
      setDeleteTarget(null);
      invalidate();
    },
    onError: (err) => toast.error(errorMessage(err, 'Failed to delete CV.')),
  });

  const atLimit = cvs.length >= MAX_CVS;

  const onDrop = (accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    const validation = validatePdf(file);
    if (validation) {
      toast.error(validation);
      return;
    }
    setSelectedFile(file);
    if (!title.trim()) setTitle(deriveTitle(file.name));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: () => toast.error('Select a PDF file up to 10MB.'),
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_CV_SIZE,
    multiple: false,
    disabled: atLimit || uploadMutation.isPending,
  });

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Choose a PDF file first.');
      return;
    }
    const validation = validatePdf(selectedFile);
    if (validation) {
      toast.error(validation);
      return;
    }
    uploadMutation.mutate({ file: selectedFile, cvTitle: title.trim() || undefined });
  };

  const beginReplace = (cv: CvDocument) => {
    setReplaceTarget(cv);
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !replaceTarget) return;

    const validation = validatePdf(file);
    if (validation) {
      toast.error(validation);
      return;
    }

    updateMutation.mutate({ id: replaceTarget.id, file });
    setReplaceTarget(null);
  };

  const beginRename = (cv: CvDocument) => {
    setEditingId(cv.id);
    setEditingTitle(cv.title);
  };

  const saveTitle = (cv: CvDocument) => {
    const nextTitle = editingTitle.trim();
    if (!nextTitle) {
      toast.error('CV label cannot be empty.');
      return;
    }
    updateMutation.mutate({ id: cv.id, cvTitle: nextTitle });
  };

  const handlePreview = async (cv: CvDocument) => {
    setViewingId(cv.id);
    try {
      await cvService.preview(cv);
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to open CV preview.'));
    } finally {
      setViewingId(null);
    }
  };

  const handleDownload = async (cv: CvDocument) => {
    setDownloadingId(cv.id);
    try {
      await cvService.download(cv);
      toast.success('CV download started.');
    } catch (err) {
      toast.error(errorMessage(err, 'Failed to download CV.'));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Curriculum Vitae & Resumes</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Keep up to {MAX_CVS} PDF versions. The primary CV is shown on your public portfolio.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="w-fit border-border/80 text-xs">
              {cvs.length} / {MAX_CVS} uploaded
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-foreground">Saved documents</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="gap-1.5 text-xs"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                Refresh
              </Button>
            </div>

            {isLoading ? (
              <ContentSkeleton count={2} />
            ) : isError ? (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p>Could not retrieve your CV documents. Try again.</p>
                  <Button type="button" variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                    Try again
                  </Button>
                </div>
              </div>
            ) : cvs.length === 0 ? (
              <div className="rounded-xl border border-dashed bg-muted/20 py-10 text-center">
                <FileText className="mx-auto mb-2 h-10 w-10 text-muted-foreground opacity-50" />
                <p className="text-sm font-medium text-foreground">No CVs uploaded yet.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Upload your first PDF below. It will not be uploaded until you click Upload CV.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {cvs.map((cv) => {
                  const isBusy =
                    (updateMutation.isPending && updateMutation.variables?.id === cv.id) ||
                    (primaryMutation.isPending && primaryMutation.variables === cv.id) ||
                    (deleteMutation.isPending && deleteMutation.variables === cv.id);

                  return (
                    <div
                      key={cv.id}
                      className={cn(
                        'flex flex-col gap-3 rounded-xl border p-4 transition-all sm:flex-row sm:items-center sm:justify-between',
                        cv.isPrimary
                          ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20'
                          : 'border-border/70 bg-background/40 hover:border-border/90 hover:bg-background/60',
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <div
                          className={cn(
                            'flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-[10px] font-bold',
                            cv.isPrimary
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
                          )}
                        >
                          PDF
                        </div>

                        <div className="min-w-0 flex-1">
                          {editingId === cv.id ? (
                            <div className="flex items-center gap-1.5">
                              <Input
                                value={editingTitle}
                                onChange={(event) => setEditingTitle(event.target.value)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter') saveTitle(cv);
                                  if (event.key === 'Escape') setEditingId(null);
                                }}
                                className="h-7 max-w-sm text-sm"
                                autoFocus
                              />
                              <Button
                                type="button"
                                size="icon-sm"
                                onClick={() => saveTitle(cv)}
                                disabled={updateMutation.isPending}
                                title="Save label"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                                title="Cancel"
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ) : (
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span className="truncate text-sm font-semibold text-foreground">{cv.title}</span>
                              {cv.isPrimary && (
                                <Badge className="shrink-0 gap-1 px-2 py-0.5 text-[10px]">
                                  <Star className="h-3 w-3" />
                                  Primary
                                </Badge>
                              )}
                            </div>
                          )}

                          <p className="truncate text-xs text-muted-foreground">
                            {cv.fileName || 'resume.pdf'} · {formatSize(cv)} · Uploaded {formatDate(cv.uploadedAt)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-center">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => beginRename(cv)}
                          disabled={isBusy}
                          className="h-8 gap-1 text-xs"
                          title="Rename CV label"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Rename
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => beginReplace(cv)}
                          disabled={isBusy}
                          className="h-8 gap-1 text-xs"
                        >
                          {updateMutation.isPending && updateMutation.variables?.id === cv.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5" />
                          )}
                          Replace
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(cv)}
                          disabled={viewingId === cv.id}
                          className="h-8 gap-1 text-xs"
                          title="View PDF in a new tab"
                        >
                          {viewingId === cv.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ExternalLink className="h-3.5 w-3.5" />
                          )}
                          View
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(cv)}
                          disabled={downloadingId === cv.id}
                          className="h-8 gap-1 text-xs"
                        >
                          {downloadingId === cv.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5" />
                          )}
                          Download
                        </Button>

                        {!cv.isPrimary && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => primaryMutation.mutate(cv.id)}
                            disabled={isBusy}
                            className="h-8 gap-1 text-xs"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Set Primary
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => setDeleteTarget(cv)}
                          disabled={isBusy}
                          title="Delete CV"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-border/60 pt-6">
            <div className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-foreground">Upload a new CV</h3>
            </div>

            {atLimit ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-700 dark:text-amber-300">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>You have reached the {MAX_CVS} CV limit. Delete or replace an existing CV before uploading another.</p>
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border border-border/60 bg-muted/30 p-4">
                <div
                  {...getRootProps()}
                  className={cn(
                    'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-all',
                    isDragActive
                      ? 'border-primary bg-primary/5'
                      : 'border-border/80 hover:border-primary/50 hover:bg-background/60',
                    uploadMutation.isPending && 'pointer-events-none opacity-60',
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-background text-muted-foreground">
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    ) : (
                      <UploadCloud className="h-6 w-6" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {isDragActive ? 'Drop the PDF here' : 'Drag & drop a PDF, or click to browse'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">PDF only · Maximum 10MB</p>
                </div>

                {selectedFile && (
                  <div className="flex flex-col gap-2 rounded-lg border border-border/70 bg-background/70 p-3 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-rose-500" />
                      <span className="truncate text-sm">{selectedFile.name}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatBytes(selectedFile.size)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setTitle('');
                      }}
                      disabled={uploadMutation.isPending}
                      className="h-7 self-end text-xs sm:self-auto"
                    >
                      <X className="h-3.5 w-3.5" />
                      Clear
                    </Button>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="cv-title" className="text-xs font-medium text-foreground">
                    CV label
                  </label>
                  <Input
                    id="cv-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Full Stack Developer CV"
                    maxLength={120}
                    disabled={uploadMutation.isPending}
                  />
                  <p className="text-[11px] text-muted-foreground">
                    Shown in the admin list and on the public portfolio.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadMutation.isPending || atLimit}
                    className="gap-2 text-xs"
                  >
                    {uploadMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload CV'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <input
        ref={replaceInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={handleReplaceFile}
      />

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this CV?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be removed from the portfolio and deleted from Cloudinary. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete CV'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
