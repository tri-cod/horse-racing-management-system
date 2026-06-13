import { useState, useContext, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Ticket, Plus, Wallet } from 'lucide-react';
import '../assets/css/Header.css';
import { AuthContext } from '../context/AuthContext';
import Button from './ui/Button';
import Container from './ui/Container';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Races', href: '/races' },
  { label: 'Horses', href: '/horses' },
  { label: 'Jockeys', href: '/jockeys' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const dropdownRef = useRef(null);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleNavigateProfile = () => { navigate('/profile'); setDropdownOpen(false); };
  const handleNavigateBets    = () => { navigate('/my-bets'); setDropdownOpen(false); };
  const handleNavigateWallet  = () => { navigate('/my-wallet'); setDropdownOpen(false); };

  const handleLogout = async () => { await logout(); navigate('/'); };

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

  useEffect(() => {
    function handleScroll() { setScrolled(window.scrollY > 12); }
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCustomer = user?.role === 'USER';

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>
      <Container className="header__inner">
        <Link to="/" className="header__logo">
          <span className="header__logo-royal">Royal</span>
          <span className="header__logo-derby">Derby</span>
        </Link>

        <nav className="header__nav-wrap">
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

            {user?.role === 'HORSE_OWNER' && (
              <li className="header__nav-item">
                <Link
                  to="/horse-owner/horses"
                  className={pathname.startsWith('/horse-owner/horses') ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  My Horses
                </Link>
              </li>
            )}

            {user?.role === 'ADMIN' && (
              <li className="header__nav-item">
                <Link
                  to="/admin/users"
                  className={pathname.startsWith('/admin') ? 'active' : ''}
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className={`header__actions${menuOpen ? ' open' : ''}`}>
          {user ? (
            <div className="header__user" ref={dropdownRef}>
              <span className="header__welcome">Hello</span>
              <span className="header__username">{user.username}</span>
              <button
                type="button"
                className="header__avatar"
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                onClick={toggleDropdown}
                title="Account"
              >
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </button>

              <div className={`header__dropdown${dropdownOpen ? ' open' : ''}`}>

              
                <button type="button" className="header__dropdown-item" onClick={handleNavigateProfile}>
                  <User size={16} />
                  <span>My Profile</span>
                </button>

          
                {isCustomer && (
                  <button
                    type="button"
                    className={`header__dropdown-item${pathname === '/my-bets' ? ' header__dropdown-item--active' : ''}`}
                    onClick={handleNavigateBets}
                  >
                    <Ticket size={16} />
                    <span>My Bets</span>
                  </button>
                )}

                
                {user && (
                  <button
                    type="button"
                    className={`header__dropdown-item${pathname === '/my-wallet' ? ' header__dropdown-item--active' : ''}`}
                    onClick={handleNavigateWallet}
                  >
                    <Wallet size={16} />
                    <span>My Wallet</span>
                  </button>
                )}

               
                {user?.role === 'ADMIN' && (
                  <>
                    <button type="button" className="header__dropdown-item"
                      onClick={() => { navigate('/admin/users'); setDropdownOpen(false); }}>
                      <User size={16} />
                      <span>Manage Users</span>
                    </button>
                    <button type="button" className="header__dropdown-item"
                      onClick={() => { navigate('/admin/races/create'); setDropdownOpen(false); }}>
                      <Plus size={16} />
                      <span>Create Race</span>
                    </button>
                    <button type="button"
                      className={`header__dropdown-item${pathname === '/admin/deposits' ? ' header__dropdown-item--active' : ''}`}
                      onClick={() => { navigate('/admin/deposits'); setDropdownOpen(false); }}>
                      <Wallet size={16} />
                      <span>Deposits</span>
                    </button>
                  </>
                )}

                {/* Log Out */}
                <button type="button" className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>

              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="header__link-btn">Log In</Link>
              <Link to="/register">
                <Button variant="primary" size="sm">Sign Up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="header__hamburger"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </Container>
    </header>
  );
}

export default Header;