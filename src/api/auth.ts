import { User } from '@/types/dashboard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// Auth API service
export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refreshToken: async (): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  me: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  verifyToken: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },
};

// Auth hooks
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      // Store token and user in localStorage (handled by Recoil effects)
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Invalidate all queries to refresh data with new auth
      queryClient.invalidateQueries();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Clear all cached data
      queryClient.clear();
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      queryClient.clear();
    },
  });
};

export const useVerifyToken = () => {
  return useMutation({
    mutationFn: authService.verifyToken,
    onError: () => {
      // If token verification fails, clear auth state
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  });
};
