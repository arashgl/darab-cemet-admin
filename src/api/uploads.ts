import { useMutation } from '@tanstack/react-query';
import { uploadClient } from './client';

export interface UploadResponse {
  url: string;
  filename: string;
  originalname: string;
  path: string;
  mimetype: string;
  size: number;
}

// Upload API service
export const uploadService = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await uploadClient.post('/upload', formData);
    return response.data;
  },

  uploadImage: async (file: File): Promise<UploadResponse> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    return uploadService.uploadFile(file);
  },
};

// Upload hooks
export const useUploadFile = () => {
  return useMutation({
    mutationFn: uploadService.uploadFile,
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadService.uploadImage,
  });
};
