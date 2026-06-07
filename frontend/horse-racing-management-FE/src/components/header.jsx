import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../assets/css/Header.css';
import { AuthContext } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Races', href: '/races' },
  { label: 'Bet', href: '/bet' },
  { label: 'Venue hire', href: '/venue-hire' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleNavigateProfile = () => {
    navigate('/profile');
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const toggleDropdown = (event) => {
    event.stopPropagation();
    setDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    window.addEventListener('click', handleOutside);
    return () => window.removeEventListener('click', handleOutside);
  }, []);

  return (
    <header className="header">
      <Link to="/" className="header__logo">
        <span className="header__logo-royal">Royal</span>
        <span className="header__logo-derby">Derby</span>
      </Link>

      <nav>
        <ul className={`header__nav${menuOpen ? ' open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <li key={item.href} className="header__nav-item">
              <Link
                to={item.href}
                className={pathname === item.href ? 'active' : ''}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={`header__actions${menuOpen ? ' open' : ''}`}>
        {user ? (
          <div className="header__user" ref={dropdownRef}>
            <span className="header__welcome">WELCOME</span>
            <span className="header__username">{user.username}</span>
            <button
              type="button"
              className="header__avatar"
              aria-haspopup="menu"
              aria-expanded={dropdownOpen}
              onClick={toggleDropdown}
              title="Tài khoản"
            >
              {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
            </button>

            <div className={`header__dropdown${dropdownOpen ? ' open' : ''}`}>
              <button type="button" className="header__dropdown-item" onClick={handleNavigateProfile}>
                My profile
              </button>
              <button type="button" className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link to="/register">
              <button className="header__btn-signup">Sign up</button>
            </Link>
            <Link to="/login">
              <button className="header__btn-login">Log in</button>
            </Link>
          </>
        )}
      </div>

      <button
        className="header__hamburger"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}

export default Header;
