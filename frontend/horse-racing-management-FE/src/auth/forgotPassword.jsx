// forgotPassword.jsx - Quên mật khẩu (3 bước: nhập email → nhập OTP → đặt mật khẩu mới)
import { useState } from "react";
import { forgotPassword, verifyResetOtp, resetPassword } from "./authApi";

// Có 3 bước (step):
// 1 = Nhập email để nhận OTP
// 2 = Nhập OTP xác minh
// 3 = Đặt mật khẩu mới

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  // ===== BƯỚC 1: Gửi OTP về email =====
  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email) return setError("Vui lòng nhập email");
    clearMessages();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(`OTP đã gửi tới ${email}. Vui lòng kiểm tra hộp thư.`);
      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ===== BƯỚC 2: Xác minh OTP =====
  async function handleVerifyOtp(e) {
    e.preventDefault();
    if (!otp || otp.length < 4) return setError("Vui lòng nhập OTP hợp lệ");
    clearMessages();
    setLoading(true);
    try {
      await verifyResetOtp(email, otp);
      setSuccess("OTP hợp lệ. Hãy đặt mật khẩu mới.");
      setStep(3);
    } catch (err) {
      setError(err.message || "OTP không hợp lệ hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  }

  // ===== BƯỚC 3: Đặt mật khẩu mới =====
  async function handleResetPassword(e) {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8)
      return setError("Mật khẩu phải có ít nhất 8 ký tự");
    if (newPassword !== confirmPassword)
      return setError("Mật khẩu xác nhận không khớp");
    clearMessages();
    setLoading(true);
    try {
      await resetPassword(email, newPassword, otp);
      setSuccess("Đặt mật khẩu thành công! Hãy đăng nhập lại.");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      // TODO: navigate("/login");
    } catch (err) {
      setError(err.message || "Đặt mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  }

  const stepTitles = {
    1: "Quên mật khẩu",
    2: "Nhập mã OTP",
    3: "Đặt mật khẩu mới",
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Thanh tiến trình bước */}
        <div style={styles.steps}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ ...styles.stepDot, background: step >= s ? "#2563eb" : "#ddd" }}>
                {s}
              </div>
              {s < 3 && <div style={{ ...styles.stepLine, background: step > s ? "#2563eb" : "#ddd" }} />}
            </div>
          ))}
        </div>

        <h2 style={styles.title}>{stepTitles[step]}</h2>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        {/* ===== BƯỚC 1 ===== */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} style={styles.form}>
            <label style={styles.label}>Địa chỉ Email đã đăng ký</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearMessages(); }}
              placeholder="example@email.com"
            />
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi mã OTP"}
            </button>
            <p style={styles.link}>
              <a href="/login">← Quay lại đăng nhập</a>
            </p>
          </form>
        )}

        {/* ===== BƯỚC 2 ===== */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <p style={styles.hint}>
              Mã OTP đã gửi đến <strong>{email}</strong>
            </p>
            <label style={styles.label}>Nhập mã OTP</label>
            <input
              style={{ ...styles.input, letterSpacing: "0.3rem", fontSize: "1.4rem", textAlign: "center" }}
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value); clearMessages(); }}
              placeholder="••••••"
            />
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Đang xác minh..." : "Xác minh OTP"}
            </button>
            <button
              type="button"
              style={styles.outlineButton}
              onClick={handleSendOtp}
              disabled={loading}
            >
              Gửi lại OTP
            </button>
            <button
              type="button"
              style={styles.ghostButton}
              onClick={() => { setStep(1); clearMessages(); }}
            >
              ← Đổi email
            </button>
          </form>
        )}

        {/* ===== BƯỚC 3 ===== */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={styles.form}>
            <label style={styles.label}>Mật khẩu mới</label>
            <input
              style={styles.input}
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); clearMessages(); }}
              placeholder="Tối thiểu 8 ký tự"
            />
            <label style={styles.label}>Xác nhận mật khẩu mới</label>
            <input
              style={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearMessages(); }}
              placeholder="Nhập lại mật khẩu"
            />
            {/* Gợi ý độ mạnh mật khẩu */}
            {newPassword && (
              <div style={styles.strengthBar}>
                <div style={{
                  height: "4px",
                  borderRadius: "4px",
                  width: newPassword.length >= 12 ? "100%" : newPassword.length >= 8 ? "60%" : "30%",
                  background: newPassword.length >= 12 ? "#16a34a" : newPassword.length >= 8 ? "#d97706" : "#dc2626",
                  transition: "all 0.3s"
                }} />
                <span style={{ fontSize: "0.75rem", color: "#666" }}>
                  {newPassword.length >= 12 ? "Mạnh" : newPassword.length >= 8 ? "Trung bình" : "Yếu"}
                </span>
              </div>
            )}
            <button style={styles.button} type="submit" disabled={loading}>
              {loading ? "Đang lưu..." : "Đặt mật khẩu mới"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f2f5",
  },
  card: {
    background: "#fff",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "440px",
  },
  steps: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "1.5rem",
    gap: 0,
  },
  stepDot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "0.85rem",
    transition: "background 0.3s",
  },
  stepLine: { width: "48px", height: "3px", transition: "background 0.3s" },
  title: { textAlign: "center", marginBottom: "1.25rem", color: "#1a1a2e" },
  form: { display: "flex", flexDirection: "column", gap: "0.75rem" },
  label: { fontWeight: "600", color: "#444", fontSize: "0.9rem" },
  hint: { color: "#555", fontSize: "0.9rem", margin: 0 },
  input: {
    padding: "0.75rem 1rem",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "1rem",
    outline: "none",
  },
  button: {
    padding: "0.85rem",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  outlineButton: {
    padding: "0.75rem",
    background: "transparent",
    color: "#2563eb",
    border: "1px solid #2563eb",
    borderRadius: "8px",
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  ghostButton: {
    padding: "0.5rem",
    background: "transparent",
    color: "#888",
    border: "none",
    fontSize: "0.9rem",
    cursor: "pointer",
    textAlign: "center",
  },
  error: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
  },
  successBox: {
    background: "#dcfce7",
    color: "#16a34a",
    padding: "0.75rem",
    borderRadius: "8px",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
  },
  strengthBar: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    background: "#f0f0f0",
    borderRadius: "4px",
    padding: "6px 8px",
  },
  link: { textAlign: "center", fontSize: "0.9rem", color: "#555" },
};
