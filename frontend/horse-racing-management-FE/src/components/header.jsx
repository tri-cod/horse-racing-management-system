import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, User, LogOut, LayoutDashboard, ChevronRight, Crown,
  ChevronDown, Calendar, MapPin, Trophy, Users, Flag, Ticket,
} from 'lucide-react';
import '../assets/css/Header.css';
import { AuthContext } from '../context/AuthContext';
import Button from './ui/Button';
import Container from './ui/Container';
import NotificationBell from './NotificationBell';
import { getRaces } from '../api/raceApi';
import { getJockeyList } from '../api/jockeyApi';

const DASHBOARD_ROUTE = {
  ADMIN: '/admin/users', STAFF: '/admin/deposits', REFEREE: '/referee/races',
  HORSE_OWNER: '/horse-owner/horses', TRAINER: '/trainer/profile',
  USER: '/my-bets', SPECTATOR: '/my-bets', JOCKEY: '/my-wallet',
};

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Race mini-card used inside dropdown ─────────────────── */
function RaceMiniCard({ race, featured = false }) {
  return (
    <Link to={`/races/${race.id}`} className={`nav-race-card${featured ? ' nav-race-card--featured' : ''}`}>
      {race.bannerImageurl && (
        <div className="nav-race-card__img-wrap">
          <img src={race.bannerImageurl} alt={race.raceName} className="nav-race-card__img" loading="lazy" />
          <div className="nav-race-card__img-overlay" />
        </div>
      )}
      <div className="nav-race-card__body">
        <span className="nav-race-card__label tnum">
          {featured ? 'Next Race' : fmtDate(race.startTime)}
        </span>
        <span className="nav-race-card__name">{race.raceName}</span>
        {race.location && (
          <span className="nav-race-card__meta">
            <MapPin size={11} /> {race.location}
          </span>
        )}
        {featured && race.startTime && (
          <span className="nav-race-card__meta tnum">
            <Calendar size={11} /> {fmtDate(race.startTime)}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── Main Header ─────────────────────────────────────────── */
function Header() {
  const [menuOpen, setMenuOpen]     = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [activeNav, setActiveNav]   = useState(null);   // 'races' | 'results' | 'jockeys' | null
  const [allRaces, setAllRaces]     = useState([]);
  const [allJockeys, setAllJockeys] = useState([]);
  const closeTimer                   = useRef(null);

  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { user, logout } = useContext(AuthContext);

  /* fetch races + jockeys once for the dropdowns */
  useEffect(() => {
    getRaces({ page: 0, size: 50 })
      .then((data) => setAllRaces(data?.content ?? []))
      .catch(() => {});
    getJockeyList()
      .then((data) => setAllJockeys(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  /* scroll effect */
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* close menu on route change */
  useEffect(() => { setMenuOpen(false); setActiveNav(null); }, [pathname]);

  /* hover helpers — small delay prevents flicker when moving mouse */
  const openNav  = useCallback((key) => { clearTimeout(closeTimer.current); setActiveNav(key); }, []);
  const closeNav = useCallback(() => { closeTimer.current = setTimeout(() => setActiveNav(null), 150); }, []);
  const keepNav  = useCallback(() => { clearTimeout(closeTimer.current); }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMenuOpen(false);
  };

  const dashRoute = user ? DASHBOARD_ROUTE[user.role] : null;

  /* derive race lists */
  const previousRaces = allRaces
    .filter((r) => r.status === 'FINISHED')
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 1);

  const nextRace = allRaces
    .filter((r) => ['ONGOING', 'CLOSED_REGISTRATION', 'OPEN_REGISTRATION'].includes(r.status))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))[0] ?? null;

  const upcomingRaces = allRaces
    .filter((r) => ['UPCOMING', 'OPEN_REGISTRATION'].includes(r.status))
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 4);

  return (
    <header className={`header${scrolled ? ' header--scrolled' : ''}`}>

      {/* ── Utility strip ── */}
      <div className="header__utility">
        <Container className="header__utility-inner">
          <span className="header__season-tag">
            <Crown size={11} />
            Royal Derby Season 2026
          </span>
          <div className="header__utility-links">
            {!user && (
              <>
                <Link to="/login"    className="header__util-link">Sign In</Link>
                <span className="header__util-sep">·</span>
                <Link to="/register" className="header__util-link">Register</Link>
              </>
            )}
            {user && dashRoute && (
              <Link to={dashRoute} className="header__util-link header__util-link--dash">
                Dashboard <ChevronRight size={11} />
              </Link>
            )}
          </div>
        </Container>
      </div>

      {/* ── Main nav ── */}
      <div className={`header__main${scrolled ? ' header__main--border' : ''}`}>
        <Container className="header__inner">

          {/* Brand mark */}
          <Link to="/" className="header__logo" aria-label="Royal Derby home">
            <span className="header__logo-royal">Royal</span>
            <em className="header__logo-derby">Derby</em>
          </Link>

          {/* Desktop nav */}
          <nav className="header__nav-wrap" aria-label="Main">
            <ul className="header__nav">

              {/* Schedule — mega dropdown */}
              <li
                className="header__nav-item header__nav-item--has-dropdown"
                onMouseEnter={() => openNav('races')}
                onMouseLeave={closeNav}
              >
                <Link to="/races" className={`header__nav-trigger${pathname.startsWith('/races') ? ' active' : ''}`}>
                  Schedule <ChevronDown size={13} className="header__nav-chevron" />
                </Link>

                <div
                  className={`header__mega-dropdown${activeNav === 'races' ? ' header__mega-dropdown--open' : ''}`}
                  onMouseEnter={keepNav}
                  onMouseLeave={closeNav}
                >
                  <div className="header__mega-inner">
                    {/* Previous */}
                    <div className="header__mega-col">
                      <h4 className="header__mega-col-title">Previous</h4>
                      {previousRaces.length === 0 ? (
                        <p className="header__mega-empty">No finished races yet</p>
                      ) : (
                        previousRaces.map((race) => <RaceMiniCard key={race.id} race={race} />)
                      )}
                    </div>

                    {/* Next */}
                    <div className="header__mega-col header__mega-col--next">
                      <h4 className="header__mega-col-title">Next</h4>
                      {nextRace ? (
                        <RaceMiniCard race={nextRace} featured />
                      ) : (
                        <p className="header__mega-empty">No race scheduled</p>
                      )}
                    </div>

                    {/* Upcoming */}
                    <div className="header__mega-col">
                      <h4 className="header__mega-col-title">Upcoming</h4>
                      {upcomingRaces.length === 0 ? (
                        <p className="header__mega-empty">No upcoming races</p>
                      ) : (
                        upcomingRaces.map((race) => <RaceMiniCard key={race.id} race={race} />)
                      )}
                    </div>

                    {/* Footer CTA */}
                    <div className="header__mega-footer">
                      <Link to="/races" className="header__mega-cta">
                        <Flag size={14} /> Full Schedule
                      </Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* Results — simple dropdown */}
              <li
                className="header__nav-item header__nav-item--has-dropdown"
                onMouseEnter={() => openNav('results')}
                onMouseLeave={closeNav}
              >
                <Link to="/results" className={`header__nav-trigger${pathname === '/results' ? ' active' : ''}`}>
                  Results <ChevronDown size={13} className="header__nav-chevron" />
                </Link>

                <div
                  className={`header__simple-dropdown${activeNav === 'results' ? ' header__simple-dropdown--open' : ''}`}
                  onMouseEnter={keepNav}
                  onMouseLeave={closeNav}
                >
                  <div className="header__simple-inner">
                    <Link to="/results" className="header__simple-item">
                      <Trophy size={15} />
                      <div>
                        <span className="header__simple-item-name">Race Results</span>
                        <span className="header__simple-item-sub">Final standings & prize distribution</span>
                      </div>
                    </Link>
                    <Link to="/races" className="header__simple-item">
                      <Flag size={15} />
                      <div>
                        <span className="header__simple-item-name">Race Schedule</span>
                        <span className="header__simple-item-sub">All upcoming and past races</span>
                      </div>
                    </Link>
                  </div>
                </div>
              </li>

              {/* Bet — simple dropdown */}
              <li
                className="header__nav-item header__nav-item--has-dropdown"
                onMouseEnter={() => openNav('bet')}
                onMouseLeave={closeNav}
              >
                <Link to="/races" className={`header__nav-trigger${pathname === '/my-bets' ? ' active' : ''}`}>
                  Bet <ChevronDown size={13} className="header__nav-chevron" />
                </Link>

                <div
                  className={`header__simple-dropdown${activeNav === 'bet' ? ' header__simple-dropdown--open' : ''}`}
                  onMouseEnter={keepNav}
                  onMouseLeave={closeNav}
                >
                  <div className="header__simple-inner">
                    <Link to="/races" className="header__simple-item">
                      <Trophy size={15} />
                      <div>
                        <span className="header__simple-item-name">Place a Bet</span>
                        <span className="header__simple-item-sub">Browse races and place your wager</span>
                      </div>
                    </Link>
                    {user && (
                      <Link to="/my-bets" className="header__simple-item">
                        <Ticket size={15} />
                        <div>
                          <span className="header__simple-item-name">My Bets</span>
                          <span className="header__simple-item-sub">Track your bets and results</span>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </li>

              {/* Jockeys — mega grid dropdown */}
              <li
                className="header__nav-item header__nav-item--has-dropdown"
                onMouseEnter={() => openNav('jockeys')}
                onMouseLeave={closeNav}
              >
                <Link to="/jockeys" className={`header__nav-trigger${pathname === '/jockeys' ? ' active' : ''}`}>
                  Jockeys <ChevronDown size={13} className="header__nav-chevron" />
                </Link>

                <div
                  className={`header__mega-dropdown${activeNav === 'jockeys' ? ' header__mega-dropdown--open' : ''}`}
                  onMouseEnter={keepNav}
                  onMouseLeave={closeNav}
                >
                  <div className="header__jockey-mega">
                    {allJockeys.length === 0 ? (
                      <p className="header__mega-empty">No jockeys available</p>
                    ) : (
                      <div className="header__jockey-grid">
                        {allJockeys.slice(0, 12).map((jockey, idx) => {
                          const parts = (jockey.name || '').split(' ');
                          const firstName = parts[0] || '';
                          const lastName  = parts.slice(1).join(' ') || '';
                          const initial   = firstName.charAt(0).toUpperCase();
                          return (
                            <Link key={jockey.id} to="/jockeys" className="header__jockey-item">
                              <div className={`header__jockey-avatar header__jockey-avatar--${(idx % 6) + 1}`}>
                                {initial}
                              </div>
                              <div className="header__jockey-name">
                                <span className="header__jockey-first">{firstName}</span>
                                <span className="header__jockey-last">{lastName.toUpperCase()}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                    <div className="header__mega-footer">
                      <Link to="/jockeys" className="header__mega-cta">
                        <Users size={14} /> All Jockeys
                      </Link>
                    </div>
                  </div>
                </div>
              </li>

            </ul>
          </nav>

          {/* Desktop actions */}
          <div className="header__actions">
            {user ? (
              <>
                <NotificationBell />
                <div className="header__user">
                  <button type="button" className="header__avatar" title="Account">
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </button>
                  <div className="header__dropdown">
                    <div className="header__dropdown-inner">
                      <div className="header__dropdown-user">
                        <span className="header__dropdown-username">{user.username}</span>
                        <span className="header__dropdown-role">{user.role}</span>
                      </div>
                      <div className="header__dropdown-divider" />
                      {dashRoute && (
                        <Link to={dashRoute} className="header__dropdown-item">
                          <LayoutDashboard size={14} /> Dashboard
                        </Link>
                      )}
                      <Link to="/profile" className="header__dropdown-item">
                        <User size={14} /> Profile
                      </Link>
                      <div className="header__dropdown-divider" />
                      <button className="header__dropdown-item header__dropdown-item--danger" onClick={handleLogout}>
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="header__link-btn">Sign In</Link>
                <Button as={Link} to="/register" variant="dark" size="sm">Join Now</Button>
              </>
            )}
          </div>

          {/* Hamburger */}
          <button className="header__hamburger" onClick={() => setMenuOpen((p) => !p)} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </Container>
      </div>

      {/* ── Mobile drawer ── */}
      {menuOpen && (
        <div className="header__mobile-drawer">
          <nav>
            <ul className="header__mobile-nav">
              {[
                { label: 'Schedule', href: '/races' },
                { label: 'Results',  href: '/results' },
                { label: 'Bet',      href: '/races' },
                { label: 'Jockeys',  href: '/jockeys' },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    to={item.href}
                    className={`header__mobile-link${pathname === item.href ? ' active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header__mobile-actions">
            {user ? (
              <>
                {dashRoute && <Link to={dashRoute} className="header__mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
                <button className="header__mobile-link header__mobile-link--danger" onClick={handleLogout}>Log Out</button>
              </>
            ) : (
              <>
                <Link to="/login"    className="header__mobile-link" onClick={() => setMenuOpen(false)}>Sign In</Link>
                <Link to="/register" className="header__mobile-link" onClick={() => setMenuOpen(false)}>Register</Link>
              </>
            )}
          </div>
        </div>
      )}

    </header>
  );
}

export default Header;
