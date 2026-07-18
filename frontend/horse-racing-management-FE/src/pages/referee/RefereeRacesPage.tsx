import { useState, useEffect, useCallback } from 'react';
import { Flag, Play, Lock, ChevronDown, ChevronUp, Calendar, MapPin, Gavel } from 'lucide-react';
import { startRace, closeRegistration, getPenaltiesByRace } from '@/api/refereeApi';
import { getRaces } from '@/api/raceApi';
import SetResultModal from '@/components/features/referee/SetResultModal';
import IssuePenaltyModal from '@/components/features/referee/IssuePenaltyModal';
import PenaltyList from '@/components/features/referee/PenaltyList';
import RegisteredHorsesList from '@/components/features/race-horse/RegisteredHorsesList';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/ui/EmptyState';
import RaceStatusBadge from '@/components/features/race/RaceStatusBadge';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { Race, Penalty } from '@/types';

const fmtDate = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '—';

function RaceCardSkeleton() {
  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      <div className="flex items-center gap-4 px-5 py-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-48 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-surface-overlay" />
          </div>
          <div className="h-3 w-40 animate-pulse rounded-full bg-surface-overlay" />
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-24 animate-pulse rounded bg-surface-overlay" />
          <div className="h-8 w-28 animate-pulse rounded bg-surface-overlay" />
        </div>
      </div>
    </div>
  );
}

