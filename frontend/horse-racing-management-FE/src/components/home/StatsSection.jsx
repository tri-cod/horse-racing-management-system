import { Link } from 'react-router-dom';
import { Flag, Users, Trophy, Shield } from 'lucide-react';
import Container from '../ui/Container';
import '../../assets/css/home/StatsSection.css';

const STATS = [
  { value: '24',   label: 'Races Per Season' },
  { value: '$12M', label: 'Total Prize Pool' },
  { value: '180+', label: 'Registered Jockeys' },
  { value: '320+', label: 'Competing Horses' },
];

const QUICK_LINKS = [
  { icon: Flag,   label: 'Race Schedule', sub: 'All upcoming races', href: '/races' },
  { icon: Trophy, label: 'Results',       sub: 'Past race standings', href: '/results' },
  { icon: Users,  label: 'Our Jockeys',   sub: 'Meet the riders',    href: '/jockeys' },
  { icon: Shield, label: 'Register',      sub: 'Join the circuit',   href: '/register' },
];

export default function StatsSection() {
  return (
    <>
      {/* Stats strip */}
      <div className="home-stats">
        <Container>
          <div className="home-stats__grid">
            {STATS.map((stat) => (
              <div key={stat.label} className="home-stats__item">
                <p className="home-stats__value tnum">{stat.value}</p>
                <p className="home-stats__label">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Quick-links strip */}
      <nav className="home-quicklinks" aria-label="Quick links">
        <Container>
          <ul className="home-quicklinks__list">
            {QUICK_LINKS.map((item, i) => (
              <li key={item.href} className="home-quicklinks__item">
                {i > 0 && <span className="home-quicklinks__sep" aria-hidden="true" />}
                <Link to={item.href} className="home-quicklinks__link">
                  <span className="home-quicklinks__icon-ring">
                    <item.icon size={20} strokeWidth={1.6} />
                  </span>
                  <span className="home-quicklinks__text">
                    <span className="home-quicklinks__name">{item.label}</span>
                    <span className="home-quicklinks__sub">{item.sub}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </>
  );
}
