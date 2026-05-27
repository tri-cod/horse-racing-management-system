import { useState } from "react";
import "../login.css";
import logoLogin from "../assets/logoLogin.jpg";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../api/authService";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await login({ username, password });
            const { accessToken, tokenType } = result.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("tokenType", tokenType);
            localStorage.setItem("user", JSON.stringify(result.data.user));
            
            alert(`Đăng nhập thành công! Xin chào ${result.data.user.fullName}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Left Panel */}
                <div className="login-form-panel">
                    <h1 className="login-title">Welcome back!</h1>

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

                        <div className="form-remember">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                            />
                            <label htmlFor="remember">Remember for 30 days</label>
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
                            <a href="#signup">Sign up</a>
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
