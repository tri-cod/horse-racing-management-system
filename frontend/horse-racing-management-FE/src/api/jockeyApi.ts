import axiosInstance from './axiosInstance';
import type { ApiResponse, Jockey } from '@/types';

export const getJockeyList = () =>
 axiosInstance.get<ApiResponse<Jockey[]>>('/jockeys').then((r) => r.data.data);

export const getAvailableJockeys = (raceId: number) =>
  axiosInstance
    .get<ApiResponse<Jockey[]>>('/jockeys/available', { params: { raceId } })
    .then((r) => r.data.data);
