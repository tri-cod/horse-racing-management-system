import { useState } from "react";
import { Link } from 'react-router-dom';
import "../assets/css/login.css";
import logoLogin from "../assets/img/logoLogin.jpg"
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../hooks/useLogin";

export default function LoginPage() {
    const { loading, error, success, handleLogin } = useLogin();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleLogin({ username, password });
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Left Panel */}
                <div className="login-form-panel">
                    <Link to="/" className="login-back-home">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        Back to Home
                    </Link>
                    <h1 className="login-title">Welcome back!</h1>
                    {success && <div className="login-success">{success}</div>}
                    {error && <div className="login-error">{error}</div>}

                    <div className="login-form">
                        <div className="form-group">
                            <label className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <span
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                        </div>

                        <div className="form-remember-row">
                            <div className="form-remember">
                                <input
                                    type="checkbox"
                                    id="remember"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                />
                                <label htmlFor="remember">Remember for 30 days</label>
                            </div>
                            <Link to="/forgot-password" className="forgot-link">
                               Forgot password?
                            </Link>
                        </div>

                        <button
                            className={`btn-signin ${loading ? "loading" : ""}`}
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? <span className="spinner" /> : "Sign In"}
                        </button>

                        <div className="divider">
                            <span>or</span>
                        </div>

                        <p className="signup-link">
                            Don't have an account?{" "}
                            <Link to="/register" className="signup-btn">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right Panel - Image */}
                <div className="login-image-panel" style={{ backgroundImage: `url(${logoLogin})` }}>
                    <div className="image-overlay" />
                </div>
            </div>
        </div>
    );
}
