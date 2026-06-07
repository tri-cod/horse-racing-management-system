import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogOut, ChevronLeft, Shield, Mail } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { updateProfile, resetPassword, forgotPassword } from '../api/authApi';
import '../assets/css/ProfilePage.css';

// ── Logout modal ──────────────────────────────────────────────────────────────
function LogoutModal({ user, onConfirm, onCancel }) {
    return (
        <div className="profile-overlay" onClick={onCancel}>
            <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-icon modal-icon--red">
                    <LogOut size={16} />
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
    // baseline là giá trị đã lưu gần nhất — Cancel sẽ về đây, không phải giá trị lúc mount
    const [baseline, setBaseline] = useState({
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
            // Merge response vào user hiện tại để không mất các field khác (id, role, email,...)
            onUpdate({ ...user, ...updated });
            // Cập nhật baseline sau khi save thành công
            setBaseline({ fullName: form.fullName, phoneNumber: form.phoneNumber });
            setSuccess('Profile updated successfully.');
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset về giá trị đã lưu gần nhất, không phải giá trị lúc mở trang
        setForm({ fullName: baseline.fullName, phoneNumber: baseline.phoneNumber });
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
                    <div className="avatar-wrap">
                        <div className="avatar-ring">
                            <div className="avatar-ring-inner">
                                <span className="avatar-ring-letter">
                                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        </div>
                        <span className="avatar-ring-anim" />
                        <span className="avatar-online">
                            <span className="avatar-online-pulse" />
                        </span>
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
                {/* Tiêu đề rõ hơn: dùng OTP email để reset, không phải đổi trực tiếp */}
                <p className="card-section-title">Reset password via email</p>

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
                        <Mail size={16} />
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
                        <Mail size={16} />
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
                        <Lock size={16} />
                        <div>
                            <p className="security-label">Password</p>
                            <p className="security-sub">Use the form above to reset your password</p>
                        </div>
                    </div>
                    <span className="badge badge--amber">Keep it safe</span>
                </div>
                <div className="security-row" style={{ borderBottom: 'none' }}>
                    <div className="security-row-left">
                        <Shield size={16} />
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
        { pane: 'info',     label: 'Personal Info', icon: <User size={16} /> },
        { pane: 'security', label: 'Security',       icon: <Lock size={16} /> },
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
                    <ChevronLeft size={16} />
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
                        <div className="avatar-wrap">
                            <div className="avatar-ring avatar-ring--lg">
                                <div className="avatar-ring-inner">
                                    <span className="avatar-ring-letter avatar-ring-letter--lg">
                                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            </div>
                            <span className="avatar-ring-anim" />
                            <span className="avatar-online">
                                <span className="avatar-online-pulse" />
                            </span>
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
                            <LogOut size={16} />
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