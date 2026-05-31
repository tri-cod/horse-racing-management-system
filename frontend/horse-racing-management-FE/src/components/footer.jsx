import { Link } from "react-router-dom";
import { Logo } from "./Header";
import "../assets/css/Footer.css";

const QUICK_LINKS = [
    { label: "Upcoming Races", path: "/races" },
    { label: "Live Results",   path: "/races/live" },
    { label: "Ranking",        path: "/ranking" },
    { label: "Statistics",     path: "/statistics" },
];

const RESOURCES = [
    { label: "Help Center",       path: "/help" },
    { label: "News & Updates",    path: "/news" },
    { label: "Rules & Regulations", path: "/rules" },
    { label: "Contact US",        path: "/contact" },
];

const CONNECT = [
    { label: "Facebook",  href: "https://facebook.com" },
    { label: "Twitter",   href: "https://twitter.com" },
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Youtube",   href: "https://youtube.com" },
];

function Footer() {
    return (
        <footer className="footer">
            <div className="footer__inner">
                {/* Brand column */}
                <div className="footer__brand">
                    <Logo dark />
                    <p className="footer__tagline">
                        Premier horse racing management platform for enthusiasts and professionals.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="footer__col">
                    <h4 className="footer__col-title">Quick Links</h4>
                    <ul className="footer__list">
                        {QUICK_LINKS.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className="footer__link">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Resources */}
                <div className="footer__col">
                    <h4 className="footer__col-title">Resources</h4>
                    <ul className="footer__list">
                        {RESOURCES.map((item) => (
                            <li key={item.path}>
                                <Link to={item.path} className="footer__link">{item.label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Connect */}
                <div className="footer__col">
                    <h4 className="footer__col-title">Connect</h4>
                    <ul className="footer__list">
                        {CONNECT.map((item) => (
                            <li key={item.label}>
                                <a href={item.href} className="footer__link" target="_blank" rel="noreferrer">
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Divider + copyright */}
            <div className="footer__bottom">
                <div className="footer__bottom-inner">
                    <p className="footer__copy">© {new Date().getFullYear()} Royal Derby. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;