import '../../assets/css/register.css';
import RegisterForm from '../../components/form/RegisterForm';
import Seo from '../../components/seo/Seo';

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

const TrainerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2 4 7v5c0 5 4 9 8 9s8-4 8-9V7l-8-5z" />
    <path d="M9 9h6M9 13h6" />
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
    id: 'trainer',
    label: 'TRAINER',
    desc: 'Prepare horses, manage training schedules and optimize performance',
    Icon: TrainerIcon,
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
  trainer:     { apiRole: 'TRAINER',     roleLabel: 'Trainer' },
  jockey:      { apiRole: 'JOCKEY',      roleLabel: 'Jockey' },
};

/* ---- Main Export ---- */
export default function RegisterPage() {
  return (
    <div className="rg-page">
      <Seo title="Create Account" description="Register a new Royal Derby account as a jockey, trainer, horse owner or spectator." />
      <div className="rg-page__main">
        <RegisterForm roles={ROLES} roleConfig={ROLE_CONFIG} />
      </div>
    </div>
  );
}
