import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Settings, LogOut, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import '../assets/css/AppHeader.css';

export default function AppHeader() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/races?search=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="app-header">
      {/* Logo */}
      <Link to="/" className="app-header__logo">
        <span className="app-header__logo-royal">Royal</span>
        <span className="app-header__logo-derby">Derby</span>
      </Link>

      {/* Search */}
      <form className="app-header__search" onSubmit={handleSearch}>
        <Search size={15} className="app-header__search-icon" />
        <input
          type="text"
          placeholder="Search races..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="app-header__search-input"
        />
      </form>

      {/* Right actions */}
      <div className="app-header__actions">
        <NotificationBell />

        <Link to="/profile" className="app-header__icon-btn" title="Settings">
          <Settings size={18} />
        </Link>

        <div className="app-header__user">
          <span className="app-header__username">{user?.username}</span>
          <button
            type="button"
            className="app-header__avatar"
            title="Account"
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </button>

          <div className="app-header__dropdown">
            <div className="app-header__dropdown-inner">
              <button className="app-header__dropdown-item" onClick={() => navigate('/profile')}>
                <User size={15} /> Profile
              </button>
              <button className="app-header__dropdown-item app-header__dropdown-item--danger" onClick={handleLogout}>
                <LogOut size={15} /> Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
