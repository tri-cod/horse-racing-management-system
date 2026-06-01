import { useState } from "react";
import "../assets/css/forgotPassword.css";
import { Eye, EyeOff } from "lucide-react";
import { forgotPassword, verifyResetOtp, resetPassword } from "../api/authService";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const clear = () => { setError(""); setSuccess(""); };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!email) return setError("Vui lòng nhập email.");
        clear(); setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess("OTP đã được gửi tới email của bạn.");
            setStep(2);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) return setError("Vui lòng nhập mã OTP.");
        clear(); setLoading(true);
        try {
            await verifyResetOtp(email, otp);
            setSuccess("OTP hợp lệ. Vui lòng đặt mật khẩu mới.");
            setStep(3);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) return setError("Vui lòng điền đầy đủ thông tin.");
        if (newPassword.length < 8) return setError("Mật khẩu phải có ít nhất 8 ký tự.");
        if (newPassword !== confirmPassword) return setError("Mật khẩu xác nhận không khớp.");
        clear(); setLoading(true);
        try {
            await resetPassword(otp, email, newPassword);
            setSuccess("Thành công! Đang chuyển về đăng nhập...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const stepLabels = ["Nhập Email", "Xác nhận OTP", "Mật khẩu mới"];

    return (
        <div className="fp-page">
            <div className="fp-box">

                {/* Step indicator */}
                <div className="fp-steps">
                    {stepLabels.map((label, i) => (
                        <div key={i} className={`fp-step ${step === i + 1 ? "active" : ""} ${step > i + 1 ? "done" : ""}`}>
                            <div className="fp-step-circle">{step > i + 1 ? "✓" : i + 1}</div>
                            <span className="fp-step-label">{label}</span>
                            {i < stepLabels.length - 1 && <div className="fp-step-line" />}
                        </div>
                    ))}
                </div>

                {/* Title */}
                <h1 className="fp-title">
                    {step === 1 && "Forgot password?"}
                    {step === 2 && "Nhập mã OTP"}
                    {step === 3 && "New Password"}
                </h1>
                <p className="fp-subtitle">
                    {step === 1 && "Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP cho bạn."}
                    {step === 2 && `Mã OTP đã gửi tới ${email}. Vui lòng kiểm tra hộp thư.`}
                    {step === 3 && "Đặt mật khẩu mới cho tài khoản của bạn."}
                </p>

                {error   && <div className="fp-alert fp-alert-error">{error}</div>}
                {success && <div className="fp-alert fp-alert-success">{success}</div>}

                {/* Bước 1: Email */}
                {step === 1 && (
                    <div className="fp-form">
                        <div className="fp-form-group">
                            <label className="fp-label">Email</label>
                            <input
                                type="email"
                                className="fp-input"
                                placeholder="Nhập email của bạn"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button className="fp-btn-primary" onClick={handleSendOtp} disabled={loading}>
                            {loading ? <span className="fp-spinner" /> : "Gửi mã OTP"}
                        </button>
                        <div className="fp-divider"><span>or</span></div>
                        <p className="fp-bottom-link">
                            <span onClick={() => navigate("/login")}>← Quay lại đăng nhập</span>
                        </p>
                    </div>
                )}

                {/* Bước 2: OTP */}
                {step === 2 && (
                    <div className="fp-form">
                        <div className="fp-form-group">
                            <label className="fp-label">Mã OTP</label>
                            <input
                                type="text"
                                className="fp-input fp-otp-input"
                                placeholder="• • • • • •"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/, "").slice(0, 6))}
                                maxLength={6}
                            />
                        </div>
                        <button className="fp-btn-primary" onClick={handleVerifyOtp} disabled={loading}>
                            {loading ? <span className="fp-spinner" /> : "Xác nhận OTP"}
                        </button>
                        <button className="fp-btn-ghost" type="button"
                            onClick={() => { clear(); setStep(1); }}>
                            ← Gửi lại OTP
                        </button>
                    </div>
                )}

                {/* Bước 3: Mật khẩu mới */}
                {step === 3 && (
                    <div className="fp-form">
                        <div className="fp-form-group">
                            <label className="fp-label">Mật khẩu mới</label>
                            <div className="fp-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="fp-input"
                                    placeholder="Ít nhất 8 ký tự"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <span className="fp-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                        </div>
                        <div className="fp-form-group">
                            <label className="fp-label">Xác nhận mật khẩu</label>
                            <div className="fp-input-wrapper">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    className="fp-input"
                                    placeholder="Nhập lại mật khẩu"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <span className="fp-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                        </div>
                        <button className="fp-btn-primary" onClick={handleResetPassword} disabled={loading}>
                            {loading ? <span className="fp-spinner" /> : "Đặt lại mật khẩu"}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}