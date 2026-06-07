import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, IdCard, Shield, CheckCircle, LogOut, ChevronLeft } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import '../assets/css/ProfilePage.css'

const ROLE_CLASS = {
  ADMIN: 'profile__badge--admin',
  STAFF: 'profile__badge--staff',
  HORSE_OWNER: 'profile__badge--owner',
  JOCKEY: 'profile__badge--jockey',
  REFEREE: 'profile__badge--referee',
  USER: 'profile__badge--user',
}

const getValue = (value) => (value ? value : '—')

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const avatarInitial = user?.username?.charAt(0)?.toUpperCase() || 'U'
  const roleClass = ROLE_CLASS[user?.role] || 'profile__badge--user'

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to sign out?')
    if (!confirmed) return
    await logout()
    navigate('/')
  }

  // Skeleton while user is loading
  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-page__container">
          <div className="profile__hero">
            <div className="profile__hero-avatar profile__skeleton" />
            <div className="profile__hero-info">
              <div className="profile__skeleton profile__skeleton-line profile__skeleton-line--lg" />
              <div className="profile__skeleton profile__skeleton-line profile__skeleton-line--md" />
              <div className="profile__hero-badges">
                <div className="profile__skeleton profile__skeleton-badge" />
                <div className="profile__skeleton profile__skeleton-badge" />
              </div>
            </div>
          </div>
          <div className="profile__card">
            <div className="profile__grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="profile__field profile__skeleton profile__skeleton-box" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-back-bar">
        <button className="profile-back-btn" onClick={() => navigate(-1)}>
          <ChevronLeft size={15} />
          Back
        </button>
        <nav className="profile-breadcrumb">
          <span className="profile-breadcrumb__link" onClick={() => navigate('/')}>Home</span>
          <span className="profile-breadcrumb__sep">›</span>
          <span className="profile-breadcrumb__current">Profile</span>
        </nav>
      </div>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-sidebar__user">
            <div className="profile-sidebar__avatar">{avatarInitial}</div>
            <p className="profile-sidebar__name">{getValue(user?.fullName || user?.username)}</p>
            <p className="profile-sidebar__email">{getValue(user?.email)}</p>
            <div className="profile-sidebar__chips">
              <span className={`profile__badge ${roleClass}`}>{getValue(user?.role)}</span>
              <span className="profile__badge profile__badge--status">{getValue(user?.status)}</span>
            </div>
          </div>

          <nav className="profile-sidebar__nav">
            <span className="profile-sidebar__nav-label">Account</span>
            <button className="profile-sidebar__nav-btn profile-sidebar__nav-btn--active">
              <User size={14} />
              Profile
            </button>
            <div className="profile-sidebar__divider" />
            <button className="profile-sidebar__nav-btn profile-sidebar__nav-btn--danger" onClick={handleLogout}>
              <LogOut size={14} />
              Sign out
            </button>
          </nav>
        </aside>

        <div className="profile-page__container">
          <div className="profile__hero">
            <div className="profile__hero-avatar">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.fullName || user.username}
                  className="profile__hero-image"
                />
              ) : (
                <div className="profile__hero-fallback">{avatarInitial}</div>
              )}
            </div>
            <div className="profile__hero-info">
              <p className="profile__hero-subtitle">Your profile</p>
              <h1 className="profile__hero-title">{getValue(user?.fullName || user?.username)}</h1>
              <div className="profile__hero-badges">
                <span className={`profile__badge ${roleClass}`}>{getValue(user?.role)}</span>
                <span className="profile__badge profile__badge--status">{getValue(user?.status)}</span>
              </div>
            </div>
          </div>

          {/* Account info card */}
          <div className="profile__card">
            <div className="profile__card-header">
              <div>
                <h2>Account information</h2>
                <p>Your basic account details</p>
              </div>
            </div>

            <div className="profile__grid">
              <div className="profile__field">
                <div className="profile__field-icon"><User size={18} /></div>
                <div>
                  <p className="profile__field-label">Username</p>
                  <p className="profile__field-value">{getValue(user?.username)}</p>
                </div>
              </div>

              <div className="profile__field">
                <div className="profile__field-icon"><Mail size={18} /></div>
                <div>
                  <p className="profile__field-label">Email</p>
                  <p className="profile__field-value">{getValue(user?.email)}</p>
                </div>
              </div>

              <div className="profile__field">
                <div className="profile__field-icon"><IdCard size={18} /></div>
                <div>
                  <p className="profile__field-label">Full name</p>
                  <p className="profile__field-value">{getValue(user?.fullName)}</p>
                </div>
              </div>

              <div className="profile__field">
                <div className="profile__field-icon"><Phone size={18} /></div>
                <div>
                  <p className="profile__field-label">Phone number</p>
                  <p className="profile__field-value">{getValue(user?.phoneNumber)}</p>
                </div>
              </div>

              <div className="profile__field">
                <div className="profile__field-icon"><Shield size={18} /></div>
                <div>
                  <p className="profile__field-label">Role</p>
                  <p className="profile__field-value">{getValue(user?.role)}</p>
                </div>
              </div>

              <div className="profile__field">
                <div className="profile__field-icon"><CheckCircle size={18} /></div>
                <div>
                  <p className="profile__field-label">Status</p>
                  <p className="profile__field-value">{getValue(user?.status)}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}