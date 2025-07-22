import { MediaItem, MediaResponse } from '@/types/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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

// Mock data for development/testing (fallback only)
const mockMediaData: MediaItem[] = [
  {
    id: '1',
    type: 'gallery',
    title: 'گالری محصولات سیمان',
    description: 'تصاویر محصولات مختلف کارخانه سیمان داراب',
    coverImage: 'https://via.placeholder.com/300x200?text=Gallery+1',
    url: 'https://example.com/gallery/cement-products',
    createdAt: '2024-01-15T10:30:00Z',
    tags: ['محصولات', 'سیمان', 'گالری'],
  },
  {
    id: '2',
    type: 'iframe',
    title: 'ویدیو معرفی کارخانه',
    description: 'ویدیو کامل از فرآیند تولید سیمان',
    coverImage: 'https://via.placeholder.com/300x200?text=Video+Intro',
    url: 'https://example.com/video/factory-intro',
    createdAt: '2024-01-10T14:20:00Z',
    tags: ['ویدیو', 'معرفی', 'تولید'],
  },
  {
    id: '3',
    type: 'url',
    title: 'سایت رسمی شرکت',
    description: 'لینک مستقیم به وبسایت اصلی شرکت',
    coverImage: 'https://via.placeholder.com/300x200?text=Official+Website',
    url: 'https://example.com',
    createdAt: '2024-01-05T09:15:00Z',
    tags: ['وبسایت', 'رسمی'],
  },
  {
    id: '4',
    type: 'gallery',
    title: 'گالری خط تولید',
    description: 'تصاویر از خط تولید و ماشین‌آلات مدرن',
    coverImage: 'https://via.placeholder.com/300x200?text=Production+Line',
    url: 'https://example.com/gallery/production',
    createdAt: '2024-01-12T16:45:00Z',
    tags: ['تولید', 'ماشین‌آلات', 'خط تولید'],
  },
  {
    id: '5',
    type: 'iframe',
    title: 'مصاحبه مدیر عامل',
    description: 'مصاحبه تلویزیونی با مدیر عامل شرکت',
    coverImage: 'https://via.placeholder.com/300x200?text=CEO+Interview',
    url: 'https://example.com/video/ceo-interview',
    createdAt: '2024-01-08T11:30:00Z',
    tags: ['مصاحبه', 'مدیریت', 'تلویزیون'],
  },
];

// List Media API (GET /media)
export const useMediaList = (params: MediaListParams = {}) => {
  const { page = 1, limit = 10, search, type } = params;

  return useQuery({
    queryKey: ['media', { page, limit, search, type }],
    queryFn: async (): Promise<MediaResponse> => {
      try {
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
      } catch {
        // Fallback to mock data if API is not available
        let filteredData = [...mockMediaData];

        // Apply search filter
        if (search) {
          filteredData = filteredData.filter(
            (item) =>
              item.title.toLowerCase().includes(search.toLowerCase()) ||
              (item.description &&
                item.description.toLowerCase().includes(search.toLowerCase()))
          );
        }

        // Apply type filter
        if (type) {
          filteredData = filteredData.filter((item) => item.type === type);
        }

        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
          data: paginatedData,
          meta: {
            totalItems: filteredData.length,
            totalPages: Math.ceil(filteredData.length / limit),
            currentPage: page,
          },
        };
      }
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
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios.post(`${apiUrl}/media/upload`, formData, {
          headers: getAuthHeadersMultipart(),
        });

        return response.data;
      } catch {
        // Fallback for development
        const newMediaItem: MediaItem = {
          id: Date.now().toString(),
          title: file.name,
          type: 'gallery',
          url: URL.createObjectURL(file),
          coverImage: URL.createObjectURL(file),
          createdAt: new Date().toISOString(),
        };

        mockMediaData.unshift(newMediaItem);
        return newMediaItem;
      }
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
      try {
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

          const response = await axios.post(
            `${apiUrl}/media/external`,
            payload,
            {
              headers: getAuthHeaders(),
            }
          );

          return response.data;
        }
      } catch {
        // Fallback for development
        const newMediaItem: MediaItem = {
          id: Date.now().toString(),
          title: data.title,
          description: data.description,
          type: data.type,
          url: data.url || '#',
          coverImage:
            data.coverImage ||
            `https://via.placeholder.com/300x200?text=${encodeURIComponent(
              data.title
            )}`,
          tags: data.tags || [],
          createdAt: new Date().toISOString(),
        };

        mockMediaData.unshift(newMediaItem);
        return newMediaItem;
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
      try {
        await axios.delete(`${apiUrl}/media/${id}`, {
          headers: getAuthHeaders(),
        });
      } catch {
        // Fallback for development
        const index = mockMediaData.findIndex((item) => item.id === id);
        if (index > -1) {
          mockMediaData.splice(index, 1);
        }
      }
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
      try {
        const response = await axios.get(`${apiUrl}/media/${id}`, {
          headers: getAuthHeaders(),
        });
        return response.data;
      } catch {
        // Fallback for development
        const item = mockMediaData.find((item) => item.id === id);
        if (!item) {
          throw new Error('Media item not found');
        }
        return item;
      }
    },
    enabled: !!id,
  });
};
