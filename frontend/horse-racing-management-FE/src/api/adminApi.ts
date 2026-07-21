import axiosInstance from './axiosInstance';
import type {
 ApiResponse, PageResponse, User, UserRole, UserStatus, UserListParams,
 Report, ReportReviewAction, AdminStats,
} from '@/types';

export const getUsers = ({ page = 0, size = 10, keyword, role, status }: UserListParams = {}) => {
 const params: Record<string, unknown> = { page, size };
 if (keyword) params.keyword = keyword;
 if (role) params.role = role;
 if (status) params.status = status;
 return axiosInstance
 .get<ApiResponse<PageResponse<User>>>('/admin/users', { params })
 .then((r) => r.data.data);
};

export const updateUserRole = (id: number, roleName: UserRole) =>
 axiosInstance
 .put<ApiResponse<User>>(`/admin/users/${id}/role`, { roleName })
 .then((r) => r.data.data);

export const updateUserStatus = (id: number, status: UserStatus) =>
 axiosInstance
 .put<ApiResponse<User>>(`/admin/users/${id}/status`, { status })
 .then((r) => r.data.data);

export const banHorse = (id: number) =>
 axiosInstance.delete<ApiResponse<string>>(`/admin/horses/${id}`).then((r) => r.data);

export const getPendingReports = () =>
 axiosInstance.get<ApiResponse<Report[]>>('/admin/reports').then((r) => r.data.data);

export const getAllReports = () =>
 axiosInstance.get<ApiResponse<Report[]>>('/admin/reports/all').then((r) => r.data.data);

export const reviewReport = (id: number, action: ReportReviewAction, adminNote?: string) =>
 axiosInstance
 .put<ApiResponse<Report>>(`/admin/reports/${id}/review`, null, { params: { action, adminNote } })
 .then((r) => r.data.data);

export const getAdminStats = () =>
 axiosInstance.get<ApiResponse<AdminStats>>('/admin/stats').then((r) => r.data.data);
