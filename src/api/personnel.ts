import { PostSection, uploadApi } from '@/lib/api';
import { PaginatedResponse, Personnel } from '@/types/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys
export const PERSONNEL_KEYS = {
  all: ['personnel'] as const,
  lists: () => [...PERSONNEL_KEYS.all, 'list'] as const,
  list: (params: Record<string, unknown>) =>
    [...PERSONNEL_KEYS.lists(), { params }] as const,
  details: () => [...PERSONNEL_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...PERSONNEL_KEYS.details(), id] as const,
};

// Fetch personnel list
export const usePersonnelList = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: PERSONNEL_KEYS.list(params || {}),
    queryFn: async (): Promise<PaginatedResponse<Personnel>> => {
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.search) searchParams.append('search', params.search);

      // Add section filter for HR
      searchParams.append('section', PostSection.HR);

      const response = await uploadApi.get(`/posts?${searchParams.toString()}`);

      // Map response from Post format to Personnel format
      const postResponse = response.data;
      const personnelData = postResponse.data.map(
        (post: {
          id: string;
          title: string;
          description: string;
          leadPicture: string;
          createdAt: string;
          updatedAt: string;
        }) => ({
          id: post.id,
          title: post.title,
          personnelInfo: post.description,
          personnelImage: post.leadPicture,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
        })
      );

      return {
        data: personnelData,
        meta: postResponse.meta,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single personnel
export const usePersonnel = (id: string) => {
  return useQuery({
    queryKey: PERSONNEL_KEYS.detail(id),
    queryFn: async (): Promise<Personnel> => {
      const response = await uploadApi.get(`/posts/${id}`);
      const post = response.data;

      // Map response from Post format to Personnel format
      return {
        id: post.id,
        title: post.title,
        personnelInfo: post.description,
        personnelImage: post.leadPicture,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    },
    enabled: !!id,
  });
};

// Create personnel
export const useCreatePersonnel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<Personnel> => {
      const postFormData = new FormData();

      // Get personnel fields and map them to post fields
      const title = formData.get('title');
      const personnelInfo = formData.get('content');
      const personnelImage = formData.get('personnelImage');

      if (title) postFormData.append('title', title);
      if (personnelInfo) postFormData.append('content', personnelInfo); // Map personnelInfo to description
      if (personnelImage) postFormData.append('leadPicture', personnelImage); // Map personnelImage to leadPicture

      // Add required fields for posts
      postFormData.append('section', PostSection.HR);
      postFormData.append('description', '__'); // Empty content for personnel

      const response = await uploadApi.post('/posts', postFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Map response back to Personnel format
      const post = response.data;
      return {
        id: post.id,
        title: post.title,
        personnelInfo: post.description,
        personnelImage: post.leadPicture,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONNEL_KEYS.lists() });
    },
  });
};

// Update personnel
export const useUpdatePersonnel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string;
      formData: FormData;
    }): Promise<Personnel> => {
      // Map personnel fields to post fields and inject section=HR
      const postFormData = new FormData();

      // Get personnel fields and map them to post fields
      const title = formData.get('title');
      const personnelInfo = formData.get('personnelInfo');
      const personnelImage = formData.get('personnelImage');

      if (title) postFormData.append('title', title);
      if (personnelInfo) postFormData.append('description', personnelInfo); // Map personnelInfo to description
      if (personnelImage) postFormData.append('leadPicture', personnelImage); // Map personnelImage to leadPicture

      // Add required fields for posts
      postFormData.append('section', PostSection.HR);
      postFormData.append('content', ''); // Empty content for personnel

      const response = await uploadApi.patch(`/posts/${id}`, postFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Map response back to Personnel format
      const post = response.data;
      return {
        id: post.id,
        title: post.title,
        personnelInfo: post.description,
        personnelImage: post.leadPicture,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: PERSONNEL_KEYS.lists() });
      queryClient.invalidateQueries({
        queryKey: PERSONNEL_KEYS.detail(data.id),
      });
    },
  });
};

// Delete personnel
export const useDeletePersonnel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await uploadApi.delete(`/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONNEL_KEYS.lists() });
    },
  });
};
