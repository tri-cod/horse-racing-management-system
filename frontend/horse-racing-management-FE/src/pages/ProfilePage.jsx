import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, IdCard, Shield, CheckCircle, LogOut } from 'lucide-react'
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
  const { user, refreshUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  const avatarInitial = user?.username?.charAt(0)?.toUpperCase() || 'U'
  const roleClass = ROLE_CLASS[user?.role] || 'profile__badge--user'

  const handleRefresh = async () => {
    setError(null)
    try {
      await refreshUser()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to refresh your information. Please try again.')
    }
  }

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to log out?')
    if (!confirmed) {
      return
    }

    await logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-page__container">
          <div className="profile__card">
            <div className="profile__identity">
              <div className="profile__hero-avatar profile__skeleton" />
              <div className="profile__hero-info">
                <div className="profile__skeleton profile__skeleton-line" style={{ width: '70%' }} />
                <div className="profile__skeleton profile__skeleton-line" style={{ width: '45%' }} />
                <div className="profile__hero-badges">
                  <div className="profile__skeleton" style={{ width: '110px', height: '34px' }} />
                  <div className="profile__skeleton" style={{ width: '90px', height: '34px' }} />
                </div>
              </div>
            </div>

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
      <div className="profile-page__container">
        <div className="profile__card">
          <div className="profile__identity">
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
              <p className="profile__hero-subtitle">Your Profile</p>
              <h1 className="profile__hero-title">{getValue(user?.fullName || user?.username)}</h1>
              <div className="profile__hero-badges">
                <span className={`profile__badge ${roleClass}`}>{getValue(user?.role)}</span>
                <span className="profile__badge profile__badge--status">{getValue(user?.status)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="profile__error-banner">
              <span>{error}</span>
              <button type="button" className="profile__retry-btn" onClick={handleRefresh}>
                Try Again
              </button>
            </div>
          )}

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
              <div className="profile__field-icon"><Phone size={18} /></div>
              <div>
                <p className="profile__field-label">Phone Number</p>
                <p className="profile__field-value">{getValue(user?.phoneNumber)}</p>
              </div>
            </div>

            <div className="profile__field">
              <div className="profile__field-icon"><IdCard size={18} /></div>
              <div>
                <p className="profile__field-label">Full Name</p>
                <p className="profile__field-value">{getValue(user?.fullName)}</p>
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

          <button className="profile__logout-btn" type="button" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}
