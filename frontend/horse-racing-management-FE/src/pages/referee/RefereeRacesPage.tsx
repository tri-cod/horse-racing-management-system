import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Flag, Play, Lock, ChevronDown, ChevronUp, Calendar, MapPin, Gavel, ClipboardCheck,
  Ruler, Waves, Droplets,
} from 'lucide-react';
import { startRace, getPenaltiesByRace } from '@/api/refereeApi';
import { getRaces } from '@/api/raceApi';
import SetResultModal from '@/components/features/referee/SetResultModal';
import IssuePenaltyModal from '@/components/features/referee/IssuePenaltyModal';
import InspectRaceModal from '@/components/features/referee/InspectRaceModal';
import PenaltyList from '@/components/features/referee/PenaltyList';
import RegisteredHorsesList from '@/components/features/race-horse/RegisteredHorsesList';
import { useToast } from '@/components/ui/ToastProvider';
import EmptyState from '@/components/ui/EmptyState';
import RaceStatusBadge from '@/components/features/race/RaceStatusBadge';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import { useMyRefereeProfile } from '@/hooks/useMyRefereeProfile';
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

/** Thumbnail with a letter-avatar fallback — swaps in on a broken/missing image URL
 *  instead of leaving the browser's broken-image icon on screen. */
function RaceThumbnail({ race }: { race: Race }) {
  const [broken, setBroken] = useState(false);
  if (race.bannerImageurl && !broken) {
    return (
      <img
        src={race.bannerImageurl}
        alt=""
        onError={() => setBroken(true)}
        className="hidden h-14 w-20 shrink-0 rounded object-cover sm:block"
      />
    );
  }
  return (
    <div className="hidden h-14 w-20 shrink-0 items-center justify-center rounded bg-surface-overlay font-serif text-sm font-bold text-ink-4 sm:flex">
      {race.raceName.charAt(0).toUpperCase()}
    </div>
  );
}

