import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, resetPassword, forgotPassword } from '../api/authApi';
import '../assets/css/ProfilePage.css';

// ── icons ─────────────────────────────────────────────────────────────────────
const IconUser = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
);
const IconLock = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const IconLogout = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);
const IconBack = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);
const IconShield = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);
const IconMail = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

// ── Logout modal ──────────────────────────────────────────────────────────────
function LogoutModal({ user, onConfirm, onCancel }) {
    return (
        <div className="profile-overlay" onClick={onCancel}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon modal-icon--red">
                    <IconLogout />
                </div>
                <h3 className="modal-title">Sign out of Royal Derby?</h3>
                <p className="modal-desc">
                    Your session will end. You'll need to sign in again to access your account.
                </p>
                <div className="modal-user">
                    <div className="avatar-circle avatar-circle--sm">
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                        <p className="modal-user-name">{user?.username}</p>
                        <p className="modal-user-email">{user?.email}</p>
                    </div>
                </div>
                <div className="modal-actions">
                    <button className="btn btn--ghost" onClick={onCancel}>Stay signed in</button>
                    <button className="btn btn--danger" onClick={onConfirm}>Yes, sign out</button>
                </div>
            </div>
        </div>
    );
}

// ── Personal Info pane ────────────────────────────────────────────────────────
function PersonalInfoPane({ user, onUpdate }) {
    const [form, setForm] = useState({
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError]     = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setSuccess('');
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.fullName.trim()) { setError('Full name is required.'); return; }
        setLoading(true);
        setError('');
        try {
            const updated = await updateProfile({ fullName: form.fullName, phoneNumber: form.phoneNumber });
            onUpdate(updated);
            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setForm({ fullName: user?.fullName || '', phoneNumber: user?.phoneNumber || '' });
        setSuccess('');
        setError('');
    };

    const roleColor = {
        SPECTATOR: 'chip-blue', JOCKEY: 'chip-purple', HORSE_OWNER: 'chip-orange',
        TRAINER: 'chip-teal', ADMIN: 'chip-red', STAFF: 'chip-gray',
    };

    return (
        <div className="pane">
            <div className="pane-header">
                <h2 className="pane-title">Personal Information</h2>
                <p className="pane-sub">View and update your profile information</p>
            </div>

            {/* profile card */}
            <div className="card">
                <p className="card-section-title">Profile</p>

                {/* avatar + name row */}
                <div className="profile-hero">
                    <div className="avatar-ring">
                        <div className="avatar-ring-inner">
                            <span className="avatar-ring-letter">
                                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <span className="avatar-online" />
                    </div>
                    <div className="profile-hero-info">
                        <p className="profile-hero-name">{user?.fullName || user?.username}</p>
                        <div className="chip-row">
                            <span className={`chip ${roleColor[user?.role] || 'chip-blue'}`}>{user?.role}</span>
                            <span className={`chip ${user?.status === 'ACTIVE' ? 'chip-green' : 'chip-gray'}`}>
                                {user?.status}
                            </span>
                            {user?.verified && <span className="chip chip-gray">✓ Verified</span>}
                        </div>
                    </div>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="fullName">Full name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={form.fullName}
                                onChange={handleChange}
                                placeholder="Enter full name"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="username">Username</label>
                            <input id="username" type="text" value={user?.username || ''} disabled />
                            <p className="field-note">Cannot be changed</p>
                        </div>
                        <div className="field">
                            <label htmlFor="phoneNumber">Phone number</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="text"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                placeholder="e.g. 0901234567"
                            />
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email address</label>
                            <input id="email" type="text" value={user?.email || ''} disabled />
                            <p className="field-note">Cannot be changed</p>
                        </div>
                    </div>

                    {error   && <p className="form-msg form-msg--error">{error}</p>}
                    {success && <p className="form-msg form-msg--success">{success}</p>}

                    <div className="form-actions">
                        <button type="button" className="btn btn--ghost" onClick={handleCancel}>Cancel</button>
                        <button type="submit" className="btn btn--primary" disabled={loading}>
                            {loading ? 'Saving…' : 'Save changes'}
                        </button>
                    </div>
                </form>
            </div>

            {/* account details — read only */}
            <div className="card">
                <p className="card-section-title">Account details</p>
                <div className="form-grid">
                    <div className="field">
                        <label>Account ID</label>
                        <input value={`#${user?.id || ''}`} disabled />
                    </div>
                    <div className="field">
                        <label>Role</label>
                        <input value={user?.role || ''} disabled />
                    </div>
                    <div className="field">
                        <label>Status</label>
                        <input value={user?.status || ''} disabled />
                    </div>
                    <div className="field">
                        <label>Email verified</label>
                        <input value={user?.verified ? 'Yes — verified' : 'Not verified'} disabled />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Security pane ─────────────────────────────────────────────────────────────
function SecurityPane({ user }) {
    const [otpSent,    setOtpSent]    = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [form, setForm]             = useState({ otp: '', newPassWord: '', confirm: '' });
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [success, setSuccess]       = useState('');

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    // Bước 1: gửi OTP về email
    const handleSendOtp = async () => {
        setOtpLoading(true);
        setError('');
        try {
            await forgotPassword(user.email); // POST /api/auth/forgot-password
            setOtpSent(true);
        } catch (err) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setOtpLoading(false);
        }
    };

    // Bước 2: đổi mật khẩu
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.otp.trim())                  { setError('Please enter the OTP sent to your email.'); return; }
        if (form.newPassWord.length < 8)        { setError('Password must be at least 8 characters.'); return; }
        if (form.newPassWord !== form.confirm)  { setError('Passwords do not match.'); return; }
        setLoading(true);
        setError('');
        try {
            await resetPassword(form.otp, user.email, form.newPassWord);
            setSuccess('Password updated successfully.');
            setForm({ otp: '', newPassWord: '', confirm: '' });
            setOtpSent(false);
        } catch (err) {
            setError(err.message || 'Failed to update password.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setOtpSent(false);
        setForm({ otp: '', newPassWord: '', confirm: '' });
        setError('');
        setSuccess('');
    };

    return (
        <div className="pane">
            <div className="pane-header">
                <h2 className="pane-title">Security</h2>
                <p className="pane-sub">Manage your password and account security</p>
            </div>

            <div className="card">
                <p className="card-section-title">Change password</p>

                {/* Bước 1 — gửi OTP */}
                <div className="otp-send-row">
                    <div className="otp-send-info">
                        <p className="otp-send-label">We'll send a one-time code to your email</p>
                        <p className="otp-send-email">{user?.email}</p>
                    </div>
                    <button
                        type="button"
                        className={`btn ${otpSent ? 'btn--ghost' : 'btn--primary'}`}
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                    >
                        {otpLoading
                            ? 'Sending…'
                            : otpSent
                                ? '✓ Sent — Resend OTP'
                                : 'Send OTP to my email'}
                    </button>
                </div>

                {/* thông báo OTP đã gửi */}
                {otpSent && (
                    <div className="otp-notice">
                        <IconMail />
                        OTP sent to <strong>{user?.email}</strong> — check your inbox and enter it below.
                    </div>
                )}

                {/* Bước 2 — form, chỉ hiện sau khi gửi OTP */}
                {otpSent && (
                    <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
                        <div className="form-grid form-grid--single">
                            <div className="field">
                                <label htmlFor="otp">OTP code</label>
                                <input
                                    id="otp"
                                    name="otp"
                                    type="text"
                                    value={form.otp}
                                    onChange={handleChange}
                                    placeholder="Enter OTP from your email"
                                    autoFocus
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="newPassWord">New password</label>
                                <input
                                    id="newPassWord"
                                    name="newPassWord"
                                    type="password"
                                    value={form.newPassWord}
                                    onChange={handleChange}
                                    placeholder="Min. 8 characters"
                                />
                            </div>
                            <div className="field">
                                <label htmlFor="confirm">Confirm new password</label>
                                <input
                                    id="confirm"
                                    name="confirm"
                                    type="password"
                                    value={form.confirm}
                                    onChange={handleChange}
                                    placeholder="Re-enter new password"
                                />
                            </div>
                        </div>

                        {error   && <p className="form-msg form-msg--error">{error}</p>}
                        {success && <p className="form-msg form-msg--success">{success}</p>}

                        <div className="form-actions">
                            <button type="button" className="btn btn--ghost" onClick={handleCancel}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn--primary" disabled={loading}>
                                {loading ? 'Updating…' : 'Update password'}
                            </button>
                        </div>
                    </form>
                )}

                {/* error khi gửi OTP thất bại (trước khi form xuất hiện) */}
                {error && !otpSent && (
                    <p className="form-msg form-msg--error" style={{ marginTop: '12px' }}>{error}</p>
                )}
                {success && !otpSent && (
                    <p className="form-msg form-msg--success" style={{ marginTop: '12px' }}>{success}</p>
                )}
            </div>

            {/* security overview */}
            <div className="card">
                <p className="card-section-title">Security overview</p>
                <div className="security-row">
                    <div className="security-row-left">
                        <IconMail />
                        <div>
                            <p className="security-label">Email address</p>
                            <p className="security-sub">{user?.email}</p>
                        </div>
                    </div>
                    <span className={`badge ${user?.verified ? 'badge--green' : 'badge--red'}`}>
                        {user?.verified ? '✓ Verified' : 'Not verified'}
                    </span>
                </div>
                <div className="security-row">
                    <div className="security-row-left">
                        <IconLock />
                        <div>
                            <p className="security-label">Password</p>
                            <p className="security-sub">Use the form above to change your password</p>
                        </div>
                    </div>
                    <span className="badge badge--amber">Keep it safe</span>
                </div>
                <div className="security-row" style={{ borderBottom: 'none' }}>
                    <div className="security-row-left">
                        <IconShield />
                        <div>
                            <p className="security-label">Account status</p>
                            <p className="security-sub">Active and in good standing</p>
                        </div>
                    </div>
                    <span className={`badge ${user?.status === 'ACTIVE' ? 'badge--green' : 'badge--red'}`}>
                        {user?.status}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ── ProfilePage ───────────────────────────────────────────────────────────────
function ProfilePage() {
    const navigate = useNavigate();
    const { user, logout, updateUser } = useContext(AuthContext);
    const [activePane, setActivePane]  = useState('info');
    const [showLogout, setShowLogout]  = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const NAV = [
        { pane: 'info',     label: 'Personal Info', icon: <IconUser /> },
        { pane: 'security', label: 'Security',       icon: <IconLock /> },
    ];

    const roleColor = {
        SPECTATOR: 'chip-blue', JOCKEY: 'chip-purple', HORSE_OWNER: 'chip-orange',
        TRAINER: 'chip-teal', ADMIN: 'chip-red', STAFF: 'chip-gray',
    };

    return (
        <div className="profile-page">
            {/* back bar */}
            <div className="profile-back-bar">
                <button className="profile-back-btn" onClick={() => navigate(-1)}>
                    <IconBack />
                    Back
                </button>
                <nav className="profile-breadcrumb">
                    <span onClick={() => navigate('/')} className="bc-link">Home</span>
                    <span className="bc-sep">›</span>
                    <span className="bc-current">
                        {activePane === 'info' ? 'Personal Info' : 'Security'}
                    </span>
                </nav>
            </div>

            <div className="profile-layout">
                {/* SIDEBAR */}
                <aside className="profile-sidebar">
                    <div className="sidebar-user">
                        <div className="avatar-ring avatar-ring--lg">
                            <div className="avatar-ring-inner">
                                <span className="avatar-ring-letter avatar-ring-letter--lg">
                                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <span className="avatar-online" />
                        </div>
                        <p className="sidebar-name">{user?.fullName || user?.username}</p>
                        <p className="sidebar-email">{user?.email}</p>
                        <div className="chip-row chip-row--center">
                            <span className={`chip ${roleColor[user?.role] || 'chip-blue'}`}>{user?.role}</span>
                            <span className={`chip ${user?.status === 'ACTIVE' ? 'chip-green' : 'chip-gray'}`}>
                                {user?.status}
                            </span>
                            {user?.verified && <span className="chip chip-gray">✓ Verified</span>}
                        </div>
                    </div>

                    <nav className="sidebar-nav">
                        <span className="sidebar-nav-label">Account</span>
                        {NAV.map((it) => (
                            <button
                                key={it.pane}
                                className={`sidebar-nav-btn ${activePane === it.pane ? 'sidebar-nav-btn--active' : ''}`}
                                onClick={() => setActivePane(it.pane)}
                            >
                                {it.icon}
                                {it.label}
                            </button>
                        ))}
                        <div className="sidebar-divider" />
                        <button
                            className="sidebar-nav-btn sidebar-nav-btn--danger"
                            onClick={() => setShowLogout(true)}
                        >
                            <IconLogout />
                            Sign out
                        </button>
                    </nav>
                </aside>

                {/* MAIN */}
                <main className="profile-main">
                    {activePane === 'info'     && <PersonalInfoPane user={user} onUpdate={updateUser} />}
                    {activePane === 'security' && <SecurityPane user={user} />}
                </main>
            </div>

            {showLogout && (
                <LogoutModal
                    user={user}
                    onConfirm={handleLogout}
                    onCancel={() => setShowLogout(false)}
                />
            )}
        </div>
    );
}

export default ProfilePage;