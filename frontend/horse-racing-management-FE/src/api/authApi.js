import axiosInstance from './axiosInstance';

/**
 * Register a new user
 */
export const register = (payload) =>
  axiosInstance.post('/auth/register', payload).then((res) => res.data);

/**
 * Login user with username and password
 */
export const login = (payload) =>
  axiosInstance.post('/auth/login', payload).then((res) => res.data.data);

/**
 * Step 1: Send OTP to email for password reset
 */
export async function forgotPassword(email) {
  try {
    const response = await axiosInstance.post('/auth/forgot-password', null, {
      params: { email },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Failed to send OTP.');
  }
}

/**
 * Step 2: Verify OTP for password reset
 */
export async function verifyResetOtp(email, otp) {
  try {
    const response = await axiosInstance.post('/auth/verify-reset-otp', null, {
      params: { email, otp },
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data || 'Invalid or expired OTP.');
  }
}

/**
 * Step 3: Reset password with OTP verification
 */
export async function resetPassword(otp, email, newPassWord) {
  try {
    const response = await axiosInstance.post('/auth/reset-password', 
      { email, newPassWord },
      { params: { otp } }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reset password.');
  }
}

export async function updateProfile(payload) {
  try {
    const token = localStorage.getItem('accessToken');
    const response = await axiosInstance.put('/auth/profile', payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile.');
  }
}
