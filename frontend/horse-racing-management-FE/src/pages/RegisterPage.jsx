import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/register.css';
import bgImg from '../assets/img/ee63a717-b5ff-41b1-ad51-860da474eb55.jpg';
import RegisterForm from '../components/form/RegisterForm';

/* ---- Icons ---- */
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const StableIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const JockeyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="3" />
    <path d="M6 21v-1a6 6 0 0 1 12 0v1" />
    <path d="M8 10l-2 5M16 10l2 5" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="15" height="15">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

/* ---- Role data ---- */
const ROLES = [
  {
    id: 'spectator',
    label: 'SPECTATOR',
    desc: 'Watch races, follow standings and view live results',
    Icon: EyeIcon,
  },
  {
    id: 'horse_owner',
    label: 'HORSE OWNER',
    desc: 'Register horses, manage your stable and track performance',
    Icon: StableIcon,
  },
  {
    id: 'jockey',
    label: 'JOCKEY',
    desc: 'Compete in races and manage your professional career',
    Icon: JockeyIcon,
  },
];

const ROLE_CONFIG = {
  spectator:   { apiRole: 'USER',        roleLabel: 'Spectator' },
  horse_owner: { apiRole: 'HORSE_OWNER', roleLabel: 'Horse Owner' },
  jockey:      { apiRole: 'JOCKEY',      roleLabel: 'Jockey' },
};

/* ---- Left Panel ---- */
function LeftPanel() {
  return (
    <aside className="rg-left" style={{ backgroundImage: `url(${bgImg})` }}>
      <div className="rg-left__overlay" />
      <div className="rg-left__content">
        <Link to="/" className="rg-back-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="14" height="14">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <div className="rg-left__body">
          <h2 className="rg-left__headline">
            Your journey<br />starts <span>here.</span>
          </h2>
          <p className="rg-left__tagline">
            Join the world's most prestigious horse racing management platform.
            Register today and be part of the legacy.
          </p>
        </div>

        <p className="rg-left__footer">© 2026 Royal Derby Racing. All rights reserved.</p>
      </div>
    </aside>
  );
}

/* ---- Role Selection Step ---- */
function RoleStep({ onSelect }) {
  return (
    <main className="rg-right">
      <div className="rg-right__inner">
        <div className="rg-step-header">
          <p className="rg-step-header__label">Step 1 of 2</p>
          <h1 className="rg-step-header__title">GET STARTED</h1>
          <p className="rg-step-header__sub">YOU WANT TO REGISTER AS A:</p>
        </div>

        <div className="rg-roles">
          {ROLES.map(({ id, label, desc, Icon }) => (
            <button key={id} className="rg-role-card" onClick={() => onSelect(id)}>
              <span className="rg-role-card__icon"><Icon /></span>
              <span className="rg-role-card__body">
                <span className="rg-role-card__label">{label}</span>
                <span className="rg-role-card__desc">{desc}</span>
              </span>
              <span className="rg-role-card__arrow"><ChevronRightIcon /></span>
            </button>
          ))}
        </div>

        <p className="rg-login">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

/* ---- Main Export ---- */
export default function RegisterPage() {
  const [role, setRole] = useState(null);
  const config = role ? ROLE_CONFIG[role] : null;

  return (
    <div className="rg-page">
      <LeftPanel />
      {config
        ? <RegisterForm apiRole={config.apiRole} roleLabel={config.roleLabel} onBack={() => setRole(null)} />
        : <RoleStep onSelect={setRole} />
      }
    </div>
  );
}
