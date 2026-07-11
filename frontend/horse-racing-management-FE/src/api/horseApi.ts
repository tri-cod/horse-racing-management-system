import axiosInstance from './axiosInstance';
import type { ApiResponse, HorseCurrentStatusResponse } from '@/types';

export const getAllHorses = () =>
  axiosInstance
    .get<ApiResponse<HorseCurrentStatusResponse[]>>('/horses')
    .then((r) => r.data.data);
