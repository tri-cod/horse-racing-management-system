import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Trophy, Clock, ArrowRight, Flag } from 'lucide-react';
import Button from '../ui/Button';
import Container from '../ui/Container';
import { useUpcomingRaces } from '../../hooks/useUpcomingRaces';
import '../../assets/css/home/HeroSection.css';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function calcCountdown(iso) {
  if (!iso) return null;
  const diff = new Date(iso) - new Date();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86_400_000),
    h: Math.floor((diff % 86_400_000) / 3_600_000),
    m: Math.floor((diff % 3_600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1_000),
  };
}

/* Real-time countdown hook — updates every second */
function useCountdown(iso) {
  const [cd, setCd] = useState(() => calcCountdown(iso));

  useEffect(() => {
    setCd(calcCountdown(iso));
    const timer = setInterval(() => setCd(calcCountdown(iso)), 1000);
    return () => clearInterval(timer);
  }, [iso]);

  return cd;
}

function RacecardBoard({ race }) {
  const cd = useCountdown(race?.startTime);

  if (!race) return (
    <div className="hero-racecard hero-racecard--empty">
      <Flag size={32} strokeWidth={1.5} />
      <p>No upcoming races scheduled yet.</p>
      <Link to="/races" className="hero-racecard__link">View all races <ArrowRight size={14} /></Link>
    </div>
  );

  return (
    <div className="hero-racecard">
      <div className="hero-racecard__header">
        <span className="hero-racecard__label">Next Race</span>
        <span className="hero-racecard__status">Upcoming</span>
      </div>

      <h3 className="hero-racecard__name">{race.raceName}</h3>

      {cd && (
        <div className="hero-racecard__countdown">
          <div className="hero-racecard__count-cell">
            <span className="hero-racecard__count-num tnum">{String(cd.d).padStart(2, '0')}</span>
            <span className="hero-racecard__count-unit">Days</span>
          </div>
          <span className="hero-racecard__count-sep">:</span>
          <div className="hero-racecard__count-cell">
            <span className="hero-racecard__count-num tnum">{String(cd.h).padStart(2, '0')}</span>
            <span className="hero-racecard__count-unit">Hrs</span>
          </div>
          <span className="hero-racecard__count-sep">:</span>
          <div className="hero-racecard__count-cell">
            <span className="hero-racecard__count-num tnum">{String(cd.m).padStart(2, '0')}</span>
            <span className="hero-racecard__count-unit">Min</span>
          </div>
          <span className="hero-racecard__count-sep">:</span>
          <div className="hero-racecard__count-cell">
            <span className="hero-racecard__count-num tnum">{String(cd.s ?? 0).padStart(2, '0')}</span>
            <span className="hero-racecard__count-unit">Sec</span>
          </div>
        </div>
      )}

      <div className="hero-racecard__divider" />

      <div className="hero-racecard__meta">
        {race.location && (
          <div className="hero-racecard__meta-item">
            <MapPin size={13} />
            <span>{race.location}</span>
          </div>
        )}
        {race.startTime && (
          <div className="hero-racecard__meta-item">
            <Calendar size={13} />
            <span>{fmtDate(race.startTime)}</span>
          </div>
        )}
        {race.startTime && (
          <div className="hero-racecard__meta-item">
            <Clock size={13} />
            <span>{fmtTime(race.startTime)}</span>
          </div>
        )}
        {race.totalprizepool != null && (
          <div className="hero-racecard__meta-item">
            <Trophy size={13} />
            <span>Prize: ${Number(race.totalprizepool).toLocaleString()}</span>
          </div>
        )}
      </div>

      <Link to={`/races/${race.id}`} className="hero-racecard__cta">
        View Race Details <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default function HeroSection() {
  const { races } = useUpcomingRaces(1);
  const nextRace = races[0] ?? null;

  return (
    <section className="home-hero">
      {/* Background video */}
      <video
        className="home-hero__bg-video"
        src="https://res.cloudinary.com/dxg3w2joa/video/upload/v1782285815/hero_hisssl.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />

      <Container>
        <div className="home-hero__grid">
          {/* Left — editorial copy */}
          <div className="home-hero__content">
            <div className="home-hero__eyebrow-row">
              <span className="home-hero__eyebrow-rule" />
              <p className="eyebrow home-hero__eyebrow">Royal Derby 2026</p>
            </div>

            <h1 className="home-hero__title">
              Glory On<br />
              <em className="home-hero__title-em">The Racetrack</em>
            </h1>

            <p className="home-hero__subtitle">
              Where the proudest steeds and the most talented jockeys come together
              to compete in Royal Derby — a world-class horse racing tournament.
            </p>

            <div className="home-hero__actions">
              <Button as={Link} to="/races" variant="dark" size="lg">
                View Schedule
              </Button>
              <Button as={Link} to="/register" variant="ghost" size="lg" className="home-hero__ghost-btn">
                Join Now <ArrowRight size={16} />
              </Button>
            </div>
          </div>

          {/* Right — racecard board */}
          <div className="home-hero__racecard-wrap">
            <RacecardBoard race={nextRace} />
          </div>
        </div>
      </Container>
    </section>
  );
}
