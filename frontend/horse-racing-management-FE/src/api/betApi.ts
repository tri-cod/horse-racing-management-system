import axiosInstance from './axiosInstance';
import type { ApiResponse, BetResponse, PlaceBetPayload } from '@/types';

export const placeBet = (payload: PlaceBetPayload) =>
  axiosInstance.post<ApiResponse<BetResponse>>('/bets', payload).then((r) => r.data.data);

export const getMyBets = () =>
  axiosInstance.get<ApiResponse<BetResponse[]>>('/bets/my-bets').then((r) => r.data.data);
