import { useState, useEffect, useCallback } from 'react';
import {
  Calendar, MapPin, Trophy, Users, Ruler,
  CheckCircle2, XCircle, Clock, ArrowLeft, ChevronRight,
} from 'lucide-react';
import { getRaces } from '@/api/raceApi';
import { getAvailableHorses } from '@/api/horseOwnerApi';
import { getAvailableJockeys } from '@/api/jockeyApi';
import { registerHorseToRace, getMyRaceRegistrations } from '@/api/raceHorseApi';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { Race, Horse, Jockey } from '@/types';

const fmt = (n?: number) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

type View = 'list' | 'register' | 'pending' | 'approved' | 'rejected';

/* ── Skeletons ──────────────────────────────────────────────────────────────── */
function RaceGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="overflow-hidden border border-rim bg-surface-raised">
          <div className="h-40 animate-pulse bg-surface-overlay" />
          <div className="space-y-2 px-4 py-4">
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-surface-overlay" />
            <div className="mt-3 flex gap-3 border-t border-rim pt-3">
              <div className="h-3 w-16 animate-pulse rounded-full bg-surface-overlay" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-surface-overlay" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectionSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {[0, 1].map((col) => (
        <div key={col} className="overflow-hidden border border-rim bg-surface-raised">
          <div className="h-[60px] animate-pulse border-b border-rim bg-surface-overlay" />
          <div className="space-y-2 p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 border border-rim px-4 py-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-surface-overlay" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3.5 w-32 animate-pulse rounded-full bg-surface-overlay" />
                  <div className="h-3 w-24 animate-pulse rounded-full bg-surface-overlay" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Race summary chip (used in status screens) ─────────────────────────────── */
