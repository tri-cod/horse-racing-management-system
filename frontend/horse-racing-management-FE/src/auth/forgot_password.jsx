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
        if (!email) return setError("Please enter your email.");
        clear(); setLoading(true);
        try {
            await forgotPassword(email);
            setSuccess("OTP has been sent to your email.");
            setStep(2);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) return setError("Please enter the OTP code.");
        clear(); setLoading(true);
        try {
            await verifyResetOtp(email, otp);
            setSuccess("OTP verified. Please set your new password.");
            setStep(3);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!newPassword || !confirmPassword) return setError("Please fill in all fields.");
        if (newPassword.length < 8) return setError("Password must be at least 8 characters.");
        if (newPassword !== confirmPassword) return setError("Passwords do not match.");
        clear(); setLoading(true);
        try {
            await resetPassword(otp, email, newPassword);
            setSuccess("Success! Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const stepLabels = ["Enter Email", "Verify OTP", "New Password"];

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
                    {step === 2 && "Enter OTP Code"}
                    {step === 3 && "New Password"}
                </h1>
                <p className="fp-subtitle">
                    {step === 1 && "Enter your registered email and we'll send you an OTP code."}
                    {step === 2 && `An OTP code has been sent to ${email}. Please check your inbox.`}
                    {step === 3 && "Set a new password for your account."}
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
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <button className="fp-btn-primary" onClick={handleSendOtp} disabled={loading}>
                            {loading ? <span className="fp-spinner" /> : "Send OTP"}
                        </button>
                        <div className="fp-divider"><span>or</span></div>
                        <p className="fp-bottom-link">
                            <span onClick={() => navigate("/login")}>← Back to Login</span>
                        </p>
                    </div>
                )}

                {/* Bước 2: OTP */}
                {step === 2 && (
                    <div className="fp-form">
                        <div className="fp-form-group">
                            <label className="fp-label">OTP Code</label>
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
                            {loading ? <span className="fp-spinner" /> : "Verify OTP"}
                        </button>
                        <button className="fp-btn-ghost" type="button"
                            onClick={() => { clear(); setStep(1); }}>
                            ← Resend OTP
                        </button>
                    </div>
                )}

                {/* Bước 3: Mật khẩu mới */}
                {step === 3 && (
                    <div className="fp-form">
                        <div className="fp-form-group">
                            <label className="fp-label">New Password</label>
                            <div className="fp-input-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="fp-input"
                                    placeholder="At least 8 characters"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <span className="fp-toggle" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                        </div>
                        <div className="fp-form-group">
                            <label className="fp-label">Confirm Password</label>
                            <div className="fp-input-wrapper">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    className="fp-input"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <span className="fp-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                        </div>
                        <button className="fp-btn-primary" onClick={handleResetPassword} disabled={loading}>
                            {loading ? <span className="fp-spinner" /> : "Reset Password"}
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
}