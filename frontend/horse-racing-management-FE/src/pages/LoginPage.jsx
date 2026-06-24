import { useState } from "react";
import { Link } from 'react-router-dom';
import "../assets/css/login.css";
import { Eye, EyeOff } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import Seo from "../components/seo/Seo";

export default function LoginPage() {
    const { loading, error, success, handleLogin } = useLogin();
    const [username, setUsername]         = useState("");
    const [password, setPassword]         = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        await handleLogin({ username, password });
    };

    return (
        <div className="login-page">
            <Seo title="Sign In" description="Sign in to your Royal Derby account." />

            {/* ── Top header with logo ── */}
            <div className="login-topbar">
                <Link to="/" className="login-topbar__logo">
                    <span>Royal</span><em>Derby</em>
                </Link>
            </div>

            {/* ── Tab bar ── */}
            <div className="login-tabs">
                <span className="login-tab login-tab--active">Sign in</span>
                <Link to="/register" className="login-tab">Register</Link>
            </div>

            {/* ── Form area ── */}
            <div className="login-form-area">
                <div className="login-form-container">
                    <h1 className="login-heading">SIGN IN</h1>
                    <hr className="login-heading-divider" />

                    {success && <div className="login-success">{success}</div>}
                    {error   && <div className="login-error">{error}</div>}

                    <form onSubmit={handleSubmit}>
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
                                <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </span>
                            </div>
                        </div>

                        <div className="login-forgot-row">
                            <Link to="/forgot-password" className="forgot-link">Forgotten password?</Link>
                        </div>

                        <button type="submit" className="btn-signin" disabled={loading}>
                            {loading ? <span className="spinner" /> : "SIGN IN"}
                        </button>

                        <p className="signup-link">
                            Don't have an account yet?{" "}
                            <Link to="/register" className="signup-btn">Register with Royal Derby</Link>
                        </p>
                    </form>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="login-footer">
                <Link to="/" className="login-footer__logo">
                    <span>Royal</span><em>Derby</em>
                </Link>
                <div className="login-footer__links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Use</a>
                    <a href="#">Contact</a>
                </div>
            </div>
        </div>
    );
}
