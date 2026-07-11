import axiosInstance from './axiosInstance';
import type {
 ApiResponse,
 PageResponse,
 Race,
 RaceListParams,
 CreateRacePayload,
 UpdateRacePayload,
} from '@/types';

export const createRace = (payload: CreateRacePayload) =>
 axiosInstance.post<ApiResponse<Race>>('/races/create', payload).then((r) => r.data.data);

export const getRaceById = (id: number) =>
 axiosInstance.get<ApiResponse<Race>>(`/races/${id}`).then((r) => r.data.data);

export const getRaces = ({ status, page = 0, size = 10 }: RaceListParams = {}) => {
 const params: Record<string, unknown> = { page, size };
 if (status) params.status = status;
 return axiosInstance
 .get<ApiResponse<PageResponse<Race>>>('/races/list', { params })
 .then((r) => r.data.data);
};

export const updateRace = (id: number, payload: UpdateRacePayload) =>
 axiosInstance.put<ApiResponse<Race>>(`/races/update/${id}`, payload).then((r) => r.data.data);

export const deleteRace = (id: number) =>
 axiosInstance.delete<ApiResponse<null>>(`/races/${id}`).then((r) => r.data.data);
