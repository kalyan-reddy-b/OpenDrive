import api from './axios';

export interface FolderDto {
  id: string;
  name: string;
  parentFolderId?: string | null;
  createdAt: string;
}

export interface CreateFolderRequest {
  name: string;
  parentFolderId?: string;
}

export interface PagedResponse<T> {
  success: boolean;
  message?: string;
  data?: T[];
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const foldersApi = {
  getFolders: async (parentFolderId?: string): Promise<PagedResponse<FolderDto>> => {
    const res = await api.get<PagedResponse<FolderDto>>('/Folders', {
      params: { parentFolderId },
    });
    return res.data;
  },

  createFolder: async (data: CreateFolderRequest): Promise<ApiResponse<FolderDto>> => {
    const res = await api.post<ApiResponse<FolderDto>>('/Folders', data);
    return res.data;
  },

  deleteFolder: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete<ApiResponse<null>>(`/Folders/${id}`);
    return res.data;
  },
};
