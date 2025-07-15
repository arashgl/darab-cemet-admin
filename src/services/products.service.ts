import { Product } from '@/types/product';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, uploadClient } from './api';

export interface CreateProductData {
  name: string;
  type: string;
  description: string;
  features?: string[];
  advantages?: string[];
  applications?: string[];
  technicalSpecs?: string[];
  categoryId?: number;
  image?: File;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

// Products API service
export const productsService = {
  getProducts: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products');
    return response.data || [];
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (data: CreateProductData): Promise<Product> => {
    if (data.image) {
      // Handle file upload
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'image') {
          formData.append('image', value as File);
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item));
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      const response = await uploadClient.post('/products', formData);
      return response.data;
    } else {
      const response = await apiClient.post('/products', data);
      return response.data;
    }
  },

  updateProduct: async (data: UpdateProductData): Promise<Product> => {
    const { id, ...updateData } = data;

    if (updateData.image) {
      // Handle file upload
      const formData = new FormData();
      Object.entries(updateData).forEach(([key, value]) => {
        if (key === 'image') {
          formData.append('image', value as File);
        } else if (Array.isArray(value)) {
          value.forEach((item) => formData.append(`${key}[]`, item));
        } else if (value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      const response = await uploadClient.patch(`/products/${id}`, formData);
      return response.data;
    } else {
      const response = await apiClient.patch(`/products/${id}`, updateData);
      return response.data;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Products hooks
export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: productsService.getProducts,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getProduct(id),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsService.updateProduct,
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.setQueryData(
        productKeys.detail(updatedProduct.id),
        updatedProduct
      );
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productsService.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};
