import api from './axios';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface FileDto {
  id: string;
  name: string;
  contentType: string;
  size: number;
  folderId?: string | null;
  createdAt: string;
  updatedAt?: string;
  isFavorite?: boolean;
  isDeleted?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

/** Matches the backend's PagedResponse<T>: `data` is the flat array of items,
 *  with paging metadata as sibling fields (not nested under `data`). */
export interface PagedResponse<T> extends ApiResponse<T[]> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface GetFilesParams {
  pageNumber?: number;
  pageSize?: number;
  folderId?: string;
  category?: string;
  isFavorite?: boolean;
  isTrash?: boolean;
  searchTerm?: string;
}

export type UploadProgressCallback = (percent: number) => void;

// ─── API module ──────────────────────────────────────────────────────────────
export const filesApi = {
  /** List files (paged + filtered) */
  getFiles: async (params: GetFilesParams = {}): Promise<PagedResponse<FileDto>> => {
    const res = await api.get<PagedResponse<FileDto>>('/Files', { params });
    if (import.meta.env.DEV) {
      console.info('[OpenDrive] GET /Files', { params, response: res.data });
    }
    return res.data;
  },

  /** Upload a single file with progress reporting.
   *  Timeout is set explicitly here (not in the interceptor) because axios
   *  resolves Content-Type for FormData after the request interceptor runs. */
  uploadFile: async (
    file: File,
    folderId?: string,
    onProgress?: UploadProgressCallback
  ): Promise<ApiResponse<FileDto>> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) formData.append('folderId', folderId);

    const res = await api.post<ApiResponse<FileDto>>('/Files/upload', formData, {
      // Let axios set Content-Type automatically (includes multipart boundary)
      headers: { 'Content-Type': undefined as unknown as string },
      timeout: 180_000, // 3 minutes — explicit per-request, bypasses interceptor
      onUploadProgress: (evt) => {
        if (onProgress && evt.total && evt.total > 0) {
          onProgress(Math.round((evt.loaded * 100) / evt.total));
        }
      },
    });
    if (import.meta.env.DEV) {
      console.info('[OpenDrive] POST /Files/upload', { file: file.name, folderId, response: res.data });
    }
    return res.data;
  },

  /** Soft-delete (moves to trash) or hard-delete */
  deleteFile: async (id: string, hardDelete = false): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/Files/${id}`, {
      params: { hardDelete },
    });
    return res.data;
  },

  /** Restore a file from trash (soft un-delete) */
  restoreFile: async (id: string): Promise<ApiResponse<FileDto>> => {
    const res = await api.post<ApiResponse<FileDto>>(`/Files/${id}/restore`);
    return res.data;
  },

  /** Toggle the favorite flag */
  toggleFavorite: async (id: string): Promise<ApiResponse<FileDto>> => {
    const res = await api.post<ApiResponse<FileDto>>(`/Files/${id}/favorite`);
    return res.data;
  },

  /** Trigger a browser download */
  downloadFile: async (id: string, name: string): Promise<void> => {
    const res = await api.get(`/Files/${id}/download`, {
      responseType: 'blob',
      timeout: 120_000,
    });
    const url = URL.createObjectURL(new Blob([res.data as BlobPart]));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