export default function RefereeRacesPage() {
  const addToast = useToast();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [expandedRaceId, setExpandedRaceId] = useState<number | null>(null);
  const [resultRace, setResultRace] = useState<Race | null>(null);

  // Penalty state
  const [penaltyRace, setPenaltyRace] = useState<Race | null>(null);
  const [penaltyPanelId, setPenaltyPanelId] = useState<number | null>(null);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [penaltiesLoading, setPenaltiesLoading] = useState(false);

  const fetchRaces = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getRaces({ size: 100 });
      const items = (data as unknown as { content?: Race[] }).content ?? (data as unknown as Race[]) ?? [];
      setRaces([...items].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    } catch { addToast('Failed to load races.', 'error'); }
    finally { setLoading(false); }
  }, [addToast]);

  useEffect(() => { fetchRaces(); }, [fetchRaces]);

  const loadPenalties = useCallback(async (raceId: number) => {
    setPenaltiesLoading(true);
    try { setPenalties((await getPenaltiesByRace(raceId)) ?? []); }
    catch { addToast('Failed to load penalties.', 'error'); }
    finally { setPenaltiesLoading(false); }
  }, [addToast]);

  const togglePenaltyPanel = (raceId: number) => {
    const next = penaltyPanelId === raceId ? null : raceId;
    setPenaltyPanelId(next);
    if (next != null) { setPenalties([]); loadPenalties(next); }
  };

  const doAction = async (id: number, fn: (id: number) => Promise<unknown>, msg: string) => {
    setActionId(id);
    try { await fn(id); addToast(msg, 'success'); fetchRaces(); }
    catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Action failed.', 'error');
    }
    finally { setActionId(null); }
  };

  return (
    <div className="px-8 py-6">
      <Seo title="Race Control" />
      <DashboardPageHeader
        eyebrow="Referee"
        title="Race Control"
        subtitle="Manage race status, penalties and results"
      />

      {loading ? (
        <div className="flex flex-col gap-3">
          {[...Array(5)].map((_, i) => <RaceCardSkeleton key={i} />)}
        </div>
      ) : races.length === 0 ? (
        <EmptyState icon={Flag} title="No races found" subtitle="No races have been created yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {races.map((race) => {
            const isExpanded = expandedRaceId === race.id;
            const isPenaltyOpen = penaltyPanelId === race.id;
            const isActing = actionId === race.id;

            return (
              <div key={race.id} className="overflow-hidden border border-rim bg-surface-raised transition-shadow hover:shadow-card">

                {/* Race row */}
                <div className="flex flex-wrap items-center gap-4 px-5 py-4">
                  {/* Banner thumbnail */}
                  {race.bannerImageurl && (
                    <div className="hidden h-12 w-16 shrink-0 overflow-hidden sm:block">
                      <img src={race.bannerImageurl} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="font-serif text-base font-bold text-ink">{race.raceName}</h3>
                      <RaceStatusBadge race={race} size="sm" />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span className="flex items-center gap-1 text-xs text-ink-3">
                        <Calendar size={11} />{fmtDate(race.startTime)}
                      </span>
                      {race.location && (
                        <span className="flex items-center gap-1 text-xs text-ink-3">
                          <MapPin size={11} />{race.location}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {race.status === 'OPEN_REGISTRATION' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => doAction(race.id, () => closeRegistration(race), 'Registration closed.')}
                        className="inline-flex items-center gap-1.5 border border-rim bg-surface-overlay px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-rim-hi hover:text-ink disabled:opacity-50"
                      >
                        <Lock size={12} /> Close Reg
                      </button>
                    )}
                    {race.status === 'CLOSED_REGISTRATION' && (
                      <button
                        type="button"
                        disabled={isActing}
                        onClick={() => doAction(race.id, startRace, `Race "${race.raceName}" started!`)}
                        className="inline-flex items-center gap-1.5 border border-ok/30 bg-ok-subtle px-3 py-1.5 text-xs font-semibold text-ok transition-colors hover:bg-ok/20 disabled:opacity-50"
                      >
                        <Play size={12} /> Start Race
                      </button>
                    )}

                    {/* Backend only accepts penalties while the race is ONGOING. */}
                    {race.status === 'ONGOING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => setPenaltyRace(race)}
                          className="inline-flex items-center gap-1.5 border border-fail/30 bg-fail-subtle px-3 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail/20"
                        >
                          <Gavel size={12} /> Penalty
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultRace(race)}
                          className="inline-flex items-center gap-1.5 border border-gold/40 bg-gold/10 px-3 py-1.5 text-xs font-semibold text-gold-hi transition-colors hover:bg-gold/20"
                        >
                          Set Result
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => togglePenaltyPanel(race.id)}
                      className="inline-flex items-center gap-1.5 border border-rim bg-surface-overlay px-3 py-1.5 text-xs font-semibold text-ink-3 transition-colors hover:border-rim-hi hover:text-ink"
                    >
                      <Gavel size={12} /> {isPenaltyOpen ? 'Hide' : 'View'} Penalties
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedRaceId(isExpanded ? null : race.id)}
                      className="inline-flex items-center gap-1.5 border border-rim bg-surface-overlay px-3 py-1.5 text-xs font-semibold text-ink-3 transition-colors hover:border-rim-hi hover:text-ink"
                    >
                      {isExpanded
                        ? <><ChevronUp size={12} /> Hide Horses</>
                        : <><ChevronDown size={12} /> View Horses</>}
                    </button>
                  </div>
                </div>

                {/* Expanded horse list */}
                {isExpanded && (
                  <div className="border-t border-rim bg-surface-overlay/30 px-5 py-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Registered Horses</p>
                    <RegisteredHorsesList
                      raceId={race.id}
                      isAdmin
                      onToast={(msg, type) => addToast(msg, type ?? 'success')}
                    />
                  </div>
                )}

                {/* Penalty panel */}
                {isPenaltyOpen && (
                  <div className="border-t border-rim bg-surface-overlay/30 px-5 py-4">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Penalties</p>
                    <PenaltyList
                      penalties={penalties}
                      loading={penaltiesLoading}
                      onChanged={() => loadPenalties(race.id)}
                      onToast={(msg, type) => addToast(msg, type ?? 'success')}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {resultRace && (
        <SetResultModal
          race={resultRace}
          onClose={() => setResultRace(null)}
          onSuccess={() => {
            addToast('Results saved!', 'success');
            setResultRace(null);
            fetchRaces();
          }}
        />
      )}

      {penaltyRace && (
        <IssuePenaltyModal
          race={penaltyRace}
          onClose={() => setPenaltyRace(null)}
          onSuccess={(msg) => {
            addToast(msg, 'success');
            if (penaltyPanelId === penaltyRace.id) loadPenalties(penaltyRace.id);
            // A DISQUALIFY changes RaceHorse status, so refresh the horse list too.
            setExpandedRaceId((cur) => cur);
            setPenaltyRace(null);
          }}
          onError={(msg) => addToast(msg, 'error')}
        />
      )}
    </div>
  );
}