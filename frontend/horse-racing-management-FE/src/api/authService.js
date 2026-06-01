const BASE_URL = "http://localhost:8080/api/auth";

export async function register(data) {
    const response = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Đăng ký thất bại");
    }
    return result;
}

export async function login(data) {
    const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.message || "Đăng nhập thất bại");
    }
    return result.data;
}

// ── Forgot Password APIs ──────────────────────────────

// Bước 1: gửi OTP về email
export async function forgotPassword(email) {
    const response = await fetch(`${BASE_URL}/forgot-password?email=${encodeURIComponent(email)}`, {
        method: "POST",
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || "Gửi OTP thất bại");
    return text;
}

// Bước 2: xác nhận OTP
export async function verifyResetOtp(email, otp) {
    const response = await fetch(
        `${BASE_URL}/verify-reset-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
        { method: "POST" }
    );
    const text = await response.text();
    if (!response.ok) throw new Error(text || "OTP không hợp lệ hoặc đã hết hạn");
    return text;
}

// Bước 3: đặt lại mật khẩu
export async function resetPassword(otp, email, newPassWord) {
    const response = await fetch(`${BASE_URL}/reset-password?otp=${encodeURIComponent(otp)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassWord }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Đặt lại mật khẩu thất bại");
    return result;
}