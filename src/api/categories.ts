import { Category } from '@/types/dashboard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface CategoriesQueryFilters {
  parentId?: number;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  parentId?: number;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: number;
}

// Categories API service
export const categoriesService = {
  getCategories: async (
    filters: CategoriesQueryFilters = {}
  ): Promise<Category[]> => {
    const params = new URLSearchParams();

    if (filters.parentId) {
      params.append('parentId', filters.parentId.toString());
    }

    const response = await apiClient.get(`/categories?${params.toString()}`);
    return response.data;
  },

  getCategory: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  updateCategory: async ({
    id,
    ...data
  }: UpdateCategoryData): Promise<Category> => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

// Categories query keys
export const categoriesKeys = {
  all: ['categories'] as const,
  lists: () => [...categoriesKeys.all, 'list'] as const,
  list: (filters: CategoriesQueryFilters) =>
    [...categoriesKeys.lists(), filters] as const,
  details: () => [...categoriesKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoriesKeys.details(), id] as const,
};

// Categories hooks
export const useCategories = (filters: CategoriesQueryFilters = {}) => {
  return useQuery({
    queryKey: categoriesKeys.list(filters),
    queryFn: () => categoriesService.getCategories(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCategory = (id: number) => {
  return useQuery({
    queryKey: categoriesKeys.detail(id),
    queryFn: () => categoriesService.getCategory(id),
    enabled: !!id,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.updateCategory,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
      queryClient.setQueryData(categoriesKeys.detail(data.id), data);
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: categoriesService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKeys.lists() });
    },
  });
};
