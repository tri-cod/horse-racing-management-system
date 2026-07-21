import axiosInstance from './axiosInstance';
import type { ApiResponse, Report, CreateReportPayload } from '@/types';

export const createReport = (payload: CreateReportPayload) =>
 axiosInstance.post<ApiResponse<Report>>('/reports', payload).then((r) => r.data.data);

export const getMyReports = () =>
 axiosInstance.get<ApiResponse<Report[]>>('/reports/mine').then((r) => r.data.data);
