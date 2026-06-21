import api from './axios';
import { type ApiResponse } from './filesApi';

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phone?: string;
  bio?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface SearchedUser {
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const usersApi = {
  /** Update current user's profile details */
  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
    const res = await api.put<ApiResponse<UserProfile>>('/Users/profile', data);
    return res.data;
  },

  /** Change current user's password */
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<null>> => {
    const res = await api.post<ApiResponse<null>>('/Users/password', data);
    return res.data;
  },

  /** Search for other registered users by email or username (for file sharing) */
  searchUsers: async (query: string): Promise<ApiResponse<SearchedUser[]>> => {
    const res = await api.get<ApiResponse<SearchedUser[]>>('/Users/search', {
      params: { query },
    });
    return res.data;
  },
};
