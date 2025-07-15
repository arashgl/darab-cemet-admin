import { Product } from '@/types/product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';

export interface ProductFilters {
  page?: number;
  limit?: number;
  type?: string;
  categoryId?: number;
}

export interface ProductPaginatedResponse {
  items: Product[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateProductData {
  name: string;
  type: 'cement' | 'concrete' | 'other';
  description: string;
  features: string[];
  advantages: string[];
  applications: string[];
  technicalSpecs: string[];
  categoryId?: number;
  isActive: boolean;
  image?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Products API service
export const productsService = {
  getProducts: async (
    filters: ProductFilters = {}
  ): Promise<ProductPaginatedResponse> => {
    const params = new URLSearchParams();

    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.type) params.append('type', filters.type);
    if (filters.categoryId)
      params.append('categoryId', filters.categoryId.toString());

    const response = await apiClient.get(`/products?${params.toString()}`);
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  updateProduct: async ({
    id,
    ...data
  }: UpdateProductData): Promise<Product> => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

// Products query keys
export const productsKeys = {
  all: ['products'] as const,
  lists: () => [...productsKeys.all, 'list'] as const,
  list: (filters: ProductFilters) =>
    [...productsKeys.lists(), filters] as const,
  details: () => [...productsKeys.all, 'detail'] as const,
  detail: (id: string) => [...productsKeys.details(), id] as const,
};

// Products hooks
export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: productsKeys.list(filters),
    queryFn: () => productsService.getProducts(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productsKeys.detail(id),
    queryFn: () => productsService.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsService.updateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
      queryClient.setQueryData(productsKeys.detail(data.id), data);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKeys.lists() });
    },
  });
};
