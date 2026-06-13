import api from './axios';

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const notificationsApi = {
  getUnread: async (): Promise<ApiResponse<NotificationDto[]>> => {
    const res = await api.get<ApiResponse<NotificationDto[]>>('/Notifications');
    return res.data;
  },

  markAsRead: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.post<ApiResponse<null>>(`/Notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<null>> => {
    const res = await api.post<ApiResponse<null>>('/Notifications/read-all');
    return res.data;
  },
};
