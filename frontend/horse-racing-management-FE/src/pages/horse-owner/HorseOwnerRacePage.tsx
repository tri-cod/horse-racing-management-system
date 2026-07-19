import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, MapPin, Trophy, Users, Ruler,
  CheckCircle2, ArrowLeft, ChevronRight, Send, Wallet,
} from 'lucide-react';
import { getRaces } from '@/api/raceApi';
import { getAvailableHorses } from '@/api/horseOwnerApi';
import { getAvailableJockeys } from '@/api/jockeyApi';
import { registerHorseToRace, sendJockeyRequest } from '@/api/raceHorseApi';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import { calculateAge } from '@/utils/age';
import type { Race, Horse, Jockey, RaceHorse } from '@/types';

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

type View = 'list' | 'register' | 'assign-jockey' | 'sent';

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
    <div className="overflow-hidden border border-rim bg-surface-raised">
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
  const [revenuePercent, setRevenuePercent] = useState('10');
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [loadingForm, setLoadingForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [registeredHorse, setRegisteredHorse] = useState<RaceHorse | null>(null);

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
    getAvailableHorses(selectedRace.id)
      .then((h) => { if (!cancelled) setHorses(h ?? []); })
      .catch(() => { if (!cancelled) setError('Failed to load your horses.'); })
      .finally(() => { if (!cancelled) setLoadingForm(false); });
    return () => { cancelled = true; };
  }, [view, selectedRace]);

  useEffect(() => {
    if (view !== 'assign-jockey' || !selectedRace) return;
    let cancelled = false;
    setLoadingForm(true);
    getAvailableJockeys(selectedRace.id)
      .then((j) => { if (!cancelled) setJockeys(j ?? []); })
      .catch(() => { if (!cancelled) setError('Failed to load available jockeys.'); })
      .finally(() => { if (!cancelled) setLoadingForm(false); });
    return () => { cancelled = true; };
  }, [view, selectedRace]);

  const handleSelectRace = (race: Race) => {
    setSelectedRace(race); setSelectedHorse(null);
    setSelectedJockey(null); setError(''); setView('register');
  };

  const handleRegister = async () => {
    if (!selectedHorse) { setError('Please select a horse.'); return; }
    setSubmitting(true); setError('');
    try {
      const result = await registerHorseToRace({ raceId: selectedRace!.id, horseId: selectedHorse });
      setRegisteredHorse(result);
      setView('assign-jockey');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? 'Registration failed.');
    } finally { setSubmitting(false); }
  };

  const handleSendJockeyRequest = async () => {
    if (!selectedJockey) { setError('Please select a jockey.'); return; }
    const pct = Number(revenuePercent);
    if (revenuePercent === '' || isNaN(pct) || pct < 0 || pct > 100) {
      setError('Revenue share must be a number between 0 and 100.'); return;
    }
    if (!registeredHorse) { setError('Missing registration — please start again.'); return; }
    setSubmitting(true); setError('');
    try {
      await sendJockeyRequest({ raceHorseId: registeredHorse.id, jockeyId: selectedJockey, jockeyRevenuePercent: pct });
      setView('sent');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      setError(err?.response?.data?.message ?? 'Failed to send jockey request.');
    } finally { setSubmitting(false); }
  };

  const reset = () => {
    setView('list'); setSelectedRace(null);
    setSelectedHorse(null); setSelectedJockey(null);
    setRevenuePercent('10'); setRegisteredHorse(null); setError('');
  };

  /* ── Sent (final confirmation) ── */
  if (view === 'sent') return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-16 text-center">
      <Seo title="Jockey Request Sent" />
      {selectedRace && <RaceSummaryChip race={selectedRace} />}
      <div className="mb-4 text-gold"><Send size={52} strokeWidth={1.5} /></div>
      <h2 className="font-serif text-2xl font-bold text-ink">Jockey Request Sent</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-3">
        Your horse is registered for &ldquo;{selectedRace?.raceName}&rdquo; and the jockey has been invited.
        Once they accept, an admin will review and approve the entry. Track progress on the
        {' '}<Link to="/horse-owner/race-registrations" className="font-semibold text-gold hover:text-gold-hi">Race Registrations</Link> page.
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

  /* ── Assign jockey view ── */
  if (view === 'assign-jockey') return (
    <div className="px-8 py-6">
      <Seo title="Assign Jockey" />

      <button
        type="button"
        onClick={() => setView('register')}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mb-6 overflow-hidden border border-rim bg-surface-raised">
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gold" />
        <div className="px-5 py-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Step 2</p>
          <h2 className="mt-0.5 font-serif text-xl font-bold text-ink">Invite a Jockey</h2>
          <p className="mt-1 text-sm text-ink-3">
            {registeredHorse?.horseName ?? 'Your horse'} is registered for &ldquo;{selectedRace?.raceName}&rdquo;. Now invite a jockey to ride.
          </p>
        </div>
      </div>

      {loadingForm ? <SelectionSkeleton /> : (
        <div className="overflow-hidden border border-rim bg-surface-raised">
          <div className="border-b border-rim px-5 py-4">
            <h3 className="font-serif text-base font-bold text-ink">Select Jockey</h3>
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
                      <p className="text-xs text-ink-3">{j.experienceYear} yr exp · Age {calculateAge(j.dateOfBirth) ?? '—'}</p>
                    </div>
                    {selectedJockey === j.id && <CheckCircle2 size={15} className="shrink-0 text-navy" />}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-rim px-4 py-4">
            <label htmlFor="revenue-pct" className="mb-1.5 block text-xs font-medium text-ink-3">
              Jockey Revenue Share (%)
            </label>
            <input
              id="revenue-pct"
              type="number"
              min={0}
              max={100}
              value={revenuePercent}
              onChange={(e) => setRevenuePercent(e.target.value)}
              className="w-full max-w-[160px] border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
            />
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
          onClick={reset}
          disabled={submitting}
          className="px-5 py-2.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSendJockeyRequest}
          disabled={submitting || !selectedJockey}
          className="bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Sending…' : 'Send Request'}
        </button>
      </div>
    </div>
  );

  /* ── Register view (horse selection) ── */
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

      {selectedRace?.entryFee != null && selectedRace.entryFee > 0 && (
        <div className="mb-6 flex items-center gap-2 border border-warn/20 bg-warn-subtle px-4 py-3 text-sm text-warn">
          <Wallet size={15} className="shrink-0" />
          Registering costs an entry fee of <span className="font-semibold">{fmt(selectedRace.entryFee)}</span>, deducted from your wallet when you register.
        </div>
      )}

      {loadingForm ? <SelectionSkeleton /> : (
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
          onClick={handleRegister}
          disabled={submitting || !selectedHorse}
          className="bg-navy px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-blue transition-colors hover:bg-navy-deep disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Registering…' : 'Register Horse'}
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
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(168,132,59,0.14),transparent_60%)]" />
                )}
                {/* Bottom scrim only, just enough to keep the prize badge legible — not a
                    full-image tint (the previous opacity-70 + navy-wash washed every photo green). */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

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
                  {race.entryFee != null && race.entryFee > 0 && (
                    <span className="flex items-center gap-1 text-xs font-semibold text-warn">
                      <Wallet size={11} />{fmt(race.entryFee)} entry
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
