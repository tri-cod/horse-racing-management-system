import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../assets/css/Header.css';

const NAV_ITEMS = [
  { label: 'Races', href: '/races' },
  { label: 'Bet', href: '/bet' },
  { label: 'Venue hire', href: '/venue-hire' },
  { label: 'News', href: '/news' },
  { label: 'About', href: '/about' },
];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleMenu = () => setMenuOpen((prev) => !prev);

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
        <Link to="/register">
          <button className="header__btn-signup">Sign up</button>
        </Link>
        <Link to="/login">
          <button className="header__btn-login">Log in</button>
        </Link>
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
