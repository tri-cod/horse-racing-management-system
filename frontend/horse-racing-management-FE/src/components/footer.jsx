import { Globe, Camera, Video, MessageCircle, MapPin, Phone, Mail } from 'lucide-react';
import Container from './ui/Container';
import '../assets/css/Footer.css';

const ABOUT_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Rules', href: '/rules' },
  { label: 'Our Team', href: '/about#team' },
  { label: 'Contact', href: '/contact' },
];

const EXPLORE_LINKS = [
  { label: 'Race Schedule', href: '/races' },
  { label: 'Jockeys', href: '/jockeys' },
  { label: 'Horse Collection', href: '/horses' },
  { label: 'News', href: '/news' },
];

const SOCIALS = [
  { label: 'Facebook', href: '#', Icon: Globe },
  { label: 'Instagram', href: '#', Icon: Camera },
  { label: 'Youtube', href: '#', Icon: Video },
  { label: 'Twitter', href: '#', Icon: MessageCircle },
];

function Footer() {
  return (
    <footer className="footer">
      <Container>
        <div className="footer__main">
          <div className="footer__brand">
            <a href="/" className="footer__brand-logo">
              <img src="/logopage.png" alt="Royal Derby" className="footer__brand-logo-img" />
            </a>
            <p className="footer__brand-desc">
              An international-class horse racing arena — where champion jockeys, mighty
              steeds and unforgettable moments of the sport come together.
            </p>
            <ul className="footer__contact">
              <li><MapPin size={16} /><span>285 W Huntington Dr, Arcadia, CA 91007</span></li>
              <li><Phone size={16} /><span>+84 28 1234 5678</span></li>
              <li><Mail size={16} /><span>contact@royalderby.vn</span></li>
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">About Royal Derby</h4>
            <ul className="footer__col-list">
              {ABOUT_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Explore</h4>
            <ul className="footer__col-list">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.href}>
                  <a href={item.href}>{item.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__col-title">Follow Us</h4>
            <div className="footer__socials">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a key={label} href={href} className="footer__social-icon" aria-label={label}>
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <hr className="footer__divider" />

        <div className="footer__bottom">
          <p>&copy; {new Date().getFullYear()} Royal Derby. All rights reserved.</p>
          <div className="footer__legal">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
