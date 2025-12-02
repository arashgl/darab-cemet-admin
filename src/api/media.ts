import { MediaItem, MediaResponse } from '@/types/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

interface MediaListParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'gallery' | 'iframe' | 'url';
}

// Create headers with auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`,
  };
};

// List Media API (GET /media)
export const useMediaList = (params: MediaListParams = {}) => {
  const { page = 1, limit = 10, search, type } = params;

  return useQuery({
    queryKey: ['media', { page, limit, search, type }],
    queryFn: async (): Promise<MediaResponse> => {
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());

      if (search) {
        searchParams.append('search', search);
      }

      if (type) {
        searchParams.append('type', type);
      }

      const response = await axios.get(
        `${apiUrl}/media?${searchParams.toString()}`,
        {
          headers: getAuthHeaders(),
        }
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Types for create media
export interface CreateMediaData {
  title: string;
  description?: string;
  type: 'gallery' | 'iframe' | 'url';
  url?: string;
  tags?: string[];
  coverImage?: string; // URL string for iframe/url types
  galleryFiles?: File[];
}

// Upload Media Files (POST /media/upload)
export const useUploadMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<MediaItem> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${apiUrl}/media/upload`, formData, {
        headers: getAuthHeadersMultipart(),
      });

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

// Create External Media (POST /media/external)
export const useCreateExternalMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMediaData): Promise<MediaItem> => {
      if (data.type === 'gallery' && data.galleryFiles) {
        // Upload gallery with multiple files
        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('type', data.type);

        if (data.description) {
          formData.append('description', data.description);
        }

        if (data.tags && data.tags.length > 0) {
          formData.append('tags', data.tags.join(','));
        }

        data.galleryFiles.forEach((file) => {
          formData.append('galleryFiles', file);
        });

        const response = await axios.post(
          `${apiUrl}/media/external`,
          formData,
          {
            headers: getAuthHeadersMultipart(),
          }
        );

        return response.data;
      } else {
        // Create URL or iframe type media - both require URL and coverImage
        if (!data.url) {
          throw new Error('URL is required for iframe and url types');
        }

        if (!data.coverImage) {
          throw new Error('Cover image is required for iframe and url types');
        }

        // Send as JSON payload as per DTO specification
        const payload = {
          type: data.type,
          title: data.title,
          url: data.url as string, // Safe to cast since we validated above
          coverImage: data.coverImage,
          description: data.description,
          tags: data.tags || [],
        };

        const response = await axios.post(`${apiUrl}/media/external`, payload, {
          headers: getAuthHeaders(),
        });

        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

// Delete Media (DELETE /media/:id)
export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await axios.delete(`${apiUrl}/media/${id}`, {
        headers: getAuthHeaders(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

// Get single media item (GET /media/:id)
export const useMediaItem = (id: string) => {
  return useQuery({
    queryKey: ['media', id],
    queryFn: async (): Promise<MediaItem> => {
      const response = await axios.get(`${apiUrl}/media/${id}`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    },
    enabled: !!id,
  });
};
