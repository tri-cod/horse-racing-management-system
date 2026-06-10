import { User, Award } from 'lucide-react';
import '../../assets/css/JockeyCard.css';

export default function JockeyCard({ jockey, onClick }) {
  return (
    <div
      className="jockey-card"
      onClick={() => onClick?.(jockey)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(jockey);
        }
      }}
    >
      <div className="jockey-card__avatar">
        <User size={36} />
      </div>

      <h3 className="jockey-card__name">{jockey.name}</h3>

      <p className="jockey-card__age">{jockey.age} yrs old</p>

      <p className="jockey-card__experience">
        <Award size={16} />
        <span>{jockey.experienceYear} years of experience</span>
      </p>

      <span className="jockey-card__badge">Active</span>
    </div>
  );
}
