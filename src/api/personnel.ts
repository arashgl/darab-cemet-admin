import { uploadApi } from '@/lib/api';
import { PaginatedResponse, Personnel, PersonnelType } from '@/types/dashboard';
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

interface PersonnelListParams extends Record<string, unknown> {
  page?: number;
  limit?: number;
  type?: PersonnelType;
  name?: string;
  position?: string;
  search?: string;
}

// Fetch personnel list
export const usePersonnelList = (params?: PersonnelListParams) => {
  return useQuery({
    queryKey: PERSONNEL_KEYS.list(params || {}),
    queryFn: async (): Promise<PaginatedResponse<Personnel>> => {
      const searchParams = new URLSearchParams();

      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.type) searchParams.append('type', params.type);
      if (params?.name) searchParams.append('name', params.name);
      if (params?.position) searchParams.append('position', params.position);
      if (params?.search) searchParams.append('search', params.search);

      const response = await uploadApi.get(
        `/personnel?${searchParams.toString()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single personnel
export const usePersonnel = (id: string) => {
  return useQuery({
    queryKey: PERSONNEL_KEYS.detail(id),
    queryFn: async (): Promise<Personnel> => {
      const response = await uploadApi.get(`/personnel/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Create personnel
export const useCreatePersonnel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData): Promise<Personnel> => {
      const response = await uploadApi.post('/personnel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
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
      const response = await uploadApi.patch(`/personnel/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
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
      await uploadApi.delete(`/personnel/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PERSONNEL_KEYS.lists() });
    },
  });
};