function RaceSummaryChip({ race }: { race: Race }) {
  return (
    <div className="mx-auto mb-8 flex max-w-sm items-center gap-4 overflow-hidden border border-rim bg-surface-raised">
      {race.bannerImageurl && (
        <img src={race.bannerImageurl} alt="" className="h-14 w-20 shrink-0 object-cover" />
      )}
      <div className="min-w-0 py-3 pr-4">
        <p className="truncate font-serif text-sm font-bold text-ink">{race.raceName}</p>
        <p className="mt-0.5 text-xs text-ink-3">{fmtDate(race.startTime)}</p>
        {race.location && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-4">
            <MapPin size={10} />{race.location}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────────── */
export default function HorseOwnerRacePage() {
  const [view, setView] = useState<View>('list');
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [horses, setHorses] = useState<Horse[]>([]);
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [selectedHorse, setSelectedHorse] = useState<number | null>(null);
  const [selectedJockey, setSelectedJockey] = useState<number | null>(null);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registrationId, setRegistrationId] = useState<number | null>(null);

  useEffect(() => {
    getRaces({ status: 'OPEN_REGISTRATION', size: 50 })
      .then((data) => setRaces(data?.content ?? []))
      .catch(() => setError('Unable to load races.'))
      .finally(() => setLoadingRaces(false));
  }, []);

  useEffect(() => {
    if (view !== 'register' || !selectedRace) return;
    let cancelled = false;
    setLoadingForm(true);
    Promise.all([getAvailableHorses(selectedRace.id), getAvailableJockeys(selectedRace.id)])
      .then(([h, j]) => {
        if (cancelled) return;
        setHorses(h ?? []);
        setJockeys(j ?? []);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load horses or jockeys.');
      })
      .finally(() => {
        if (!cancelled) setLoadingForm(false);
      });
    return () => {
      cancelled = true;
    };
  }, [view, selectedRace]);

  const pollStatus = useCallback(async () => {
    if (!registrationId) return;
    try {
      const list = await getMyRaceRegistrations();
      const reg = list.find((r) => r.id === registrationId);
      if (!reg) return;
      const s = reg.status?.toLowerCase();
      if (s === 'approved') setView('approved');
      else if (s === 'rejected') setView('rejected');
    } catch { /* silent */ }
  }, [registrationId]);

  useEffect(() => {
    if (view !== 'pending') return;
    const id = setInterval(pollStatus, 3000);
    return () => clearInterval(id);
  }, [view, pollStatus]);

  const handleSelectRace = (race: Race) => {
    setSelectedRace(race); setSelectedHorse(null);
    setSelectedJockey(null); setError(''); setView('register');
  };

  const handleSubmit = async () => {
    if (!selectedHorse || !selectedJockey) { setError('Please select both a horse and a jockey.'); return; }
    setSubmitting(true); setError('');
    try {
      const result = await registerHorseToRace({ raceId: selectedRace!.id, horseId: selectedHorse, jockeyId: selectedJockey });
      setRegistrationId((result as unknown as { id?: number }).id ?? null);
      setView('pending');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? 'Registration failed.');
    } finally { setSubmitting(false); }
  };

  const reset = () => {
    setView('list'); setSelectedRace(null);
    setSelectedHorse(null); setSelectedJockey(null);
    setRegistrationId(null); setError('');
  };

  /* ── Approved ── */
  if (view === 'approved') return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-16 text-center">
      <Seo title="Registration Approved" />
      {selectedRace && <RaceSummaryChip race={selectedRace} />}
      <div className="mb-4 text-ok"><CheckCircle2 size={52} strokeWidth={1.5} /></div>
      <h2 className="font-serif text-2xl font-bold text-ink">Registration Approved</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-3">
        Your horse has been approved for &ldquo;{selectedRace?.raceName}&rdquo;.
        Prepare for race day!
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep"
      >
        Back to Races
      </button>
    </div>
  );

  /* ── Rejected ── */
  if (view === 'rejected') return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-16 text-center">
      <Seo title="Registration Rejected" />
      {selectedRace && <RaceSummaryChip race={selectedRace} />}
      <div className="mb-4 text-fail"><XCircle size={52} strokeWidth={1.5} /></div>
      <h2 className="font-serif text-2xl font-bold text-ink">Registration Rejected</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-3">
        Your registration for &ldquo;{selectedRace?.raceName}&rdquo; was not approved.
        Please try another race or contact support.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep"
      >
        Back to Races
      </button>
    </div>
  );

  /* ── Pending ── */
  if (view === 'pending') return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-16 text-center">
      <Seo title="Awaiting Approval" />
      {selectedRace && <RaceSummaryChip race={selectedRace} />}
      <div className="mb-4 animate-pulse text-gold"><Clock size={52} strokeWidth={1.5} /></div>
      <h2 className="font-serif text-2xl font-bold text-ink">Awaiting Approval</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-3">
        Your registration for &ldquo;{selectedRace?.raceName}&rdquo; is pending admin review.
        This page updates automatically.
      </p>
      <div className="mt-4 flex items-center gap-1.5 text-xs text-ink-4">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />
        Checking for updates…
      </div>
      <button
        type="button"
        onClick={reset}
        className="mt-8 border border-rim px-6 py-2.5 text-xs font-semibold text-ink-2 transition-colors hover:border-rim-hi hover:text-ink"
      >
        Back to Races
      </button>
    </div>
  );

  /* ── Register view ── */
  if (view === 'register') return (
    <div className="px-8 py-6">
      <Seo title="Register for Race" />

      <button
        type="button"
        onClick={() => setView('list')}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back to races
      </button>

      {/* Race header */}
      <div className="mb-6 overflow-hidden border border-rim bg-surface-raised">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gold" />
        <div className="flex items-center gap-5">
          {selectedRace?.bannerImageurl && (
            <img
              src={selectedRace.bannerImageurl}
              alt={selectedRace.raceName}
              className="h-24 w-32 shrink-0 object-cover"
            />
          )}
          <div className="py-4 pr-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Registration</p>
            <h2 className="mt-0.5 font-serif text-xl font-bold text-ink">{selectedRace?.raceName}</h2>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              <span className="flex items-center gap-1 text-xs text-ink-3">
                <Calendar size={11} />{fmtDate(selectedRace?.startTime)}
              </span>
              {selectedRace?.location && (
                <span className="flex items-center gap-1 text-xs text-ink-3">
                  <MapPin size={11} />{selectedRace.location}
                </span>
              )}
              {selectedRace?.totalprizepool != null && (
                <span className="flex items-center gap-1 text-xs font-semibold text-gold">
                  <Trophy size={11} />{fmt(selectedRace.totalprizepool)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {loadingForm ? <SelectionSkeleton /> : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

          {/* Horse selection */}
          <div className="overflow-hidden border border-rim bg-surface-raised">
            <div className="border-b border-rim px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Step 1</p>
              <h3 className="mt-0.5 font-serif text-base font-bold text-ink">Select Your Horse</h3>
            </div>
            <div className="p-4">
              {horses.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-3">You have no registered horses.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {horses.map((h) => {
                    const hasTrainer = !!h.trainerId;
                    const isSel = selectedHorse === h.id;
                    return (
                      <button
                        key={h.id}
                        type="button"
                        disabled={!hasTrainer}
                        onClick={() => hasTrainer && setSelectedHorse(h.id)}
                        className={[
                          'flex items-center gap-3 border px-4 py-3 text-left transition-colors',
                          isSel ? 'border-navy bg-navy/5' : 'border-rim bg-surface hover:border-rim-hi',
                          !hasTrainer ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
                        ].join(' ')}
                      >
                        {h.avatarUrl ? (
                          <img src={h.avatarUrl} alt={h.horseName} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
                            {h.horseName?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-serif text-sm font-bold text-ink">{h.horseName}</p>
                          {h.breed && (
                            <p className="mt-0.5 text-xs text-ink-3">
                              {h.breed}{h.age != null ? ` · ${h.age} yrs` : ''}
                            </p>
                          )}
                          {!hasTrainer && (
                            <p className="mt-0.5 text-xs text-warn">No trainer — cannot register</p>
                          )}
                        </div>
                        {isSel && <CheckCircle2 size={16} className="shrink-0 text-navy" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Jockey selection */}
          <div className="overflow-hidden border border-rim bg-surface-raised">
            <div className="border-b border-rim px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Step 2</p>
              <h3 className="mt-0.5 font-serif text-base font-bold text-ink">Select Jockey</h3>
            </div>
            <div className="p-4">
              {jockeys.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-3">No jockeys available.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {jockeys.map((j) => (
                    <label
                      key={j.id}
                      className={[
                        'flex cursor-pointer items-center gap-3 border px-4 py-3 transition-colors',
                        selectedJockey === j.id ? 'border-navy bg-navy/5' : 'border-rim bg-surface hover:border-rim-hi',
                      ].join(' ')}
                    >
                      <input
                        type="radio"
                        name="jockey"
                        value={j.id}
                        checked={selectedJockey === j.id}
                        onChange={() => setSelectedJockey(j.id)}
                        className="sr-only"
                      />
                      <span className={`silk silk--${(j.id % 6) + 1}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{j.name}</p>
                        <p className="text-xs text-ink-3">{j.experienceYear} yr exp · Age {j.age}</p>
                      </div>
                      {selectedJockey === j.id && <CheckCircle2 size={15} className="shrink-0 text-navy" />}
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          {error}
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-3 border-t border-rim pt-5">
        <button
          type="button"
          onClick={() => setView('list')}
          disabled={submitting}
          className="px-5 py-2.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !selectedHorse || !selectedJockey}
          className="bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Registering…' : 'Confirm Registration'}
        </button>
      </div>
    </div>
  );

  /* ── Race list view ── */
  return (
    <div className="px-8 py-6">
      <Seo title="Register for Race" description="Browse open races and register your horse to compete on Royal Derby." />
      <DashboardPageHeader
        eyebrow="Horse Owner"
        title="Open Races"
        subtitle="Select a race to register your horse"
      />

      {error && (
        <div className="mb-5 border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          {error}
        </div>
      )}

      {loadingRaces ? <RaceGridSkeleton /> : races.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Trophy size={40} className="mb-4 text-ink-4" strokeWidth={1.5} />
          <h3 className="font-serif text-lg font-semibold text-ink">No open races</h3>
          <p className="mt-1 text-sm text-ink-3">No races are currently open for registration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {races.map((race) => (
            <button
              key={race.id}
              type="button"
              onClick={() => handleSelectRace(race)}
              className="group relative overflow-hidden border border-rim bg-surface-raised text-left transition-all duration-200 hover:border-gold/40 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)]"
            >
              {/* Gold top accent */}
              <div className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover:scale-x-100" />

              {/* Banner */}
              <div className="relative h-40 bg-navy">
                {race.bannerImageurl ? (
                  <img
                    src={race.bannerImageurl}
                    alt={race.raceName}
                    className="h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(168,132,59,0.14),transparent_60%)]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy/75 to-transparent" />

                {/* Prize badge */}
                {race.totalprizepool != null && (
                  <div className="absolute bottom-3 left-4">
                    <span className="inline-flex items-center gap-1 bg-gold/90 px-2 py-0.5 text-[11px] font-bold text-navy">
                      <Trophy size={10} />{fmt(race.totalprizepool)}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="px-4 py-4">
                <h3 className="line-clamp-1 font-serif text-base font-bold text-ink transition-colors group-hover:text-navy">
                  {race.raceName}
                </h3>
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-ink-3">
                    <Calendar size={11} className="shrink-0" />{fmtDate(race.startTime)}
                  </div>
                  {race.location && (
                    <div className="flex items-center gap-1.5 text-xs text-ink-3">
                      <MapPin size={11} className="shrink-0" />{race.location}
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-3 border-t border-rim pt-3">
                  {race.capacity && (
                    <span className="flex items-center gap-1 text-xs text-ink-4">
                      <Users size={11} />{race.capacity} slots
                    </span>
                  )}
                  {race.distance && (
                    <span className="flex items-center gap-1 text-xs text-ink-4">
                      <Ruler size={11} />{race.distance}
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-0.5 text-xs font-semibold text-navy">
                    Register
                    <ChevronRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
