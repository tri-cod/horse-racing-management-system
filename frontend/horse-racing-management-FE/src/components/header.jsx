import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../assets/css/Header.css";

const NAV_LINKS = [
    { label: "Races",      path: "/races" },
    { label: "Bet",        path: "/bet" },
    { label: "Venue hire", path: "/venue-hire" },
    { label: "News",       path: "/news" },
    { label: "About",      path: "/about" },
];

function Logo({ dark = false }) {
    return (
        <Link to="/" className="header__logo">
            <span className={`header__logo-royal ${dark ? "header__logo-royal--dark" : ""}`}>Royal</span>
            <span className="header__logo-derby"> Derby</span>
        </Link>
    );
}

function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <header className="header">
            <div className="header__inner">
                {/* Logo */}
                <Logo />

                {/* Nav desktop */}
                <nav className="header__nav">
                    {NAV_LINKS.map((link) => (
                        <Link key={link.path} to={link.path} className="header__nav-link">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="header__actions">
                    <button
                        className="header__btn header__btn--outline"
                        onClick={() => navigate("/register")}
                    >
                        Sign up
                    </button>
                    <button
                        className="header__btn header__btn--filled"
                        onClick={() => navigate("/login")}
                    >
                        Log in
                    </button>
                </div>

                {/* Hamburger mobile */}
                <button
                    className={`header__hamburger ${menuOpen ? "open" : ""}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div className="header__mobile-menu">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className="header__mobile-link"
                            onClick={() => setMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="header__mobile-actions">
                        <button
                            className="header__btn header__btn--outline"
                            onClick={() => { navigate("/register"); setMenuOpen(false); }}
                        >
                            Sign up
                        </button>
                        <button
                            className="header__btn header__btn--filled"
                            onClick={() => { navigate("/login"); setMenuOpen(false); }}
                        >
                            Log in
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
}

export { Logo };
export default Header;