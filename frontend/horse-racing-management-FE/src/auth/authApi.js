// authApi.js - Tất cả các hàm gọi API auth
// Base URL - đổi lại đúng với server của bạn
const BASE_URL = "http://localhost:8080/api/auth";

// Helper gọi API chung
async function callApi(endpoint, method = "GET", body = null, params = null) {
  let url = `${BASE_URL}${endpoint}`;

  // Nếu có query params thì thêm vào URL
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // Ném lỗi kèm message từ server
    const message =
      data?.message || data?.error || "Đã xảy ra lỗi, vui lòng thử lại";
    throw new Error(message);
  }

  return data;
}

// =============================================
// BƯỚC 1: Đăng ký tài khoản mới
// POST /api/auth/register
// Body: { username, email, password, fullName, phone, role }
// =============================================
export async function register({ username, email, password, fullName, phone, role = "ROLE_USER" }) {
  return callApi("/register", "POST", {
    username,
    email,
    password,
    fullName,
    phone,
    role,
  });
}

// =============================================
// BƯỚC 2: Gửi OTP xác minh email (sau khi đăng ký)
// POST /api/auth/send-verification-otp?email=xxx
// =============================================
export async function sendVerificationOtp(email) {
  return callApi("/send-verification-otp", "POST", null, { email });
}

// =============================================
// BƯỚC 3: Xác minh email bằng OTP
// POST /api/auth/verify-email?email=xxx&otp=123456
// =============================================
export async function verifyEmail(email, otp) {
  return callApi("/verify-email", "POST", null, { email, otp });
}

// =============================================
// BƯỚC 4: Đăng nhập
// POST /api/auth/login
// Body: { username, password }
// =============================================
export async function login(username, password) {
  const data = await callApi("/login", "POST", { username, password });
  // Lưu token vào localStorage để dùng cho các request sau
  if (data?.data?.accessToken) {
    localStorage.setItem("accessToken", data.data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.data.user));
  }
  return data;
}

// =============================================
// BƯỚC 5: Quên mật khẩu - gửi OTP về email
// POST /api/auth/forgot-password?email=xxx
// =============================================
export async function forgotPassword(email) {
  return callApi("/forgot-password", "POST", null, { email });
}

// =============================================
// BƯỚC 6: Xác minh OTP reset password
// POST /api/auth/verify-reset-otp?email=xxx&otp=123456
// =============================================
export async function verifyResetOtp(email, otp) {
  return callApi("/verify-reset-otp", "POST", null, { email, otp });
}

// =============================================
// BƯỚC 7: Đặt mật khẩu mới
// POST /api/auth/reset-password?otp=123456
// Body: { email, newPassWord }
// =============================================
export async function resetPassword(email, newPassWord, otp) {
  return callApi("/reset-password", "POST", { email, newPassWord }, { otp });
}

// =============================================
// Đăng xuất (xóa token local)
// =============================================
export function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");
}

// =============================================
// Lấy thông tin user đang đăng nhập từ localStorage
// =============================================
export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

export function getAccessToken() {
  return localStorage.getItem("accessToken");
}
