import { useState, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Ticket, Wallet, BadgeDollarSign, ClipboardCheck, Flag, Crown, ClipboardList, TrendingUp, Landmark, PencilLine, FlagTriangleRight } from 'lucide-react';
import '../assets/css/Header.css';
import { AuthContext } from '../context/AuthContext';
import Button from './ui/Button';
import Container from './ui/Container';
import NotificationBell from './NotificationBell';

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Races', href: '/races' },
  { label: 'Results', href: '/results' },
  { label: 'Jockeys', href: '/jockeys' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  const handleNavigateProfile = () => navigate('/profile');

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 12);
    }
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHomepage = pathname === '/';
  const isTransparent = isHomepage && !scrolled;

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}${isTransparent ? ' header--transparent' : ''}`}>
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
          </ul>
        </nav>

        <div className={`header__actions${menuOpen ? ' open' : ''}`}>
          {user && <NotificationBell />}
          {user ? (
            <div className="header__user">
              <span className="header__username">{user.username}</span>
              <button
                type="button"
                className="header__avatar"
                title="Account"
              >
                {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </button>

              <div className="header__dropdown">
                <div className="header__dropdown-inner">
                  <button type="button" className="header__dropdown-item" onClick={handleNavigateProfile}>
                    <User size={16} />
                    <span>Account</span>
                  </button>
                  {user?.role === 'ADMIN' && (
                    <>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/admin/users')}>
                        <LayoutDashboard size={16} />
                        <span>Admin Panel</span>
                      </button>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/admin/approve-horses')}>
                        <ClipboardCheck size={16} />
                        <span>Approve Horses</span>
                      </button>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/admin/races/create')}>
                        <Flag size={16} />
                        <span>Create Race</span>
                      </button>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/admin/races')}>
                        <PencilLine size={16} />
                        <span>Edit Race</span>
                      </button>
                    </>
                  )}
                  {(user?.role === 'ADMIN' || user?.role === 'STAFF') && (
                    <>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/admin/deposits')}>
                        <BadgeDollarSign size={16} />
                        <span>Deposit Requests</span>
                      </button>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/admin/set-odds')}>
                        <TrendingUp size={16} />
                        <span>Set Odds</span>
                      </button>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/admin/wallet')}>
                        <Landmark size={16} />
                        <span>System Wallet</span>
                      </button>
                    </>
                  )}
                  {user?.role === 'REFEREE' && (
                    <button type="button" className="header__dropdown-item" onClick={() => navigate('/referee/races')}>
                      <Flag size={16} />
                      <span>Race Control</span>
                    </button>
                  )}
                  {user?.role === 'HORSE_OWNER' && (
                    <>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/horse-owner/horses')}>
                        <Crown size={16} />
                        <span>My Horses</span>
                      </button>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/horse-owner/race-registrations')}>
                        <ClipboardList size={16} />
                        <span>My Registrations</span>
                      </button>
                      <button type="button" className="header__dropdown-item" onClick={() => navigate('/horse-owner/register-race')}>
                        <FlagTriangleRight size={16} />
                        <span>Register to Race</span>
                      </button>
                    </>
                  )}
                  {user?.role === 'USER' && (
                    <button type="button" className="header__dropdown-item" onClick={() => navigate('/my-bets')}>
                      <Ticket size={16} />
                      <span>My Bets</span>
                    </button>
                  )}
                  {user?.role !== 'ADMIN' && user?.role !== 'STAFF' && (
                    <button type="button" className="header__dropdown-item" onClick={() => navigate('/my-wallet')}>
                      <Wallet size={16} />
                      <span>My Wallet</span>
                    </button>
                  )}
                  <button type="button" className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
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