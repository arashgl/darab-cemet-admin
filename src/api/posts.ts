import { PaginatedResponse, Post } from '@/types/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface PostFilters {
  page?: number;
  limit?: number;
  title?: string;
  categoryId?: string;
}

export interface CreatePostData {
  title: string;
  description: string;
  content: string;
  section: string;
  tags?: string[];
  leadPicture?: string;
  categoryId?: number;
}

export interface UpdatePostData extends Partial<CreatePostData> {
  id: string;
}

// Posts API service
export const postsService = {
  getPosts: async (
    filters: PostFilters = {}
  ): Promise<PaginatedResponse<Post>> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.title) params.append('title', filters.title);
    if (filters.categoryId && filters.categoryId !== 'all') {
      params.append('categoryId', filters.categoryId);
    }

    const response = await apiClient.get(`/posts?${params.toString()}`);
    return response.data;
  },

  getPost: async (id: string): Promise<Post> => {
    const response = await apiClient.get(`/posts/${id}`);
    return response.data;
  },

  createPost: async (data: CreatePostData): Promise<Post> => {
    const response = await apiClient.post('/posts', data);
    return response.data;
  },

  updatePost: async ({ id, ...data }: UpdatePostData): Promise<Post> => {
    const response = await apiClient.patch(`/posts/${id}`, data);
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },
};

// Posts query keys
export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (filters: PostFilters) => [...postsKeys.lists(), filters] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: string) => [...postsKeys.details(), id] as const,
};

// Posts hooks
export const usePosts = (filters: PostFilters = {}) => {
  return useQuery({
    queryKey: postsKeys.list(filters),
    queryFn: () => postsService.getPosts(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: postsKeys.detail(id),
    queryFn: () => postsService.getPost(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsService.updatePost,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      queryClient.setQueryData(postsKeys.detail(data.id), data);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
};
