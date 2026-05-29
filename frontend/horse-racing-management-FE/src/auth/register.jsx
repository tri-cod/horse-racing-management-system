import { useState } from "react";
import "../assets/css/register.css";
import { register } from "../api/authService";
import SpectatorForm from "./forms/SpectatorForm";
import HorseOwnerForm from "./forms/HorseOwnerForm";
import JockeyForm from "./forms/JockeyForm";

const ROLES = [
    {
        key: "spectator",
        label: "Spectator",
        subtitle: "Watch races & follow your favourite horses",
        icon: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="13" r="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M6 34c0-7.732 6.268-14 14-14s14 6.268 14 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="20" cy="13" r="2.5" fill="currentColor"/>
            </svg>
        ),
    },
    {
        key: "horseOwner",
        label: "Horse Owner",
        subtitle: "Manage your horses & track race results",
        icon: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 28c2-6 6-10 12-10s10 4 12 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M28 18c0-4-3-8-8-8s-8 4-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 28v4M28 28v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M20 10V7M16 11l-2-2M24 11l2-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="20" cy="18" r="2" fill="currentColor"/>
            </svg>
        ),
    },
    {
        key: "jockey",
        label: "Jockey",
        subtitle: "Register as a professional race rider",
        icon: (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="10" r="4.5" stroke="currentColor" strokeWidth="2"/>
                <path d="M14 18h12l-2 10H16L14 18z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M16 28l-3 6M24 28l3 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M10 22h4M26 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 10c0-2 2-4 4-4s4 2 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
        ),
    },
];

const initialFields = {
    username: "",
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
};

function Register() {
    const [activeRole, setActiveRole] = useState(null);
    const [fields, setFields] = useState(initialFields);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (field, value) => {
        setFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleRoleSelect = (roleKey) => {
        setActiveRole(roleKey);
        setFields(initialFields);
        setError("");
        setSuccess("");
    };

    const handleBack = () => {
        setActiveRole(null);
        setFields(initialFields);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e, role) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (fields.password !== fields.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...payload } = fields;
            const result = await register({ ...payload, role });
            setSuccess(result.message || "Registration successful!");
            setFields(initialFields);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formProps = { fields, onChange: handleChange, onSubmit: handleSubmit, loading, error, success };

    // Page 2: Form
    if (activeRole) {
        const roleData = ROLES.find((r) => r.key === activeRole);
        return (
            <div className="register register--form-page">
                <button className="register__back" onClick={handleBack} type="button">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 14L6 9l5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Back
                </button>

                <div className="register__form-header">
                    <div className="register__form-role-badge">
                        <span className="register__form-role-icon">{roleData.icon}</span>
                        <span className="register__form-role-label">{roleData.label}</span>
                    </div>
                    <h1 className="register__title">Create your account</h1>
                    <p className="register__subtitle">{roleData.subtitle}</p>
                </div>

                <div className="register__form-wrapper">
                    {activeRole === "spectator" && <SpectatorForm {...formProps} />}
                    {activeRole === "horseOwner" && <HorseOwnerForm {...formProps} />}
                    {activeRole === "jockey" && <JockeyForm {...formProps} />}
                </div>

                <p className="register__login-link">
                    Already have an account? <a href="/login">Sign in</a>
                </p>
            </div>
        );
    }

    // Page 1: Role selection
    return (
        <div className="register register--select-page">
            <div className="register__hero">
                <p className="register__eyebrow">GET STARTED</p>
                <h1 className="register__title">Join the race.<br/>Choose your role.</h1>
                <p className="register__subtitle">Select how you want to participate in the horse racing platform</p>
            </div>

            <div className="register__role-grid">
                {ROLES.map((role, index) => (
                    <button
                        key={role.key}
                        className="register__role-card"
                        onClick={() => handleRoleSelect(role.key)}
                        type="button"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className="register__role-card-inner">
                            <span className="register__role-icon">{role.icon}</span>
                            <h3 className="register__role-name">{role.label}</h3>
                            <p className="register__role-desc">{role.subtitle}</p>
                            <div className="register__role-cta">
                                Get started
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <p className="register__login-link">
                Already have an account? <a href="/login">Sign in</a>
            </p>
        </div>
    );
}

export default Register;