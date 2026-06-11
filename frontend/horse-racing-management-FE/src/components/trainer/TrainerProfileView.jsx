import Badge from '../ui/Badge';
import '../../assets/css/trainer/TrainerProfileView.css';

const STATUS_VARIANT = { APPROVED: 'ocean', PENDING: 'neutral', REJECTED: 'dark' };

export default function TrainerProfileView({ profile }) {
  return (
    <div className="trainer-view">
      <div className="trainer-view__row">
        <span className="trainer-view__label">Status</span>
        <Badge variant={STATUS_VARIANT[profile.status] ?? 'neutral'} size="lg">{profile.status}</Badge>
      </div>
      <div className="trainer-view__row">
        <span className="trainer-view__label">Age</span>
        <span className="trainer-view__value">{profile.age ?? '—'}</span>
      </div>
      <div className="trainer-view__row">
        <span className="trainer-view__label">Experience</span>
        <span className="trainer-view__value">
          {profile.experienceYears != null ? `${profile.experienceYears} year(s)` : '—'}
        </span>
      </div>
      {profile.description && (
        <div className="trainer-view__description">
          <span className="trainer-view__label">About</span>
          <p>{profile.description}</p>
        </div>
      )}
    </div>
  );
}