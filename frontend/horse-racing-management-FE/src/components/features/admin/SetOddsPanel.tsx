import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { ChevronDown, Calendar, MapPin, TrendingUp, TrendingDown, Lock, Check, Zap, Gauge, Award } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { getRaces } from '@/api/raceApi';
import { getHorsesByRace, setOddsForOne, setOdds } from '@/api/raceHorseApi';
import { getHorseById } from '@/api/horseOwnerApi';
import RaceStatusBadge from '@/components/features/race/RaceStatusBadge';
import type { Race, RaceHorse, SetOddsPayload, Horse } from '@/types';
import { isStatus } from '@/utils/raceHorseStatus';

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Accepts "2,20" or "2.20" while typing, always normalizes to dot notation. */
const sanitizeOddsInput = (raw: string) => raw.replace(',', '.').replace(/[^0-9.]/g, '');

/** Shared column ratio for the horses table — MUST stay identical between the
 *  header row and each data row, or columns will visibly drift out of alignment. */
const HORSES_GRID_COLS = '2fr_1.4fr_0.6fr_1fr_90px';

function RaceListSkeleton() {
  return (
    <div className="space-y-px">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center justify-between border border-rim bg-surface-raised px-5 py-4">
          <div className="space-y-2">
            <div className="h-4 w-48 animate-pulse rounded-full bg-surface-overlay" />
            <div className="flex gap-4">
              <div className="h-3 w-24 animate-pulse rounded-full bg-surface-overlay" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-surface-overlay" />
            </div>
          </div>
          <div className="h-5 w-20 animate-pulse rounded-full bg-surface-overlay" />
        </div>
      ))}
    </div>
  );
}

