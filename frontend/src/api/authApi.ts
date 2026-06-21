import api from './axios';

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    userId: string;
    username: string;
    email: string;
    token: string;
    refreshToken: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
  };
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/Auth/register', data);
    return res.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await api.post<AuthResponse>('/Auth/login', data);
    return res.data;
  },
};
