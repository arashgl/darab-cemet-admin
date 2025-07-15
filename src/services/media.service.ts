import { Media, MediaType, PaginatedResponse } from '@/types/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, uploadClient } from './api';

export interface MediaFilters {
  page?: number;
  limit?: number;
  type?: MediaType;
}

export interface UploadMediaData {
  file: File;
  type: MediaType;
}

// Media API service
export const mediaService = {
  getMedia: async (
    filters: MediaFilters = {}
  ): Promise<PaginatedResponse<Media>> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type) params.append('type', filters.type);

    const response = await apiClient.get(`/media?${params.toString()}`);
    return response.data;
  },

  uploadMedia: async (data: UploadMediaData): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('type', data.type);

    const response = await uploadClient.post('/media/upload', formData);
    return response.data;
  },

  deleteMedia: async (id: string): Promise<void> => {
    await apiClient.delete(`/media/${id}`);
  },
};

// Query keys
export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (filters: MediaFilters) => [...mediaKeys.lists(), filters] as const,
};

// Media hooks
export const useMedia = (filters: MediaFilters = {}) => {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: () => mediaService.getMedia(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mediaService.uploadMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: mediaService.deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
    },
  });
};
