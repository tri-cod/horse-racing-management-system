import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import "../assets/css/login.css";
import logoLogin from "../assets/logoLogin.jpg"
import { Eye, EyeOff } from "lucide-react";
import { login } from "../api/authService";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await login({ username, password });
            console.log("API response:", result);
            const { accessToken, tokenType, user } = result;
            if (!accessToken) {
                throw new Error("Login Fail");
            }
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("tokenType", tokenType);
            localStorage.setItem("user", JSON.stringify(user));
            alert(`Login Successful! Welcome ${user.fullName}`);
        } catch (err) {
            console.error("LOGIN ERROR:", err);
            setError("Login failed. Please try again.");
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

                        {/* Remember + Forgot — thêm form-remember-row để căn 2 bên */}
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
                            <span className="forgot-link" onClick={() => navigate('/forgot-password')}>
                               forgot password?
                            </span>
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
