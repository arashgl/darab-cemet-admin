import { PaginatedResponse, Post } from '@/types/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';

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

  updatePost: async (data: UpdatePostData): Promise<Post> => {
    const { id, ...updateData } = data;
    const response = await apiClient.patch(`/posts/${id}`, updateData);
    return response.data;
  },

  deletePost: async (id: string): Promise<void> => {
    await apiClient.delete(`/posts/${id}`);
  },
};

// Query keys
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: PostFilters) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

// Posts hooks
export const usePosts = (filters: PostFilters = {}) => {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => postsService.getPosts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const usePost = (id: string) => {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsService.getPost(id),
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsService.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsService.updatePost,
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      queryClient.setQueryData(postKeys.detail(updatedPost.id), updatedPost);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};
