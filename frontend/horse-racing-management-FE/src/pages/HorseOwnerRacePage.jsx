import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, MapPin, Trophy, Users, Ruler, CheckCircle2,
  XCircle, Clock, ArrowLeft, ChevronRight,
} from 'lucide-react';
import { getRaces } from '../api/raceApi';
import { getAvailableHorses } from '../api/horseOwnerApi';
import { getAvailableJockeys } from '../api/jockeyApi';
import { registerHorseToRace, getMyRaceRegistrations } from '../api/raceHorseApi';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Seo from '../components/seo/Seo';
import '../assets/css/HorseOwnerRacePage.css';

const fmt = (n) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function HorseOwnerRacePage() {
  const [view, setView]               = useState('list');   // 'list' | 'register' | 'pending' | 'approved' | 'rejected'
  const [races, setRaces]             = useState([]);
  const [selectedRace, setSelectedRace] = useState(null);
  const [horses, setHorses]           = useState([]);
  const [jockeys, setJockeys]         = useState([]);
  const [selectedHorse, setSelectedHorse] = useState(null);
  const [selectedJockey, setSelectedJockey] = useState(null);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState('');
  const [registrationId, setRegistrationId] = useState(null);

  // Load open races
  useEffect(() => {
    getRaces({ status: 'OPEN_REGISTRATION', size: 50 })
      .then((data) => setRaces(data?.content ?? data ?? []))
      .catch(() => setError('Unable to load races.'))
      .finally(() => setLoadingRaces(false));
  }, []);

// Load horses + jockeys when entering register view (re-runs if the race changes)
useEffect(() => {
  if (view !== 'register' || !selectedRace) return;
  setLoadingForm(true);
  Promise.all([getAvailableHorses(), getAvailableJockeys(selectedRace.id)])
    .then(([h, j]) => { setHorses(h ?? []); setJockeys(j ?? []); })
    .catch(() => setError('Failed to load horses or jockeys.'))
    .finally(() => setLoadingForm(false));
}, [view, selectedRace]);

  // Poll status when pending
  const pollStatus = useCallback(async () => {
    if (!registrationId) return;
    try {
      const list = await getMyRaceRegistrations();
      const reg = list.find((r) => r.id === registrationId);
      if (!reg) return;
      const s = reg.status?.toLowerCase();
      if (s === 'approved') setView('approved');
      else if (s === 'rejected') setView('rejected');
    } catch {}
  }, [registrationId]);

  useEffect(() => {
    if (view !== 'pending') return;
    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [view, pollStatus]);

  const handleSelectRace = (race) => {
    setSelectedRace(race);
    setSelectedHorse(null);
    setSelectedJockey(null);
    setError('');
    setView('register');
  };

  const handleSubmit = async () => {
    if (!selectedHorse || !selectedJockey) {
      setError('Please select both a horse and a jockey.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const result = await registerHorseToRace({
        raceId: selectedRace.id,
        horseId: selectedHorse,
        jockeyId: selectedJockey,
      });
      setRegistrationId(result?.id ?? null);
      setView('pending');
    } catch (e) {
      setError(e?.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setView('list');
    setSelectedRace(null);
    setSelectedHorse(null);
    setSelectedJockey(null);
    setRegistrationId(null);
    setError('');
  };

  /* ── VIEWS ── */

  if (view === 'approved') return (
    <div className="ho-race-page">
      <div className="ho-race-status ho-race-status--success">
        <CheckCircle2 size={56} />
        <h2>Registration Approved!</h2>
        <p>Your horse has been approved for <strong>{selectedRace?.raceName}</strong>.</p>
        <button className="ho-btn ho-btn--primary" onClick={reset}>Back to Races</button>
      </div>
    </div>
  );

  if (view === 'rejected') return (
    <div className="ho-race-page">
      <div className="ho-race-status ho-race-status--error">
        <XCircle size={56} />
        <h2>Registration Rejected</h2>
        <p>Your registration for <strong>{selectedRace?.raceName}</strong> was rejected.</p>
        <button className="ho-btn ho-btn--outline" onClick={reset}>Back to Races</button>
      </div>
    </div>
  );

  if (view === 'pending') return (
    <div className="ho-race-page">
      <div className="ho-race-status ho-race-status--pending">
        <Clock size={56} className="ho-race-status__spin" />
        <h2>Awaiting Approval</h2>
        <p>Your registration for <strong>{selectedRace?.raceName}</strong> is pending admin review.</p>
        <p className="ho-race-status__hint">This page updates automatically when the admin reviews your request.</p>
        <button className="ho-btn ho-btn--outline" onClick={reset}>Back to Races</button>
      </div>
    </div>
  );

  if (view === 'register') return (
    <div className="ho-race-page">
      <div className="ho-race-page__content">
        <button className="ho-back-btn" onClick={() => setView('list')}>
          <ArrowLeft size={16} /> Back to races
        </button>

        <div className="ho-reg-header">
          <h2 className="ho-reg-header__title">Register for {selectedRace?.raceName}</h2>
          <p className="ho-reg-header__sub">{fmtDate(selectedRace?.startTime)} · {selectedRace?.location}</p>
        </div>

        {loadingForm ? <LoadingSpinner /> : (
          <div className="ho-reg-form">
            {/* Horse selection */}
            <div className="ho-reg-section">
              <h3 className="ho-reg-section__title">Select Your Horse</h3>
              {horses.length === 0 ? (
                <p className="ho-reg-empty">You have no registered horses.</p>
              ) : (
                <div className="ho-reg-horse-grid">
                  {horses.map((h) => {
                    const hasTrainer = !!h.trainerId;
                    const isSel = selectedHorse === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        disabled={!hasTrainer}
                        className={['ho-horse-card', isSel && 'ho-horse-card--selected', !hasTrainer && 'ho-horse-card--disabled'].filter(Boolean).join(' ')}
                        onClick={() => hasTrainer && setSelectedHorse(h.id)}
                        title={!hasTrainer ? 'No trainer assigned' : undefined}
                      >
                        {h.avatarUrl
                          ? <img src={h.avatarUrl} alt={h.horseName} className="ho-horse-card__img" />
                          : <div className="ho-horse-card__fallback">{h.horseName?.[0]}</div>
                        }
                        <span className="ho-horse-card__name">{h.horseName}</span>
                        {!hasTrainer && <span className="ho-horse-card__no-trainer">No trainer</span>}
                        {isSel && <CheckCircle2 size={16} className="ho-horse-card__check" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Jockey selection */}
            <div className="ho-reg-section">
              <h3 className="ho-reg-section__title">Select Jockey</h3>
              {jockeys.length === 0 ? (
                <p className="ho-reg-empty">No jockeys available.</p>
              ) : (
                <div className="ho-jockey-list">
                  {jockeys.map((j) => (
                    <label key={j.id} className={`ho-jockey-item${selectedJockey === j.id ? ' ho-jockey-item--selected' : ''}`}>
                      <input type="radio" name="jockey" value={j.id} checked={selectedJockey === j.id}
                        onChange={() => setSelectedJockey(j.id)} />
                      <div className="ho-jockey-item__info">
                        <span className="ho-jockey-item__name">{j.name}</span>
                        <span className="ho-jockey-item__meta">{j.experienceYear} yr exp · Age {j.age}</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="ho-reg-error">{error}</p>}

            <div className="ho-reg-actions">
              <button className="ho-btn ho-btn--outline" onClick={() => setView('list')} disabled={submitting}>Cancel</button>
              <button className="ho-btn ho-btn--primary" onClick={handleSubmit}
                disabled={submitting || !selectedHorse || !selectedJockey}>
                {submitting ? 'Registering…' : 'Register'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  /* ── LIST VIEW ── */
  return (
    <div className="ho-race-page">
      <Seo title="Register for Race" description="Browse open races and register your horse to compete on Royal Derby." />
      <div className="ho-race-page__header">
        <h1 className="ho-race-page__title">Open Races</h1>
        <p className="ho-race-page__subtitle">Select a race to register your horse</p>
      </div>

      <div className="ho-race-page__content">
        {error && <p className="ho-reg-error">{error}</p>}

        {loadingRaces ? <LoadingSpinner /> : races.length === 0 ? (
          <div className="ho-race-empty">
            <Trophy size={40} />
            <p>No races are currently open for registration.</p>
          </div>
        ) : (
          <div className="ho-race-list">
            {races.map((race) => (
              <div key={race.id} className="ho-race-card" onClick={() => handleSelectRace(race)}>
                {race.bannerImageurl && (
                  <img src={race.bannerImageurl} alt={race.raceName} className="ho-race-card__banner" />
                )}
                <div className="ho-race-card__body">
                  <div className="ho-race-card__top">
                    <h3 className="ho-race-card__title">{race.raceName}</h3>
                    <ChevronRight size={20} className="ho-race-card__arrow" />
                  </div>
                  <div className="ho-race-card__info">
                    <span className="ho-race-card__info-item"><Calendar size={14} />{fmtDate(race.startTime)}</span>
                    <span className="ho-race-card__info-item"><MapPin size={14} />{race.location}</span>
                    <span className="ho-race-card__info-item"><Trophy size={14} />{fmt(race.totalprizepool)}</span>
                    <span className="ho-race-card__info-item"><Users size={14} />{race.capacity} horses max</span>
                    <span className="ho-race-card__info-item"><Ruler size={14} />{race.distance}</span>
                    {race.trackName && <span className="ho-race-card__info-item">Track: {race.trackName}</span>}
                    {race.surfaceType && <span className="ho-race-card__info-item">Surface: {race.surfaceType}</span>}
                    {race.trackCondition && <span className="ho-race-card__info-item">Condition: {race.trackCondition}</span>}
                    {race.registrationDeadline && (
                      <span className="ho-race-card__info-item ho-race-card__info-item--deadline">
                        <Clock size={14} />Deadline: {fmtDate(race.registrationDeadline)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
