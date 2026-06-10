import { Calendar, MapPin, Ruler, Trophy } from 'lucide-react';
import '../../assets/css/race/RaceMetaStrip.css';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatPrize(amount) {
  if (!amount) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount);
}

export default function RaceMetaStrip({ race }) {
  return (
    <div className="race-meta-strip">
      <div className="race-meta-strip__item">
        <Calendar size={20} className="race-meta-strip__icon" />
        <div>
          <div className="race-meta-strip__label">Start Time</div>
          <div className="race-meta-strip__value">{formatDate(race.startTime)}</div>
        </div>
      </div>
      <div className="race-meta-strip__item">
        <MapPin size={20} className="race-meta-strip__icon" />
        <div>
          <div className="race-meta-strip__label">Location</div>
          <div className="race-meta-strip__value">{race.location || '—'}</div>
        </div>
      </div>
      <div className="race-meta-strip__item">
        <Ruler size={20} className="race-meta-strip__icon" />
        <div>
          <div className="race-meta-strip__label">Distance</div>
          <div className="race-meta-strip__value">{race.distance || '—'}</div>
        </div>
      </div>
      <div className="race-meta-strip__item">
        <Trophy size={20} className="race-meta-strip__icon" />
        <div>
          <div className="race-meta-strip__label">Prize Pool</div>
          <div className="race-meta-strip__value">{formatPrize(race.totalprizepool)}</div>
        </div>
      </div>
    </div>
  );
}