function HorsesSkeleton() {
  return (
    <div className="divide-y divide-rim">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-8 px-5 py-3">
          <div className="h-7 w-7 animate-pulse bg-surface-raised" />
          <div className="h-3.5 w-28 animate-pulse rounded-full bg-surface-raised" />
          <div className="h-3.5 w-20 animate-pulse rounded-full bg-surface-raised" />
          <div className="h-4 w-14 animate-pulse rounded-full bg-surface-raised" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-28 animate-pulse bg-surface-raised" />
            <div className="h-8 w-14 animate-pulse bg-surface-raised" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Small section heading used to separate race groups (Live / Upcoming / Closed). */
function SectionHeader({
  label,
  count,
  dotClassName,
}: {
  label: string;
  count: number;
  dotClassName: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClassName}`} />
      <span className="text-xs font-bold uppercase tracking-wider text-ink-3">{label}</span>
      <span className="text-xs text-ink-4">({count})</span>
    </div>
  );
}

export default function SetOddsPanel() {
  const addToast = useToast();
  const [races, setRaces] = useState<Race[]>([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [openRaceId, setOpenRaceId] = useState<number | null>(null);
  const [horsesCache, setHorsesCache] = useState<Record<number, RaceHorse[]>>({});
  const [loadingHorsesFor, setLoadingHorsesFor] = useState<number | null>(null);
  const [horseDetails, setHorseDetails] = useState<Record<number, Horse>>({});
  const fetchedHorseIdsRef = useRef<Set<number>>(new Set());
  const [oddsMap, setOddsMap] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savingAllRaceId, setSavingAllRaceId] = useState<number | null>(null);
  const [bulkOddsInput, setBulkOddsInput] = useState<Record<number, string>>({});
  const [justSavedId, setJustSavedId] = useState<number | null>(null);
  const [showClosed, setShowClosed] = useState(false);

  useEffect(() => {
    getRaces({ size: 50 })
      .then((d) => setRaces(d.content ?? []))
      .catch(() => { })
      .finally(() => setLoadingRaces(false));
  }, []);

  /** Fetches age/speed/class for horses not seen yet — dedup'd across races via a ref
   *  so switching between races never re-fetches a horse already loaded. */
  const loadHorseDetails = useCallback((horseIds: number[]) => {
    const toFetch = [...new Set(horseIds)].filter((id) => !fetchedHorseIdsRef.current.has(id));
    toFetch.forEach((id) => {
      fetchedHorseIdsRef.current.add(id);
      getHorseById(id)
        .then((horse) => setHorseDetails((prev) => ({ ...prev, [id]: horse })))
        .catch(() => { fetchedHorseIdsRef.current.delete(id); });
    });
  }, []);

  const loadHorses = useCallback(async (raceId: number) => {
    if (horsesCache[raceId]) return;
    setLoadingHorsesFor(raceId);
    try {
      const data = await getHorsesByRace(raceId);
      // Only horses cleared through the full jockey-accept + admin-approve flow
      // should be eligible for betting odds — exclude PendingJockey/JockeyRejected/
      // PendingAdmin/WithdrawPending entries.
      const list = (data ?? []).filter((rh) => isStatus(rh.status, 'APPROVED')); setHorsesCache((prev) => ({ ...prev, [raceId]: list }));
      const updates: Record<string, string> = {};
      list.forEach((rh) => { if (rh.odds != null) updates[`${raceId}-${rh.id}`] = String(rh.odds); });
      setOddsMap((prev) => ({ ...prev, ...updates }));
      loadHorseDetails(list.map((rh) => rh.horseId));
    } catch { addToast('Failed to load horses for this race.', 'error'); }
    finally { setLoadingHorsesFor(null); }
  }, [horsesCache, addToast, loadHorseDetails]);

  const toggleRace = (raceId: number) => {
    if (openRaceId === raceId) { setOpenRaceId(null); return; }
    setOpenRaceId(raceId);
    loadHorses(raceId);
  };

  const flashSaved = (id: number) => {
    setJustSavedId(id);
    setTimeout(() => setJustSavedId((cur) => (cur === id ? null : cur)), 1800);
  };

  const handleSaveOdds = async (raceId: number, rh: RaceHorse) => {
    const key = `${raceId}-${rh.id}`;
    const odds = parseFloat(oddsMap[key] ?? '');
    if (isNaN(odds) || odds <= 0) { addToast('Odds must be a positive number.', 'error'); return; }
    setSavingId(rh.id);
    try {
      await setOddsForOne(rh.id, odds);
      flashSaved(rh.id);
      setHorsesCache((prev) => ({
        ...prev,
        [raceId]: (prev[raceId] ?? []).map((h) => h.id === rh.id ? { ...h, odds } : h),
      }));
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to save odds.', 'error');
    } finally { setSavingId(null); }
  };

  const handleSaveAllOdds = async (raceId: number) => {
    const horses = horsesCache[raceId] ?? [];
    const oddsList: SetOddsPayload[] = [];

    for (const rh of horses) {
      const key = `${raceId}-${rh.id}`;
      const raw = oddsMap[key];
      if (raw == null || raw.trim() === '') continue; // bỏ qua ô trống

      const odds = parseFloat(raw);
      if (isNaN(odds) || odds <= 1) {
        addToast(`Invalid odds for ${rh.horseName ?? 'this horse'}: must be greater than 1.`, 'error');
        return; // dừng lại, không gửi request
      }
      oddsList.push({ raceHorseId: rh.id, odds });
    }

    if (oddsList.length === 0) {
      addToast('No odds entered to save.', 'error');
      return;
    }

    setSavingAllRaceId(raceId);
    try {
      await setOdds(raceId, oddsList);
      setHorsesCache((prev) => ({
        ...prev,
        [raceId]: (prev[raceId] ?? []).map((h) => {
          const match = oddsList.find((o) => o.raceHorseId === h.id);
          return match ? { ...h, odds: match.odds } : h;
        }),
      }));
      addToast(`Saved odds for ${oddsList.length} horses`, 'success');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to save all odds.', 'error');
    } finally {
      setSavingAllRaceId(null);
    }
  };

  const handleApplyBulkOdds = (raceId: number) => {
    const raw = bulkOddsInput[raceId] ?? '';
    const value = parseFloat(sanitizeOddsInput(raw));
    if (isNaN(value) || value <= 1) {
      addToast('Bulk odds must be a number greater than 1.', 'error');
      return;
    }
    const horses = horsesCache[raceId] ?? [];
    const updates: Record<string, string> = {};
    horses.forEach((rh) => { updates[`${raceId}-${rh.id}`] = String(value); });
    setOddsMap((prev) => ({ ...prev, ...updates }));
    addToast(`Applied ×${value.toFixed(2)} to ${horses.length} horses. Review then click "Save All Odds" to save.`, 'success');
  };

  /**
   * Group races by status, purely client-side — no backend/API changes.
   * - live: currently running races, soonest start first
   * - upcoming: everything not live/closed (e.g. open/closed registration), soonest first
   * - closed: FINISHED / CANCELLED, most recent first, collapsed by default
   */
  const groupedRaces = useMemo(() => {
    const live: Race[] = [];
    const upcoming: Race[] = [];
    const closed: Race[] = [];

    races.forEach((race) => {
      if (race.status === 'FINISHED' || race.status === 'CANCELLED') {
        closed.push(race);
      } else if (race.status === 'ONGOING') {
        live.push(race);
      } else {
        upcoming.push(race);
      }
    });

    const byDateAsc = (a: Race, b: Race) =>
      new Date(a.startTime ?? 0).getTime() - new Date(b.startTime ?? 0).getTime();
    const byDateDesc = (a: Race, b: Race) =>
      new Date(b.startTime ?? 0).getTime() - new Date(a.startTime ?? 0).getTime();

    live.sort(byDateAsc);
    upcoming.sort(byDateAsc);
    closed.sort(byDateDesc);

    return { live, upcoming, closed };
  }, [races]);

  const renderRaceCard = (race: Race) => {
    // Odds can only move before a race starts — once it's live, running odds would let
    // admins move the market mid-race, and once it's over there's nothing left to price.
    const isLocked = race.status === 'FINISHED' || race.status === 'CANCELLED' || race.status === 'ONGOING';
    const isOpen = !isLocked && openRaceId === race.id;
    const isLoadingHorses = loadingHorsesFor === race.id;
    const horses = horsesCache[race.id] ?? [];

    // Left accent bar color follows race state, using existing project tokens only.
    const accentBorder = isLocked ? 'border-l-ink-4/30' : 'border-l-gold';

    return (
      <div
        key={race.id}
        className={`border border-l-[3px] bg-surface-raised transition-colors ${accentBorder} ${isOpen ? 'border-gold/40' : 'border-rim'
          } ${isLocked ? 'opacity-55' : ''}`}
      >
        {/* Accordion header */}
        <button
          type="button"
          onClick={() => !isLocked && toggleRace(race.id)}
          disabled={isLocked}
          className={`group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors ${isLocked ? 'cursor-not-allowed' : 'hover:bg-surface-overlay/60'}`}
        >
          {/* Chevron / Lock */}
          {isLocked ? (
            <Lock size={14} className="shrink-0 text-ink-4" />
          ) : (
            <ChevronDown
              size={16}
              className={`shrink-0 text-ink-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-gold' : ''}`}
            />
          )}

          {/* Race info */}
          <div className="flex-1 min-w-0">
            <p className="font-serif text-base font-bold text-ink truncate">{race.raceName}</p>
            <div className="mt-0.5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-ink-4">
                <Calendar size={11} /> {fmtDate(race.startTime)}
              </span>
              {race.location && (
                <span className="flex items-center gap-1 text-xs text-ink-4">
                  <MapPin size={11} /> {race.location}
                </span>
              )}
              {isLocked && (
                <span className="text-xs italic text-ink-4">
                  {race.status === 'ONGOING' ? 'Race is live — odds are locked' : 'Odds are read-only for closed races'}
                </span>
              )}
            </div>
          </div>

          {/* Status */}
          <RaceStatusBadge race={race} size="sm" />

          {/* Horse count badge when open */}
          {isOpen && !isLoadingHorses && (
            <span className="shrink-0 border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold">
              {horses.length} {horses.length === 1 ? 'horse' : 'horses'}
            </span>
          )}
        </button>

        {/* Accordion body */}
        {isOpen && (
          <div className="border-t border-rim bg-surface">
            {isLoadingHorses ? (
              <HorsesSkeleton />
            ) : horses.length === 0 ? (
              <div className="flex items-center gap-2 px-5 py-6 text-sm text-ink-3">
                <TrendingUp size={16} className="text-ink-4" />
                No horses registered for this race yet.
              </div>
            ) : (
              <>
                {/* Bulk odds toolbar */}
                <div className="flex items-center gap-3 border-b border-rim bg-surface-overlay/60 px-5 py-3">
                  <Zap size={13} className="shrink-0 text-gold" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">
                    Apply odds to every horse:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-3">×</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="2.00"
                      value={bulkOddsInput[race.id] ?? ''}
                      onChange={(e) =>
                        setBulkOddsInput((prev) => ({ ...prev, [race.id]: sanitizeOddsInput(e.target.value) }))
                      }
                      onKeyDown={(e) => { if (e.key === 'Enter') handleApplyBulkOdds(race.id); }}
                      className="tnum w-24 border border-rim bg-surface-input px-3 py-1.5 text-sm font-semibold text-ink outline-none transition-colors focus:border-gold"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyBulkOdds(race.id)}
                    className="border border-rim bg-transparent px-3 py-1.5 text-xs font-semibold text-ink-3 transition-colors hover:border-gold hover:bg-gold hover:text-on-gold"
                  >
                    Apply to All
                  </button>
                </div>

                {/* Column headers */}
                <div
                  className="grid items-center gap-4 border-b border-rim bg-surface-overlay px-5 py-2.5"
                  style={{ gridTemplateColumns: HORSES_GRID_COLS.split('_').join(' ') }}
                >
                  {['Horse', 'Jockey', 'Current', 'New Odds', ''].map((h) => (
                    <span
                      key={h}
                      className={`text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4 ${h === 'Current' ? 'text-center' : ''
                        }`}
                    >
                      {h}
                    </span>
                  ))}
                </div>

                <div className="divide-y divide-rim">
                  {horses.map((rh) => {
                    const key = `${race.id}-${rh.id}`;
                    const isSaving = savingId === rh.id;
                    const justSaved = justSavedId === rh.id;
                    const initial = rh.horseName?.charAt(0)?.toUpperCase() ?? '?';

                    const rawInput = oddsMap[key] ?? '';
                    const newValue = parseFloat(rawInput);
                    const hasValidNew = !isNaN(newValue) && rawInput.trim() !== '';
                    const currentValue = rh.odds != null ? Number(rh.odds) : null;
                    const isDirty = hasValidNew && (currentValue == null || newValue !== currentValue);
                    const delta = hasValidNew && currentValue != null ? newValue - currentValue : null;
                    const detail = horseDetails[rh.horseId];

                    return (
                      <div
                        key={rh.id}
                        className={`grid items-center gap-4 px-5 py-3 transition-colors ${isDirty ? 'bg-gold/[0.04]' : 'hover:bg-surface-overlay/40'
                          }`}
                        style={{ gridTemplateColumns: HORSES_GRID_COLS.split('_').join(' ') }}
                      >
                        {/* Horse — name plus a compact breed / age / speed / class line underneath */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          {rh.horseAvatarUrl ? (
                            <img src={rh.horseAvatarUrl} alt={rh.horseName} className="h-9 w-9 shrink-0 object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-navy/10 font-serif text-xs font-bold text-navy">
                              {initial}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-serif text-sm font-bold text-ink">
                              {rh.horseName ?? '—'}
                            </p>
                            <p className="mt-0.5 flex items-center gap-2.5 truncate text-[10px] font-medium text-ink-4">
                              {detail ? (
                                <>
                                  {detail.breed && <span className="truncate">{detail.breed}</span>}
                                  {detail.age != null && <span className="shrink-0">Age {detail.age}</span>}
                                  {detail.speedRating != null && (
                                    <span className="flex shrink-0 items-center gap-0.5">
                                      <Gauge size={10} className="text-ink-4" /> {detail.speedRating}
                                    </span>
                                  )}
                                  {detail.historyRank && (
                                    <span className="flex shrink-0 items-center gap-0.5 text-gold">
                                      <Award size={10} /> {detail.historyRank}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="italic text-ink-4/60">Loading stats…</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Jockey */}
                        <span className="truncate text-sm text-ink-2">{rh.jockeyName ?? '—'}</span>

                        {/* Current odds */}
                        <span className="tnum text-center text-sm font-semibold text-ink-3">
                          {currentValue != null ? `×${currentValue.toFixed(2)}` : '—'}
                        </span>

                        {/* New odds input + delta */}
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-ink-4">
                              ×
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="3.50"
                              value={rawInput}
                              onChange={(e) =>
                                setOddsMap((prev) => ({ ...prev, [key]: sanitizeOddsInput(e.target.value) }))
                              }
                              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveOdds(race.id, rh); }}
                              className={`tnum w-full border bg-surface-input py-1.5 pl-7 pr-3 text-sm font-semibold text-ink outline-none transition-colors ${isDirty ? 'border-gold' : 'border-rim focus:border-rim-hi'
                                }`}
                            />
                          </div>
                          {delta != null && Math.abs(delta) >= 0.005 && (
                            <span
                              className={`flex shrink-0 items-center gap-0.5 text-[11px] font-bold tnum ${delta > 0 ? 'text-ok' : 'text-fail'
                                }`}
                              title={`${delta > 0 ? 'Increase' : 'Decrease'} from current odds`}
                            >
                              {delta > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                              {Math.abs(delta).toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Save */}
                        <button
                          type="button"
                          disabled={isSaving || !isDirty}
                          onClick={() => handleSaveOdds(race.id, rh)}
                          className={`flex items-center justify-center gap-1.5 border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${justSaved
                              ? 'border-ok/40 bg-ok/10 text-ok'
                              : isDirty
                                ? 'border-gold bg-gold text-on-gold hover:bg-gold/90'
                                : 'border-rim bg-transparent text-ink-4 disabled:opacity-60'
                            }`}
                        >
                          {isSaving ? (
                            '…'
                          ) : justSaved ? (
                            <><Check size={12} /> Saved</>
                          ) : (
                            'Save'
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer hint */}
                <div className="flex items-center justify-between border-t border-rim bg-surface-overlay/40 px-5 py-3">
                  <p className="text-[11px] text-ink-4">Press Enter in a field to save that row instantly.</p>
                  <button
                    type="button"
                    disabled={savingAllRaceId === race.id}
                    onClick={() => handleSaveAllOdds(race.id)}
                    className="border border-rim bg-transparent px-4 py-2 text-xs font-semibold text-ink-3 transition-colors hover:border-gold hover:bg-gold hover:text-on-gold disabled:opacity-50"
                  >
                    {savingAllRaceId === race.id ? 'Saving…' : 'Save All Odds'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return loadingRaces ? (
    <RaceListSkeleton />
  ) : races.length === 0 ? (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <TrendingUp size={32} className="text-ink-4" />
      <p className="font-serif text-lg font-bold text-ink">No races found</p>
      <p className="text-sm text-ink-3">There are no races available to set odds for.</p>
    </div>
  ) : (
    <div className="space-y-6">
      {/* Upcoming / open / closed-registration races — the only ones odds can still be set for */}
      {groupedRaces.upcoming.length > 0 && (
        <div>
          <SectionHeader label="Upcoming" count={groupedRaces.upcoming.length} dotClassName="bg-gold" />
          <div className="space-y-2">
            {groupedRaces.upcoming.map((race) => renderRaceCard(race))}
          </div>
        </div>
      )}

      {/* Live races — race has started, odds are locked */}
      {groupedRaces.live.length > 0 && (
        <div>
          <SectionHeader label="Live now" count={groupedRaces.live.length} dotClassName="bg-ok" />
          <div className="space-y-2">
            {groupedRaces.live.map((race) => renderRaceCard(race))}
          </div>
        </div>
      )}

      {/* Finished / cancelled races — collapsed by default */}
      {groupedRaces.closed.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowClosed((v) => !v)}
            className="flex w-full items-center justify-between border-t border-rim py-3 text-left"
          >
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-3">
              <Lock size={12} className="text-ink-4" />
              Finished / Cancelled
              <span className="font-normal normal-case text-ink-4">({groupedRaces.closed.length})</span>
            </span>
            <ChevronDown
              size={16}
              className={`text-ink-4 transition-transform duration-200 ${showClosed ? 'rotate-180' : ''}`}
            />
          </button>
          {showClosed && (
            <div className="space-y-2 pt-2">
              {groupedRaces.closed.map((race) => renderRaceCard(race))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
