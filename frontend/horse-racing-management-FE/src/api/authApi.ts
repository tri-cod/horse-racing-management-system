import axiosInstance from './axiosInstance';
import type { ApiResponse, LoginPayload, LoginResult, RegisterPayload, UpdateInfoPayload, User } from '@/types';

export const register = (payload: RegisterPayload) =>
 axiosInstance.post<ApiResponse<User>>('/auth/register', payload).then((r) => r.data);

export const login = (payload: LoginPayload) =>
 axiosInstance.post<ApiResponse<LoginResult>>('/auth/login', payload).then((r) => r.data.data);

export const getMe = () =>
 axiosInstance.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data);

export const logoutApi = () =>
 axiosInstance.post<ApiResponse<null>>('/auth/logout').then((r) => r.data);

export const forgotPassword = (email: string) =>
 axiosInstance
 .post<ApiResponse<null>>('/auth/forgot-password', null, { params: { email } })
 .then((r) => r.data);

export const verifyResetOtp = (email: string, otp: string) =>
 axiosInstance
 .post<ApiResponse<null>>('/auth/verify-reset-otp', null, { params: { email, otp } })
 .then((r) => r.data);

export const resetPassword = (otp: string, email: string, newPassWord: string) =>
 axiosInstance
 .post<ApiResponse<null>>('/auth/reset-password', { email, newPassWord }, { params: { otp } })
 .then((r) => r.data);

export const updateInfo = (payload: UpdateInfoPayload) =>
 axiosInstance.put<ApiResponse<User>>('/auth/update-info', payload).then((r) => r.data.data);
