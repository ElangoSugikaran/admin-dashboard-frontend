import { apiClient } from '@/lib/api';

export interface CvDocument {
  id: string;
  title: string;
  fileId: string;
  fileUrl: string;
  publicId: string | null;
  resourceType: string | null;
  mimeType: string | null;
  fileName: string | null;
  fileSize: string | null;
  sizeBytes: number | null;
  isPrimary: boolean;
  uploadedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const MAX_CVS = 5;
export const MAX_CV_SIZE = 10 * 1024 * 1024;

function unwrap<T>(payload: any): T {
  return payload?.data ?? payload;
}

export const cvService = {
  list: async (): Promise<CvDocument[]> => {
    const response = await apiClient.get('/admin/cvs');
    return unwrap<CvDocument[]>(response.data);
  },

  upload: async (file: File, title?: string): Promise<CvDocument> => {
    const formData = new FormData();
    formData.append('file', file);
    if (title?.trim()) formData.append('title', title.trim());

    const response = await apiClient.post('/admin/cvs', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap<CvDocument>(response.data);
  },

  update: async (
    id: string,
    input: { title?: string; file?: File | null },
  ): Promise<CvDocument> => {
    const formData = new FormData();
    if (input.title !== undefined) formData.append('title', input.title);
    if (input.file) formData.append('file', input.file);

    const response = await apiClient.put(`/admin/cvs/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap<CvDocument>(response.data);
  },

  setPrimary: async (id: string): Promise<CvDocument> => {
    const response = await apiClient.patch(`/admin/cvs/${id}/primary`);
    return unwrap<CvDocument>(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/cvs/${id}`);
  },

  preview: async (cv: CvDocument): Promise<void> => {
    const previewWindow = window.open('', '_blank');

    try {
      const response = await apiClient.get(`/admin/cvs/${cv.id}/download`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      if (!previewWindow) {
        throw new Error('Please allow pop-ups to preview the CV.');
      }

      previewWindow.location.href = url;
      window.setTimeout(() => window.URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      previewWindow?.close();
      throw error;
    }
  },

  download: async (cv: CvDocument): Promise<void> => {
    const response = await apiClient.get(`/admin/cvs/${cv.id}/download`, {
      responseType: 'blob',
    });

    const disposition = String(response.headers['content-disposition'] ?? '');
    const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    const plainMatch = disposition.match(/filename="([^"]+)"/i);
    const filename = utf8Match?.[1]
      ? decodeURIComponent(utf8Match[1])
      : plainMatch?.[1] || cv.fileName || 'resume.pdf';

    const url = window.URL.createObjectURL(response.data as Blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
