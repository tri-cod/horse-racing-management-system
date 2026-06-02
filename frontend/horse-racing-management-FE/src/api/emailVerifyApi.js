import axiosInstance from './axiosInstance';

export const sendVerificationOtp = (email) =>
  axiosInstance.post('/auth/send-verification-otp', null, { params: { email } }).then((res) => res.data);

export const verifyEmail = (email, otp) =>
  axiosInstance.post('/auth/verify-email', null, { params: { email, otp } }).then((res) => res.data);
