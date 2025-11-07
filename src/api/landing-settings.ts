import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LandingSetting } from '@/types/dashboard';
import { apiClient, uploadClient } from './client';

const landingSettingsService = {
  getAll: () => apiClient.get<LandingSetting[]>('/landing-settings'),
  getById: (id: string) => apiClient.get<LandingSetting>(`/landing-settings/${id}`),
  create: (formData: FormData) =>
    uploadClient.post<LandingSetting>('/landing-settings', formData),
  update: (id: string, formData: FormData) =>
    uploadClient.patch<LandingSetting>(`/landing-settings/${id}`, formData),
  delete: (id: string) => apiClient.delete(`/landing-settings/${id}`),
};

export const useGetLandingSettings = () =>
  useQuery({
    queryKey: ['landing-settings'],
    queryFn: async () => (await landingSettingsService.getAll()).data,
  });

export const useGetLandingSetting = (id: string) =>
  useQuery({
    queryKey: ['landing-settings', id],
    queryFn: async () => (await landingSettingsService.getById(id)).data,
    enabled: !!id,
  });

export const useCreateLandingSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: landingSettingsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-settings'] });
    },
  });
};

export const useUpdateLandingSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      landingSettingsService.update(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-settings'] });
    },
  });
};

export const useDeleteLandingSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: landingSettingsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landing-settings'] });
    },
  });
};
