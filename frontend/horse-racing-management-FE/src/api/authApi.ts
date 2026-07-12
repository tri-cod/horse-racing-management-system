import axiosInstance, { tokenStorage } from './axiosInstance';
import type { ApiResponse, LoginPayload, LoginResult, RegisterPayload, UpdateInfoPayload, User } from '@/types';

// Backend's AuthMeResponse DTO names the photo field `avatar`, while the rest of the
// app (Trainer/Jockey/Horse) uses `avatarUrl` — normalize it here so every other
// caller can just read `user.avatarUrl`.
type RawUser = Omit<User, 'avatarUrl'> & { avatar?: string };
const mapUser = (raw: RawUser): User => {
 const { avatar, ...rest } = raw;
 return { ...rest, avatarUrl: avatar };
};

export const register = (payload: RegisterPayload) =>
 axiosInstance.post<ApiResponse<User>>('/auth/register', payload).then((r) => r.data);

export const login = (payload: LoginPayload) =>
 axiosInstance
 .post<ApiResponse<Omit<LoginResult, 'user'> & { user: RawUser }>>('/auth/login', payload)
 .then((r) => ({ ...r.data.data, user: mapUser(r.data.data.user) }));

export const getMe = () =>
 axiosInstance.get<ApiResponse<RawUser>>('/auth/me').then((r) => mapUser(r.data.data));

export const logoutApi = () => {
 // Read the token synchronously now — by the time the request interceptor
 // would normally attach it, the caller may have already cleared storage.
 const authHeader = tokenStorage.getAuthHeader();
 return axiosInstance
 .post<ApiResponse<null>>('/auth/logout', null, {
 headers: authHeader ? { Authorization: authHeader } : undefined,
 })
 .then((r) => r.data);
};

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

export const updateInfo = ({ avatarUrl, ...rest }: UpdateInfoPayload) =>
  axiosInstance
    .put<ApiResponse<RawUser>>('/auth/me', { ...rest, avatar_url: avatarUrl })
    .then((r) => mapUser(r.data.data));

// Reuses the generic file-upload endpoint (open to any authenticated user,
// not horse-specific in its implementation) since there is no dedicated
// /auth avatar route on the backend.
export const uploadAvatar = (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  return axiosInstance
    .post<ApiResponse<string>>('/horse-owner/horses/avatar', formData)
    .then((r) => r.data.data);
};
