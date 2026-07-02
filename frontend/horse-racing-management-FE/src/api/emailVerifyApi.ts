import axiosInstance from './axiosInstance';
import type { ApiResponse } from '@/types';

export const sendVerificationOtp = (email: string) =>
 axiosInstance
 .post<ApiResponse<null>>('/auth/send-verification-otp', null, { params: { email } })
 .then((r) => r.data);

export const verifyEmail = (email: string, otp: string) =>
 axiosInstance
 .post<ApiResponse<null>>('/auth/verify-email', null, { params: { email, otp } })
 .then((r) => r.data);
