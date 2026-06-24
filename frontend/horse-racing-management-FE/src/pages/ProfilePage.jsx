import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, IdCard, Shield, CheckCircle, LogOut } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'
import DashboardPageHeader from '../components/rd/DashboardPageHeader'
import Seo from '../components/seo/Seo'
import '../assets/css/ProfilePage.css'
import '../assets/css/rd/workspace.css'

const ROLE_CLASS = {
  ADMIN: 'profile__badge--admin', STAFF: 'profile__badge--staff', HORSE_OWNER: 'profile__badge--owner',
  JOCKEY: 'profile__badge--jockey', REFEREE: 'profile__badge--referee', USER: 'profile__badge--user',
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
    try { await refreshUser() }
    catch (err) { setError(err.response?.data?.message || 'Unable to refresh. Please try again.') }
  }

  const handleLogout = () => {
    const confirmed = window.confirm('Are you sure you want to log out?')
    if (!confirmed) return
    logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="ws-page">
        <div className="ws-body ws-body--narrow">
          <div className="ws-panel">
            <div className="profile__identity">
              <div className="profile__hero-avatar profile__skeleton" />
              <div className="profile__hero-info">
                <div className="profile__skeleton profile__skeleton-line" style={{ width: '70%' }} />
                <div className="profile__skeleton profile__skeleton-line" style={{ width: '45%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="ws-page">
      <Seo title="My Profile" description="View and manage your Royal Derby account." />
      <DashboardPageHeader
        eyebrow="My Account"
        title={getValue(user?.fullName || user?.username)}
        subtitle={`${user?.role} · ${user?.status}`}
      />

      <div className="ws-body ws-body--narrow">
        {error && (
          <div className="ws-error">
            <span>{error}</span>
            <button type="button" className="profile__retry-btn" onClick={handleRefresh}>Retry</button>
          </div>
        )}

        <div className="ws-panel">
          {/* Avatar + badges */}
          <div className="profile__identity" style={{ padding: 'var(--space-6)' }}>
            <div className="profile__hero-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.fullName || user.username} className="profile__hero-image" />
              ) : (
                <div className="profile__hero-fallback">{avatarInitial}</div>
              )}
            </div>
            <div className="profile__hero-info">
              <h1 className="profile__hero-title">{getValue(user?.fullName || user?.username)}</h1>
              <div className="profile__hero-badges">
                <span className={`profile__badge ${roleClass}`}>{getValue(user?.role)}</span>
                <span className="profile__badge profile__badge--status">{getValue(user?.status)}</span>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div style={{ borderTop: '1px solid var(--border)', padding: 'var(--space-6)' }}>
            <div className="profile__grid">
              {[
                { icon: User,         label: 'Username',     value: user?.username },
                { icon: Mail,         label: 'Email',        value: user?.email },
                { icon: Phone,        label: 'Phone Number', value: user?.phoneNumber },
                { icon: IdCard,       label: 'Full Name',    value: user?.fullName },
                { icon: Shield,       label: 'Role',         value: user?.role },
                { icon: CheckCircle,  label: 'Status',       value: user?.status },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="profile__field">
                  <div className="profile__field-icon"><Icon size={17} /></div>
                  <div>
                    <p className="profile__field-label">{label}</p>
                    <p className="profile__field-value">{getValue(value)}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="profile__logout-btn" type="button" onClick={handleLogout} style={{ marginTop: 'var(--space-6)' }}>
              <LogOut size={17} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
