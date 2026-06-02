import '../assets/css/Footer.css';

const QUICK_LINKS = [
  { label: 'Upcoming Races', href: '/races' },
  { label: 'Live Results', href: '/results' },
  { label: 'Ranking', href: '/ranking' },
  { label: 'Statistics', href: '/statistics' },
];

const RESOURCES = [
  { label: 'Help Center', href: '/help' },
  { label: 'News & Updates', href: '/news' },
  { label: 'Rules & Regulations', href: '/rules' },
  { label: 'Contact US', href: '/contact' },
];

const CONNECT = [
  { label: 'Facebook', href: '#' },
  { label: 'Twitter', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'Youtube', href: '#' },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__main">
        <div className="footer__brand">
          <a href="/" className="footer__brand-logo">
            <span className="footer__brand-royal">Royal</span>
            <span className="footer__brand-derby">Derby</span>
          </a>
          <p className="footer__brand-desc">
            Premier horse racing management platform for enthusiasts and professionals.
          </p>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Quick Links</h4>
          <ul className="footer__col-list">
            {QUICK_LINKS.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Resources</h4>
          <ul className="footer__col-list">
            {RESOURCES.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__col-title">Connect</h4>
          <ul className="footer__col-list">
            {CONNECT.map((item) => (
              <li key={item.label}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <hr className="footer__divider" />

      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} Royal Derby. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
