import { Link } from 'react-router-dom';
import { Calendar, MapPin } from 'lucide-react';
import RaceStatusBadge from './RaceStatusBadge';
import '../../assets/css/race/RaceCard.css';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPrize(amount) {
  if (!amount) return '';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

export default function RaceCard({ race }) {
  return (
    <Link to={`/races/${race.id}`} className="race-card">
      <div className="race-card__banner">
        {race.bannerImageurl ? (
          <img src={race.bannerImageurl} alt={race.raceName} className="race-card__banner-img" />
        ) : (
          <div className="race-card__banner-placeholder" />
        )}
        <div className="race-card__status">
          <RaceStatusBadge race={race} />
        </div>
      </div>
      <div className="race-card__body">
        <h3 className="race-card__title">{race.raceName}</h3>
        <div className="race-card__meta">
          <span className="race-card__meta-item">
            <Calendar size={14} />
            {formatDate(race.startTime)}
          </span>
          <span className="race-card__meta-item">
            <MapPin size={14} />
            {race.location}
          </span>
        </div>
        {race.totalprizepool && (
          <div className="race-card__prize">{formatPrize(race.totalprizepool)}</div>
        )}
      </div>
    </Link>
  );
}
