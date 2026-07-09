import { useEffect, useState, useCallback } from 'react';
import { ChevronDown, Calendar, MapPin, TrendingUp, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/ToastProvider';
import { getRaces } from '@/api/raceApi';
import { getHorsesByRace, setOddsForOne, setOdds } from '@/api/raceHorseApi';
import RaceStatusBadge from '@/components/features/race/RaceStatusBadge';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { Race, RaceHorse, SetOddsPayload } from '@/types';

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

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

export default function AdminSetOddsPage() {
  const addToast = useToast();
  const [races, setRaces] = useState<Race[]>([]);
  const [loadingRaces, setLoadingRaces] = useState(true);
  const [openRaceId, setOpenRaceId] = useState<number | null>(null);
  const [horsesCache, setHorsesCache] = useState<Record<number, RaceHorse[]>>({});
  const [loadingHorsesFor, setLoadingHorsesFor] = useState<number | null>(null);
  const [oddsMap, setOddsMap] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savingAllRaceId, setSavingAllRaceId] = useState<number | null>(null);
  const [bulkOddsInput, setBulkOddsInput] = useState<Record<number, string>>({});

  useEffect(() => {
    getRaces({ size: 50 })
      .then((d) => setRaces(d.content ?? []))
      .catch(() => {})
      .finally(() => setLoadingRaces(false));
  }, []);

  const loadHorses = useCallback(async (raceId: number) => {
    if (horsesCache[raceId]) return;
    setLoadingHorsesFor(raceId);
    try {
      const data = await getHorsesByRace(raceId);
      const list = data ?? [];
      setHorsesCache((prev) => ({ ...prev, [raceId]: list }));
      const updates: Record<string, string> = {};
      list.forEach((rh) => { if (rh.odds != null) updates[`${raceId}-${rh.id}`] = String(rh.odds); });
      setOddsMap((prev) => ({ ...prev, ...updates }));
    } catch { addToast('Failed to load horses for this race.', 'error'); }
    finally { setLoadingHorsesFor(null); }
  }, [horsesCache, addToast]);

  const toggleRace = (raceId: number) => {
    if (openRaceId === raceId) { setOpenRaceId(null); return; }
    setOpenRaceId(raceId);
    loadHorses(raceId);
  };

  const handleSaveOdds = async (raceId: number, rh: RaceHorse) => {
    const key = `${raceId}-${rh.id}`;
    const odds = parseFloat(oddsMap[key] ?? '');
    if (isNaN(odds) || odds <= 0) { addToast('Odds must be a positive number.', 'error'); return; }
    setSavingId(rh.id);
    try {
      await setOddsForOne(rh.id, odds);
      addToast(`Odds saved for ${rh.horseName}`, 'success');
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
    const value = parseFloat(raw);
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

  return (
    <div className="px-8 py-6">
      <Seo title="Set Odds" />
      <DashboardPageHeader
        eyebrow="Admin"
        title="Set Race Odds"
        subtitle="Expand a race to configure odds for each horse"
      />

      {loadingRaces ? (
        <RaceListSkeleton />
      ) : races.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <TrendingUp size={32} className="text-ink-4" />
          <p className="font-serif text-lg font-bold text-ink">No races found</p>
          <p className="text-sm text-ink-3">There are no races available to set odds for.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {races.map((race) => {
            const isLocked = race.status === 'FINISHED' || race.status === 'CANCELLED';
            const isOpen = !isLocked && openRaceId === race.id;
            const isLoadingHorses = loadingHorsesFor === race.id;
            const horses = horsesCache[race.id] ?? [];

            return (
              <div key={race.id} className={`border border-rim bg-surface-raised ${isLocked ? 'opacity-60' : ''}`}>
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
                      className={`shrink-0 text-ink-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
                        <div className="flex items-center gap-3 border-b border-rim bg-surface-overlay/60 px-5 py-2.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-4">Set odds for all:</span>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            placeholder="e.g. 2.00"
                            value={bulkOddsInput[race.id] ?? ''}
                            onChange={(e) => setBulkOddsInput((prev) => ({ ...prev, [race.id]: e.target.value }))}
                            className="w-28 border border-rim bg-surface-input px-3 py-1.5 text-sm text-ink outline-none focus:border-rim-hi transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => handleApplyBulkOdds(race.id)}
                            className="border border-navy/30 bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/20"
                          >
                            Apply to All
                          </button>
                        </div>

                        {/* Column headers */}
                        <div className="grid grid-cols-[1fr_1fr_80px_140px_80px] items-center gap-4 border-b border-rim bg-surface-overlay px-5 py-2.5">
                          {['Horse', 'Jockey', 'Current', 'New Odds', ''].map((h) => (
                            <span key={h} className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                              {h}
                            </span>
                          ))}
                        </div>

                        <div className="divide-y divide-rim">
                          {horses.map((rh) => {
                            const key = `${race.id}-${rh.id}`;
                            const isSaving = savingId === rh.id;
                            const initial = rh.horseName?.charAt(0)?.toUpperCase() ?? '?';

                            return (
                              <div
                                key={rh.id}
                                className="grid grid-cols-[1fr_1fr_80px_140px_80px] items-center gap-4 px-5 py-3 transition-colors hover:bg-surface-overlay/40"
                              >
                                {/* Horse */}
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {rh.horseAvatarUrl ? (
                                    <img src={rh.horseAvatarUrl} alt={rh.horseName} className="h-7 w-7 shrink-0 object-cover" />
                                  ) : (
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-navy/10 font-serif text-xs font-bold text-navy">
                                      {initial}
                                    </div>
                                  )}
                                  <span className="truncate font-serif text-sm font-bold text-ink">
                                    {rh.horseName ?? '—'}
                                  </span>
                                </div>

                                {/* Jockey */}
                                <span className="truncate text-sm text-ink-2">{rh.jockeyName ?? '—'}</span>

                                {/* Current odds */}
                                <span className="tnum text-sm font-bold text-gold">
                                  {rh.odds != null ? `×${Number(rh.odds).toFixed(2)}` : '—'}
                                </span>

                                {/* New odds input */}
                                <input
                                  type="number"
                                  step="0.01"
                                  min="1"
                                  placeholder="e.g. 3.50"
                                  value={oddsMap[key] ?? ''}
                                  onChange={(e) => setOddsMap((prev) => ({ ...prev, [key]: e.target.value }))}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveOdds(race.id, rh); }}
                                  className="w-full border border-rim bg-surface-input px-3 py-1.5 text-sm text-ink outline-none focus:border-rim-hi transition-colors"
                                />

                                {/* Save */}
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleSaveOdds(race.id, rh)}
                                  className="border border-navy/30 bg-navy/10 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:bg-navy/20 disabled:opacity-50"
                                >
                                  {isSaving ? '…' : 'Save'}
                                </button>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer hint */}
                        <div className="flex items-center justify-between border-t border-rim px-5 py-2.5">
                          <p className="text-[11px] text-ink-4">Press Enter in the input field to save quickly.</p>
                          <button
                            type="button"
                            disabled={savingAllRaceId === race.id}
                            onClick={() => handleSaveAllOdds(race.id)}
                            className="border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold transition-colors hover:bg-gold/20 disabled:opacity-50"
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
          })}
        </div>
      )}
    </div>
  );
}