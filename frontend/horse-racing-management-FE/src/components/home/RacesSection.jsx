import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, ArrowRight, Users } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import Silk from '../shared/Silk';
import { useUpcomingRaces } from '../../hooks/queries/useUpcomingRaces';

import '../../assets/css/home/RacesSection.css';

const STATUS_VARIANT = {
  UPCOMING: 'info', OPEN_REGISTRATION: 'ok', CLOSED_REGISTRATION: 'warn', ONGOING: 'danger',
};

function formatRaceDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(iso) {
  if (!iso) return null;
  const d = Math.ceil((new Date(iso) - new Date()) / 86_400_000);
  return d > 0 ? d : null;
}

function StatusLabel({ status }) {
  const map = {
    UPCOMING: 'Upcoming', OPEN_REGISTRATION: 'Open', CLOSED_REGISTRATION: 'Entries Closed',
    ONGOING: 'Live', FINISHED: 'Finished', CANCELLED: 'Cancelled',
  };
  return <span className="race-card-rd__chip">{map[status] || status}</span>;
}

function SkeletonCard() {
  return (
    <div className="race-card-rd race-card-rd--skeleton" aria-hidden="true">
      <div className="race-card-rd__top race-card-rd__skel-top" />
      <div className="race-card-rd__body">
        <div className="race-card-rd__skel-line" style={{ width: '40%', height: 12 }} />
        <div className="race-card-rd__skel-line" style={{ width: '75%', height: 20 }} />
        <div className="race-card-rd__skel-line" style={{ width: '55%', height: 12 }} />
      </div>
    </div>
  );
}

export default function RacesSection() {
  const { races, loading } = useUpcomingRaces(3);

  return (
    <section className="home-races">
      <Container>
        <SectionHeader
          eyebrow="Schedule"
          title="Upcoming Races"
          subtitle="Don't miss the next thrilling showdowns of the Royal Derby 2026 season."
          align="center"
        />

        <div className="home-races__grid">
          {loading ? (
            [0, 1, 2].map((i) => <SkeletonCard key={i} />)
          ) : races.length === 0 ? (
            <div className="home-races__empty">
              <p>No upcoming races scheduled yet.</p>
              <Link to="/races">View all races →</Link>
            </div>
          ) : (
            races.map((race, idx) => {
              const img = race.bannerImageurl || null;
              const days = daysUntil(race.startTime);
              const silkVariant = (idx % 6) + 1;
              return (
                <article key={race.id} className="race-card-rd">
                  {/* Navy top band */}
                  <div className="race-card-rd__top">
                    <div className="race-card-rd__top-silk">
                      <Silk variant={silkVariant} size={22} />
                    </div>
                    <span className="race-card-rd__round">Race {String(idx + 1).padStart(2, '0')}</span>
                    <StatusLabel status={race.status} />
                  </div>

                  {/* Image */}
                  <div className="race-card-rd__img-wrap">
                    <img src={img} alt={race.raceName} className="race-card-rd__img" loading="lazy" />
                    <div className="race-card-rd__img-overlay" />
                    {days != null && (
                      <span className="race-card-rd__countdown tnum">{days}d away</span>
                    )}
                  </div>

                  {/* Body */}
                  <div className="race-card-rd__body">
                    <h3 className="race-card-rd__name">{race.raceName}</h3>

                    <ul className="race-card-rd__meta">
                      <li>
                        <Calendar size={13} />
                        <span className="tnum">{formatRaceDate(race.startTime)}</span>
                      </li>
                      {race.location && (
                        <li><MapPin size={13} /><span>{race.location}</span></li>
                      )}
                      {race.totalprizepool != null && (
                        <li>
                          <Trophy size={13} />
                          <span className="tnum">${Number(race.totalprizepool).toLocaleString()}</span>
                        </li>
                      )}
                    </ul>

                    <Link to={`/races/${race.id}`} className="race-card-rd__cta">
                      Race Details <ArrowRight size={13} />
                    </Link>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {!loading && races.length > 0 && (
          <div className="home-races__footer">
            <Link to="/races" className="home-races__view-all">
              View Full Schedule <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
