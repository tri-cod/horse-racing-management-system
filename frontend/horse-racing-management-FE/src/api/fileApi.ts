import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types';

// Generic image upload, shared by every avatar picker (user, horse, jockey,
// trainer, referee, race). The backend stores the file on Cloudinary and returns
// the public HTTPS URL, which callers then persist in their own `avatarUrl` field.
export const uploadImage = (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance
    .post<ApiResponse<string>>('/files/images', formData, {
      // Overrides the instance-wide 10s budget: the request only resolves once the
      // backend has finished relaying the file to Cloudinary.
      timeout: 60_000,
    })
    .then((r) => r.data.data);
};
