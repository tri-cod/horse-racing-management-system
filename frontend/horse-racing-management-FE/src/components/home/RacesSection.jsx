import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, ArrowRight } from 'lucide-react';
import Container from '../ui/Container';
import SectionHeader from '../ui/SectionHeader';
import { useUpcomingRaces } from '../../hooks/useUpcomingRaces';

import fallback1 from '../../assets/img/ee63a717-b5ff-41b1-ad51-860da474eb55.jpg';
import fallback2 from '../../assets/img/174b40b7b0643c6cdafe82f318879afd.webp';
import fallback3 from '../../assets/img/venue-santaanita.webp';
import '../../assets/css/home/RacesSection.css';

const FALLBACKS = [fallback1, fallback2, fallback3];

function formatRaceDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

function daysUntil(iso) {
  if (!iso) return null;
  const days = Math.ceil((new Date(iso) - new Date()) / 86_400_000);
  return days > 0 ? days : null;
}

function SkeletonCard() {
  return (
    <div className="home-races__card home-races__card--skeleton" aria-hidden="true">
      <div className="home-races__image-wrap home-races__skel-img" />
      <div className="home-races__body">
        <div className="home-races__skel-line home-races__skel-line--title" />
        <div className="home-races__skel-line" />
        <div className="home-races__skel-line home-races__skel-line--short" />
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
              const img = race.bannerImageurl || FALLBACKS[idx % FALLBACKS.length];
              const days = daysUntil(race.startTime);
              return (
                <article key={race.id} className="home-races__card">
                  <div className="home-races__image-wrap">
                    <img src={img} alt={race.raceName} className="home-races__image" />
                    <div className="home-races__overlay" />
                    <span className="home-races__badge">Upcoming</span>
                    {days != null && (
                      <span className="home-races__countdown">{days}d away</span>
                    )}
                  </div>

                  <div className="home-races__body">
                    <h3 className="home-races__name">{race.raceName}</h3>

                    <ul className="home-races__meta">
                      <li>
                        <Calendar size={14} />
                        {formatRaceDate(race.startTime)}
                      </li>
                      {race.location && (
                        <li>
                          <MapPin size={14} />
                          {race.location}
                        </li>
                      )}
                      {race.totalprizepool != null && (
                        <li>
                          <Trophy size={14} />
                          Prize pool: ${Number(race.totalprizepool).toLocaleString()}
                        </li>
                      )}
                    </ul>

                    <Link to={`/races/${race.id}`} className="home-races__cta">
                      View Details <ArrowRight size={14} />
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
              See all races <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
