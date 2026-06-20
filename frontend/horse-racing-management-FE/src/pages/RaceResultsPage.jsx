import { useState, useEffect } from 'react';
import { Trophy, Calendar, MapPin, ChevronDown, ChevronUp, DollarSign } from 'lucide-react';
import { getRaces } from '../api/raceApi';
import RaceResultSection from '../components/race/RaceResultSection';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';
import '../assets/css/RaceResultsPage.css';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtPrize = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : null;

function RaceResultCard({ race }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`rr-card${open ? ' rr-card--open' : ''}`}>
      <button className="rr-card__header" onClick={() => setOpen((v) => !v)}>
        {race.bannerImageurl && (
          <img src={race.bannerImageurl} alt={race.raceName} className="rr-card__banner" />
        )}
        <div className="rr-card__info">
          <h3 className="rr-card__title">{race.raceName}</h3>
          <div className="rr-card__meta">
            <span className="rr-card__meta-item"><Calendar size={13} />{fmtDate(race.startTime)}</span>
            <span className="rr-card__meta-item"><MapPin size={13} />{race.location}</span>
            {fmtPrize(race.totalprizepool) && (
              <span className="rr-card__meta-item"><DollarSign size={13} />{fmtPrize(race.totalprizepool)}</span>
            )}
          </div>
        </div>
        <div className="rr-card__toggle">
          {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {open && (
        <div className="rr-card__results">
          <RaceResultSection raceId={race.id} />
        </div>
      )}
    </div>
  );
}

export default function RaceResultsPage() {
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getRaces({ status: 'FINISHED', size: 50 })
      .then((data) => {
        const items = data?.content ?? data ?? [];
        setRaces(items.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
      })
      .catch(() => setError('Unable to load race results.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rr-page">
      <section className="rr-page__hero">
        <div className="rr-page__hero-inner">
          <span className="eyebrow rr-page__eyebrow">Royal Derby</span>
          <h1 className="rr-page__title">Race Results</h1>
          <p className="rr-page__subtitle">View final standings and prize distribution for completed races</p>
        </div>
      </section>

      <div className="rr-page__content">
        {error && <p className="rr-page__error">{error}</p>}

        {loading ? (
          <LoadingSpinner size="lg" />
        ) : races.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No completed races yet"
            subtitle="Results will appear here once races have finished."
          />
        ) : (
          <div className="rr-list">
            {races.map((race) => (
              <RaceResultCard key={race.id} race={race} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
