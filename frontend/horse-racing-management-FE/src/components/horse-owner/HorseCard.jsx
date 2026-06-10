import { Dna, Cake, VenetianMask, User } from 'lucide-react';
import HorseStatusBadge from './HorseStatusBadge';
import '../../assets/css/HorseCard.css';

export default function HorseCard({ horse, onClick }) {
  return (
    <div className="horse-card" onClick={onClick} role="button" tabIndex={0}>
      <div className="horse-card__avatar">
        {horse.avatarUrl ? (
          <img src={horse.avatarUrl} alt={horse.horseName} className="horse-card__image" />
        ) : (
          <div className="horse-card__fallback">{horse.horseName?.charAt(0)?.toUpperCase() || 'H'}</div>
        )}
      </div>

      <div className="horse-card__body">
        <div className="horse-card__header">
          <h3 className="horse-card__name">{horse.horseName}</h3>
          <HorseStatusBadge status={horse.status} />
        </div>

        <div className="horse-card__meta">
          <span className="horse-card__meta-item">
            <Dna size={14} />
            {horse.breed || '—'}
          </span>
          <span className="horse-card__meta-item">
            <Cake size={14} />
            {horse.age != null ? `${horse.age} yrs` : '—'}
          </span>
          <span className="horse-card__meta-item">
            <VenetianMask size={14} />
            {horse.gender || '—'}
          </span>
        </div>

        <div className="horse-card__trainer">
          <User size={14} />
          <span>{horse.trainerName || 'No trainer assigned'}</span>
        </div>
      </div>
    </div>
  );
}
