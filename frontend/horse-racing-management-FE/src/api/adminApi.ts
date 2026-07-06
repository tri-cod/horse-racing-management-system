import axiosInstance from './axiosInstance';
import type { ApiResponse, PageResponse, User, UserRole, UserStatus, UserListParams } from '@/types';

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
