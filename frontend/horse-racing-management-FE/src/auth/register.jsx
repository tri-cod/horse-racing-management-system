import { useState } from "react";
import "../assets/css/register.css";
import { register } from "../api/authService";

function Register() {
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showSpectatorForm, setShowSpectatorForm] = useState(false);
    const [showHorseOwnerForm, setShowHorseOwnerForm] = useState(false);
    const [showJockeyForm, setShowJockeyForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const resetForm = () => {
        setUsername("");
        setFullName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");
    };

    const handleSubmit = async (e, role) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        setLoading(true);
        try {
            const result = await register({ username, fullName, email, phone, password, role });
            setSuccess(result.message || "Đăng ký thành công!");
            resetForm();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderFormFields = () => (
        <>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}

            <div className="register__group">
                <label className="register__label" htmlFor="username">Username:</label>
                <input
                    className="register__input"
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </div>

            <div className="register__group">
                <label className="register__label" htmlFor="fullName">Full Name:</label>
                <input
                    className="register__input"
                    type="text"
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />
            </div>

            <div className="register__group">
                <label className="register__label" htmlFor="email">Email:</label>
                <input
                    className="register__input"
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>

            <div className="register__group">
                <label className="register__label" htmlFor="phone">Phone:</label>
                <input
                    className="register__input"
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    pattern="^[0-9]{10,11}$"
                />
            </div>

            <div className="register__group">
                <label className="register__label" htmlFor="password">Password:</label>
                <input
                    className="register__input"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={8}
                    required
                />
            </div>

            <div className="register__group">
                <label className="register__label" htmlFor="confirmPassword">Confirm Password:</label>
                <input
                    className="register__input"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
            </div>

            <button className="register__submit" type="submit" disabled={loading}>
                {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
        </>
    );

    return (
        <div className="register">
            <h1 className="register__title">GETTING STARTED NOW</h1>
            <p className="register__subtitle">YOU WANT TO REGISTER AS A</p>
            <div className='register__buttons'>

                <div className="register__section">
                    <button
                        className='register__button btn btn-primary'
                        onClick={() => setShowSpectatorForm(!showSpectatorForm)}
                    >
                        {showSpectatorForm ? '' : ''}
                        SPECTATOR
                    </button>
                    {showSpectatorForm && (
                        <form className="register__form" onSubmit={(e) => handleSubmit(e, "USER")}>
                            {renderFormFields()}
                        </form>
                    )}
                </div>

                <div className="register__section">
                    <button
                        className='register__button btn btn-primary'
                        onClick={() => setShowHorseOwnerForm(!showHorseOwnerForm)}
                    >
                        {showHorseOwnerForm ? '' : ''}
                        HORSE OWNER
                    </button>
                    {showHorseOwnerForm && (
                        <form className="register__form" onSubmit={(e) => handleSubmit(e, "HORSE_OWNER")}>
                            {renderFormFields()}
                        </form>
                    )}
                </div>

                <div className="register__section">
                    <button
                        className='register__button btn btn-primary'
                        onClick={() => setShowJockeyForm(!showJockeyForm)}
                    >
                        {showJockeyForm ? '' : ''}
                        JOCKEY
                    </button>
                    {showJockeyForm && (
                        <form className="register__form" onSubmit={(e) => handleSubmit(e, "JOCKEY")}>
                            {renderFormFields()}
                        </form>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Register;
