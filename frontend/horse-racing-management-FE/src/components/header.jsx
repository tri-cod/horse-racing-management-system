import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, User, LogOut, LayoutDashboard,
  ChevronDown, Calendar, MapPin, Trophy, Users, Flag, Ticket,
} from 'lucide-react';
import '../assets/css/Header.css';
import { AuthContext } from '../context/AuthContext';
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
  const [activeNav, setActiveNav]   = useState(null);
  const [seasonOpen, setSeasonOpen] = useState(false);
  const [allRaces, setAllRaces]     = useState([]);
  const [allJockeys, setAllJockeys] = useState([]);
  const closeTimer                   = useRef(null);
  const seasonRef                    = useRef(null);

  const { pathname } = useLocation();
  const navigate     = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // Races là public endpoint — fetch một lần khi mount
  useEffect(() => {
    getRaces({ page: 0, size: 50 })
      .then((data) => setAllRaces(data?.content ?? []))
      .catch(() => {});
  }, []);

  // Jockeys yêu cầu auth — chỉ fetch khi đã đăng nhập
  useEffect(() => {
    if (!user) { setAllJockeys([]); return; }
    getJockeyList()
      .then((data) => setAllJockeys(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user]);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setActiveNav(null); setSeasonOpen(false); }, [pathname]);

  useEffect(() => {
    function handleClick(e) {
      if (seasonRef.current && !seasonRef.current.contains(e.target)) {
        setSeasonOpen(false);
      }
    }
    if (seasonOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [seasonOpen]);

  const openNav  = useCallback((key) => { clearTimeout(closeTimer.current); setActiveNav(key); }, []);
  const closeNav = useCallback(() => { closeTimer.current = setTimeout(() => setActiveNav(null), 150); }, []);
  const keepNav  = useCallback(() => { clearTimeout(closeTimer.current); }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const dashRoute = user ? DASHBOARD_ROUTE[user.role] : null;

  /* derive seasons from race data */
  const raceYears = [...new Set(allRaces.map((r) => new Date(r.startTime).getFullYear()))].sort((a, b) => b - a);
  const currentSeason  = raceYears.length > 0 ? raceYears[0] : new Date().getFullYear();
  const previousSeasons = raceYears.slice(1);

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

          {/* Season selector */}
          <div ref={seasonRef} className="header__season-selector">
            <button
              type="button"
              className="header__season-tag header__season-tag--btn"
              onClick={() => setSeasonOpen((p) => !p)}
            >
              Season {currentSeason}
              <ChevronDown
                size={15}
                className={`header__season-chevron${seasonOpen ? ' header__season-chevron--open' : ''}`}
              />
            </button>

            <div className={`header__season-dropdown${seasonOpen ? ' header__season-dropdown--open' : ''}`}>
              <div className="header__season-dropdown-inner">
                <h4 className="header__mega-col-title">Past Seasons</h4>
                {previousSeasons.length === 0 ? (
                  <p className="header__mega-empty">No previous seasons</p>
                ) : (
                  previousSeasons.map((year) => {
                    const count = allRaces.filter((r) => new Date(r.startTime).getFullYear() === year).length;
                    return (
                      <Link
                        key={year}
                        to={`/results?year=${year}`}
                        className="header__season-item"
                        onClick={() => setSeasonOpen(false)}
                      >
                        <Trophy size={15} />
                        <div>
                          <span className="header__season-item-name">Season {year}</span>
                          <span className="header__season-item-sub">{count} race{count !== 1 ? 's' : ''}</span>
                        </div>
                      </Link>
                    );
                  })
                )}
                <div className="header__mega-footer">
                  <Link to="/results" className="header__mega-cta" onClick={() => setSeasonOpen(false)}>
                    <Flag size={14} /> Race Archive
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: auth actions */}
          <div className="header__utility-links">
            {!user ? (
              <>
                <Link to="/login"    className="header__util-link">Sign In</Link>
                <span className="header__util-sep">·</span>
                <Link to="/register" className="header__util-link header__util-link--register">Register</Link>
              </>
            ) : (
              <>
                <NotificationBell />
                <span className="header__username-label">{user.username}</span>
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
            )}
          </div>
        </Container>
      </div>

      {/* ── Main nav ── */}
      <div className={`header__main${scrolled ? ' header__main--border' : ''}`}>
        <Container className="header__inner">

          {/* Brand mark */}
          <Link to="/" className="header__logo" aria-label="Royal Derby home">
            <img src="/logopage.png" alt="Royal Derby" className="header__logo-img" />
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
                    <div className="header__mega-col">
                      <h4 className="header__mega-col-title">Previous</h4>
                      {previousRaces.length === 0 ? (
                        <p className="header__mega-empty">No finished races yet</p>
                      ) : (
                        previousRaces.map((race) => <RaceMiniCard key={race.id} race={race} />)
                      )}
                    </div>

                    <div className="header__mega-col header__mega-col--next">
                      <h4 className="header__mega-col-title">Next</h4>
                      {nextRace ? (
                        <RaceMiniCard race={nextRace} featured />
                      ) : (
                        <p className="header__mega-empty">No race scheduled</p>
                      )}
                    </div>

                    <div className="header__mega-col">
                      <h4 className="header__mega-col-title">Upcoming</h4>
                      {upcomingRaces.length === 0 ? (
                        <p className="header__mega-empty">No upcoming races</p>
                      ) : (
                        upcomingRaces.map((race) => <RaceMiniCard key={race.id} race={race} />)
                      )}
                    </div>

                    <div className="header__mega-footer">
                      <Link to="/races" className="header__mega-cta">
                        <Flag size={14} /> Full Schedule
                      </Link>
                    </div>
                  </div>
                </div>
              </li>

              {/* Results — mega dropdown */}
              <li
                className="header__nav-item header__nav-item--has-dropdown"
                onMouseEnter={() => openNav('results')}
                onMouseLeave={closeNav}
              >
                <Link to="/results" className={`header__nav-trigger${pathname === '/results' ? ' active' : ''}`}>
                  Results <ChevronDown size={13} className="header__nav-chevron" />
                </Link>

                <div
                  className={`header__mega-dropdown${activeNav === 'results' ? ' header__mega-dropdown--open' : ''}`}
                  onMouseEnter={keepNav}
                  onMouseLeave={closeNav}
                >
                  <div className="header__mega-inner header__mega-inner--slim">
                    <div className="header__mega-col">
                      <h4 className="header__mega-col-title">Results</h4>
                      <Link to="/results" className="header__mega-nav-item">
                        <Trophy size={15} />
                        <div>
                          <span className="header__mega-nav-item-name">Race Results</span>
                          <span className="header__mega-nav-item-sub">Final standings & prize distribution</span>
                        </div>
                      </Link>
                      <Link to="/races" className="header__mega-nav-item">
                        <Flag size={15} />
                        <div>
                          <span className="header__mega-nav-item-name">Race Schedule</span>
                          <span className="header__mega-nav-item-sub">All upcoming and past races</span>
                        </div>
                      </Link>
                    </div>
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
                          const parts     = (jockey.name || '').split(' ');
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

              {/* Horses — mega dropdown */}
              <li
                className="header__nav-item header__nav-item--has-dropdown"
                onMouseEnter={() => openNav('horses')}
                onMouseLeave={closeNav}
              >
                <Link to="/horse-owner/horses" className={`header__nav-trigger${pathname.startsWith('/horse') ? ' active' : ''}`}>
                  Horses <ChevronDown size={13} className="header__nav-chevron" />
                </Link>

                <div
                  className={`header__mega-dropdown${activeNav === 'horses' ? ' header__mega-dropdown--open' : ''}`}
                  onMouseEnter={keepNav}
                  onMouseLeave={closeNav}
                >
                  <div className="header__mega-inner header__mega-inner--slim">
                    <div className="header__mega-col">
                      <h4 className="header__mega-col-title">Horses</h4>
                      <p className="header__mega-empty">No horses available yet.</p>
                    </div>
                  </div>
                </div>
              </li>

              {/* Bet */}
              <li className="header__nav-item">
                <Link to="/races" className={`header__nav-trigger${pathname === '/my-bets' ? ' active' : ''}`}>
                  Bet
                </Link>
              </li>

            </ul>
          </nav>

          {/* Hamburger */}
          <button
            className="header__hamburger"
            onClick={() => setMenuOpen((p) => !p)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
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
                {dashRoute && (
                  <Link to={dashRoute} className="header__mobile-link" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                )}
                <button className="header__mobile-link header__mobile-link--danger" onClick={handleLogout}>
                  Log Out
                </button>
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
