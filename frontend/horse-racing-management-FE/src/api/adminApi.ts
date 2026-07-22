import axiosInstance from './axiosInstance';
import type {
 ApiResponse, PageResponse, User, UserRole, UserStatus, UserListParams, AdminStats, Penalty,
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

export interface AdminCreateUserPayload {
 role: UserRole;
 fullName: string;
 username: string;
 email: string;
 password: string;
 phone?: string;
}

// Admin-only — POST /admin/create reuses the register flow but skips email
// verification, so privileged roles (STAFF, REFEREE…) can be created directly.
export const createUserAccount = (payload: AdminCreateUserPayload) =>
 axiosInstance
 .post<ApiResponse<User>>('/admin/create', payload)
 .then((r) => r.data.data);

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

export const getAdminStats = () =>
 axiosInstance.get<ApiResponse<AdminStats>>('/admin/stats').then((r) => r.data.data);

export const getAllPenalties = () =>
 axiosInstance.get<ApiResponse<Penalty[]>>('/admin/penalties').then((r) => r.data.data);