/** Section label used to separate race groups (Live / Upcoming / Finished). */
function SectionHeader({ label, count, dotClassName }: { label: string; count: number; dotClassName: string }) {
  return (
    <div className="mb-2 flex items-center gap-2 px-1">
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClassName}`} />
      <span className="text-xs font-bold uppercase tracking-wider text-ink-3">{label}</span>
      <span className="text-xs text-ink-4">({count})</span>
    </div>
  );
}

export default function RefereeRacesPage() {
  const addToast = useToast();
  const { profile: myProfile } = useMyRefereeProfile();
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRaceId, setExpandedRaceId] = useState<number | null>(null);
  const [resultRace, setResultRace] = useState<Race | null>(null);
  const [showFinished, setShowFinished] = useState(false);
  const [startingId, setStartingId] = useState<number | null>(null);

  // Inspection state
  const [inspectingRace, setInspectingRace] = useState<Race | null>(null);

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

  // A dedicated action, separate from the Check button — starting only becomes available
  // once a clean inspection has stamped race.raceInspectedAt (checked server-side too).
  const handleStartRace = async (race: Race) => {
    if (!window.confirm(`Start "${race.raceName}"? Betting will close and the race goes live.`)) return;
    setStartingId(race.id);
    try {
      await startRace(race.id);
      addToast('Race started!', 'success');
      fetchRaces();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      addToast(err?.response?.data?.message ?? 'Failed to start race.', 'error');
    } finally {
      setStartingId(null);
    }
  };

  // Group by what needs the referee's attention, same convention used on the odds panel:
  // live races first, then everything still upcoming, with finished/cancelled tucked away.
  const grouped = useMemo(() => {
    const live: Race[] = [];
    const upcoming: Race[] = [];
    const finished: Race[] = [];
    races.forEach((race) => {
      if (race.status === 'FINISHED' || race.status === 'CANCELLED') finished.push(race);
      else if (race.status === 'ONGOING') live.push(race);
      else upcoming.push(race);
    });
    return { live, upcoming, finished };
  }, [races]);

  const renderCard = (race: Race) => {
    const isExpanded = expandedRaceId === race.id;
    const isPenaltyOpen = penaltyPanelId === race.id;
    // Inspect/Penalty/Set Result are rejected server-side unless this referee is
    // the one assigned to the race — hide them rather than surface a confusing error.
    const isMine = myProfile != null && race.refereeId === myProfile.id;

    return (
      <div key={race.id} className="overflow-hidden border border-rim bg-surface-raised transition-shadow hover:shadow-card">

        {/* Race row */}
        <div className="flex flex-wrap items-start gap-4 px-5 py-4">
          <RaceThumbnail race={race} />

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
            {/* Track conditions — officiating-relevant race parameters. */}
            {(race.trackCondition || race.surfaceType || race.distance != null) && (
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                {race.trackCondition && (
                  <span className="flex items-center gap-1 text-xs text-ink-3">
                    <Droplets size={11} />{race.trackCondition}
                  </span>
                )}
                {race.surfaceType && (
                  <span className="flex items-center gap-1 text-xs text-ink-3">
                    <Waves size={11} />{race.surfaceType}
                  </span>
                )}
                {race.distance != null && race.distance !== '' && (
                  <span className="flex items-center gap-1 text-xs text-ink-3">
                    <Ruler size={11} />{race.distance}
                  </span>
                )}
              </div>
            )}

            {/* Secondary, low-emphasis toggles — kept apart from the primary
                status-changing actions on the right so that row stays scannable. */}
            <div className="mt-2.5 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setExpandedRaceId(isExpanded ? null : race.id)}
                className="flex items-center gap-1 text-xs font-semibold text-ink-4 transition-colors hover:text-gold-hi"
              >
                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {isExpanded ? 'Hide Horses' : 'View Horses'}
              </button>
              <button
                type="button"
                onClick={() => togglePenaltyPanel(race.id)}
                className="flex items-center gap-1 text-xs font-semibold text-ink-4 transition-colors hover:text-gold-hi"
              >
                <Gavel size={12} /> {isPenaltyOpen ? 'Hide Penalties' : 'View Penalties'}
              </button>
            </div>
          </div>

          {/* Primary, status-changing actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {/* Check and Start are deliberately two separate actions: Check only opens
                the inspection modal (mark horses OK / report issues), it never starts
                the race by itself. Start only appears once that check comes back clean
                (race.raceInspectedAt set) — backend enforces this gate too. */}
            {isMine && race.status === 'OPEN_BETTING' && (
              <button
                type="button"
                onClick={() => setInspectingRace(race)}
                className="inline-flex items-center gap-1.5 border border-rim-hi px-3.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:bg-surface-overlay"
              >
                <ClipboardCheck size={12} /> Check
              </button>
            )}
            {isMine && race.status === 'OPEN_BETTING' && race.raceInspectedAt && (
              <button
                type="button"
                disabled={startingId === race.id}
                onClick={() => handleStartRace(race)}
                className="inline-flex items-center gap-1.5 bg-navy px-3.5 py-1.5 text-xs font-semibold text-on-blue transition-colors hover:bg-navy-hi disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play size={12} /> {startingId === race.id ? 'Starting…' : 'Start Race'}
              </button>
            )}

            {/* Backend only accepts penalties/results from the assigned referee while ONGOING. */}
            {isMine && race.status === 'ONGOING' && (
              <>
                <button
                  type="button"
                  onClick={() => setPenaltyRace(race)}
                  className="inline-flex items-center gap-1.5 border border-fail/30 bg-fail-subtle px-3.5 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail/20"
                >
                  <Gavel size={12} /> Penalty
                </button>
                <button
                  type="button"
                  onClick={() => setResultRace(race)}
                  className="inline-flex items-center gap-1.5 bg-navy px-3.5 py-1.5 text-xs font-semibold text-on-blue transition-colors hover:bg-navy-hi"
                >
                  Set Result
                </button>
              </>
            )}
          </div>
        </div>

        {/* Expanded horse list */}
        {isExpanded && (
          <div className="border-t border-rim bg-surface-overlay/30 px-5 py-4">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Registered Horses</p>
            <RegisteredHorsesList raceId={race.id} />
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
        <div className="flex flex-col gap-6">
          {grouped.live.length > 0 && (
            <div>
              <SectionHeader label="Live now" count={grouped.live.length} dotClassName="bg-ok animate-pulse" />
              <div className="flex flex-col gap-2">{grouped.live.map(renderCard)}</div>
            </div>
          )}

          {grouped.upcoming.length > 0 && (
            <div>
              <SectionHeader label="Upcoming" count={grouped.upcoming.length} dotClassName="bg-gold" />
              <div className="flex flex-col gap-2">{grouped.upcoming.map(renderCard)}</div>
            </div>
          )}

          {grouped.finished.length > 0 && (
            <div>
              <button
                type="button"
                onClick={() => setShowFinished((v) => !v)}
                className="flex w-full items-center justify-between border-t border-rim py-3 text-left"
              >
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-ink-3">
                  <Lock size={12} className="text-ink-4" />
                  Finished / Cancelled
                  <span className="font-normal normal-case text-ink-4">({grouped.finished.length})</span>
                </span>
                <ChevronDown
                  size={16}
                  className={`text-ink-4 transition-transform duration-200 ${showFinished ? 'rotate-180' : ''}`}
                />
              </button>
              {showFinished && (
                <div className="flex flex-col gap-2 pt-2">{grouped.finished.map(renderCard)}</div>
              )}
            </div>
          )}
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

      {inspectingRace && (
        <InspectRaceModal
          race={inspectingRace}
          onClose={() => { setInspectingRace(null); fetchRaces(); }}
          onToast={(msg, type) => addToast(msg, type ?? 'success')}
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
