import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Flag, Wallet,
  MapPin, Trophy, Clock, AlertCircle, TrendingUp, X, Ticket,
} from 'lucide-react';
import { useRaces } from '@/hooks/useRaces';
import { useRaceDetail } from '@/hooks/useRaceDetail';
import { useHorsesByRace } from '@/hooks/useHorsesByRace';
import { useAuth } from '@/context/AuthContext';
import { useWalletBalance, useInvalidateWalletBalance } from '@/hooks/useWalletBalance';
import { useToast } from '@/components/ui/ToastProvider';
import { placeBet } from '@/api/betApi';
import { FadeInStagger, FadeInItem } from '@/components/shared/FadeIn';
import { assignLanes } from '@/utils/laneUtils';
import { getErrorMessage } from '@/utils/errors';
import type { Race, RaceHorse } from '@/types';

/* ── Helpers ───────────────────────────────────────────────────── */
const LANE_STYLE: Record<number, { bg: string; color: string }> = {
  1: { bg: '#dc2626', color: '#fff' },
  2: { bg: '#ffffff', color: '#111' },
  3: { bg: '#0284c7', color: '#fff' },
  4: { bg: '#facc15', color: '#000' },
  5: { bg: '#15803d', color: '#fff' },
  6: { bg: '#f97316', color: '#fff' },
  7: { bg: '#ec4899', color: '#fff' },
  8: { bg: '#7e22ce', color: '#fff' },
  9: { bg: '#0d9488', color: '#fff' },
};

const NON_BETTABLE = new Set(['FINISHED', 'CANCELLED', 'ONGOING']);

const STATUS_DOT: Record<string, string> = {
  UPCOMING: 'bg-gold/60',
  OPEN_REGISTRATION: 'bg-ok',
  CLOSED_REGISTRATION: 'bg-gold',
  SETTING_ODDS: 'bg-gold',
  OPEN_BETTING: 'bg-gold',
  ONGOING: 'bg-fail animate-pulse',
  FINISHED: 'bg-ink-4',
  CANCELLED: 'bg-ink-4',
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'Upcoming',
  OPEN_REGISTRATION: 'Open',
  CLOSED_REGISTRATION: 'Entries Closed',
  SETTING_ODDS: 'Setting Odds',
  OPEN_BETTING: 'Betting Open',
  ONGOING: 'Live',
  FINISHED: 'Finished',
  CANCELLED: 'Cancelled',
};

function fmtDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function fmtTime(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function fmtVnd(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);
}
function fmtPrize(n?: number) {
  return n ? fmtVnd(n) : null;
}
function fmtBalance(n: number | null) {
  return n != null ? fmtVnd(n) : '—';
}

type BetAmounts = Record<number, string>; /* raceHorseId → raw input string */

/* ── Race Selector Card ────────────────────────────────────────── */
function RaceSelectorCard({ race, selected, onClick }: { race: Race; selected: boolean; onClick: () => void }) {
  const dot = STATUS_DOT[race.status] ?? 'bg-ink-4';
  return (
    <button type="button" onClick={onClick}
      className={`group relative shrink-0 w-52 overflow-hidden rounded-md border text-left transition-all duration-200 active:scale-[0.98] ${
        selected
          ? 'border-gold bg-gold/5 shadow-lg shadow-gold/10'
          : 'border-rim bg-surface-raised hover:border-rim-hi hover:bg-surface-overlay/60'
      }`}>
      <div className={`h-0.5 w-full ${!NON_BETTABLE.has(race.status) ? 'bg-gold' : 'bg-rim'}`} />
      <div className="p-3.5">
        <div className="mb-2 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-ink-3">
            {STATUS_LABEL[race.status] ?? race.status}
          </span>
        </div>
        <p className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-ink group-hover:text-gold transition-colors">
          {race.raceName}
        </p>
        <p className="text-[11px] tabular-nums text-ink-4">{fmtDate(race.startTime)}</p>
      </div>
    </button>
  );
}

/* ── Odds Board ─────────────────────────────────────────────────
   Left panel: race banner + meta + runners table with inline stake input */
type HorseEntry = RaceHorse & { laneNumber?: number };

/* Skeleton mirrors the loaded layout (banner + meta strip + runner rows)
   instead of a generic spinner, so the panel doesn't jump on load. */
function OddsBoardSkeleton({ showStake }: { showStake: boolean }) {
  const cols = showStake ? 'grid-cols-[2.5rem_2.5rem_1fr_4rem_7.5rem]' : 'grid-cols-[2.5rem_2.5rem_1fr_5rem]';
  return (
    <div className="flex flex-col">
      <div className="h-48 animate-pulse bg-surface-overlay" />
      <div className="flex gap-5 border-b border-rim bg-surface-overlay/60 px-6 py-3">
        {[16, 20, 28, 24].map((w, i) => (
          <div key={i} className="h-3 animate-pulse rounded bg-rim" style={{ width: `${w * 4}px` }} />
        ))}
      </div>
      <div className={`grid gap-3 border-b border-rim bg-surface-raised px-6 py-3 ${cols}`}>
        {Array.from({ length: showStake ? 5 : 4 }).map((_, i) => (
          <div key={i} className="h-2.5 animate-pulse rounded bg-rim" />
        ))}
      </div>
      <div className="divide-y divide-rim">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={`grid gap-3 items-center px-6 py-4 ${cols}`}>
            <div className="h-3 w-5 animate-pulse rounded bg-rim" />
            <div className="h-8 w-8 animate-pulse rounded bg-rim" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-2/3 animate-pulse rounded bg-rim" />
              <div className="h-2.5 w-1/3 animate-pulse rounded bg-surface-overlay" />
            </div>
            <div className="ml-auto h-5 w-8 animate-pulse rounded bg-rim" />
            {showStake && <div className="h-8 animate-pulse rounded bg-surface-overlay" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function OddsBoard({
  raceId,
  betAmounts,
  onAmountChange,
  canBet,
  bettable,
  embedded,
}: {
  raceId: number;
  betAmounts: BetAmounts;
  onAmountChange: (id: number, value: string) => void;
  canBet: boolean;
  bettable: boolean;
  embedded: boolean;
}) {
  const { race, loading: rl } = useRaceDetail(raceId);
  const { entries: raw, loading: el } = useHorsesByRace(raceId);

  const entries = useMemo((): HorseEntry[] =>
    (assignLanes(
      raw.filter(e => e.status?.toLowerCase() === 'approved' && e.odds != null) as Parameters<typeof assignLanes>[0]
    ) as HorseEntry[]).sort((a, b) => (a.odds ?? Infinity) - (b.odds ?? Infinity)),
    [raw]
  );

  const showStake = canBet && bettable;
  const [bannerError, setBannerError] = useState(false);
  useEffect(() => { setBannerError(false); }, [race?.bannerImageurl]);

  if (rl || el) return <OddsBoardSkeleton showStake={showStake} />;
  if (!race) return null;

  const showBanner = !!race.bannerImageurl && !bannerError;

  const infoItems: Array<{ label: string; value: string }> = [
    { label: 'Date', value: fmtDate(race.startTime) },
    { label: 'Post Time', value: fmtTime(race.startTime) },
    ...(race.endTime ? [{ label: 'End Time', value: fmtTime(race.endTime) }] : []),
    ...(race.trackName ? [{ label: 'Track', value: race.trackName }] : []),
    ...(race.location ? [{ label: 'Location', value: race.location }] : []),
    ...(race.distance != null && race.distance !== '' ? [{ label: 'Distance', value: String(race.distance) }] : []),
    ...(race.surfaceType ? [{ label: 'Surface', value: race.surfaceType }] : []),
    ...(race.trackCondition ? [{ label: 'Track Condition', value: race.trackCondition }] : []),
    ...(race.capacity != null ? [{ label: 'Capacity', value: `${race.capacity} horses` }] : []),
    ...(race.entryFee != null ? [{ label: 'Entry Fee', value: fmtVnd(race.entryFee) }] : []),
    ...(race.registrationDeadline ? [{ label: 'Reg. Deadline', value: fmtDate(race.registrationDeadline) }] : []),
  ];

  return (
    <div className="flex flex-col">
      {embedded ? (
        /* Homepage: full race details in place of the banner image */
        <div className="border-b border-rim bg-surface-overlay/40 px-6 py-4">
          <h2 className="mb-4 font-serif text-xl font-bold text-ink sm:text-2xl">{race.raceName}</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {infoItems.map((item) => (
              <div key={item.label}>
                <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-4">{item.label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : (
        <>
          {/* Banner — kept as a dark photo-caption island (matches the app's card-on-photo
              convention elsewhere) so the title stays legible regardless of page theme. */}
          <div className="relative h-48 overflow-hidden">
            {showBanner ? (
              <img
                src={race.bannerImageurl}
                alt={race.raceName}
                className="h-full w-full object-cover opacity-60"
                onError={() => setBannerError(true)}
              />
            ) : (
              <div className="relative h-full w-full bg-navy-deep">
                <div className="absolute inset-0 opacity-[0.07]" style={{
                  backgroundImage: 'repeating-linear-gradient(135deg, var(--c-gold) 0 2px, transparent 2px 28px)',
                }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(168,132,59,0.16),transparent_60%)]" />
                <Trophy size={220} strokeWidth={0.6} className="absolute -right-8 -top-8 text-gold/[0.07]" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp size={12} className="text-gold/70" />
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/70">Live Odds</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-on-blue sm:text-3xl">{race.raceName}</h2>
            </div>
          </div>

          {/* Meta strip */}
          <div className="flex flex-wrap gap-5 border-b border-rim bg-surface-overlay/60 px-6 py-3">
            <span className="flex items-center gap-1.5 text-xs text-ink-3"><Clock size={11} /> {fmtTime(race.startTime)}</span>
            {race.distance && <span className="flex items-center gap-1.5 text-xs text-ink-3"><Flag size={11} /> {race.distance}</span>}
            {race.location && <span className="flex items-center gap-1.5 text-xs text-ink-3"><MapPin size={11} /> {race.location}</span>}
            {race.totalprizepool != null && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-gold-hi">
                <Trophy size={11} /> {fmtPrize(race.totalprizepool)}
              </span>
            )}
          </div>
        </>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Flag size={32} className="text-ink-4" strokeWidth={1.5} />
          <p className="text-sm text-ink-3">No confirmed entries with odds yet.</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className={`grid gap-3 border-b border-rim bg-surface-raised px-6 py-3 ${showStake ? 'grid-cols-[2.5rem_2.5rem_1fr_4rem_7.5rem]' : 'grid-cols-[2.5rem_2.5rem_1fr_5rem]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4">#</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4">PP</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-ink-4">Runner</span>
            <span className="text-right text-[10px] font-bold uppercase tracking-widest text-ink-4">Odds</span>
            {showStake && <span className="text-right text-[10px] font-bold uppercase tracking-widest text-ink-4">Stake (₫)</span>}
          </div>

          {/* Runner rows */}
          <div className="divide-y divide-rim">
            {entries.map((e, idx) => {
              const laneStyle = LANE_STYLE[e.laneNumber ?? 0];
              const isFav = idx === 0;
              const hasStake = !!betAmounts[e.id] && parseInt(betAmounts[e.id]) > 0;

              return (
                <div key={e.id}
                  className={`grid gap-3 items-center px-6 py-4 transition-colors ${showStake ? 'grid-cols-[2.5rem_2.5rem_1fr_4rem_7.5rem]' : 'grid-cols-[2.5rem_2.5rem_1fr_5rem]'} ${hasStake ? 'bg-gold/[0.06]' : isFav ? 'bg-gold/[0.035]' : 'hover:bg-surface-overlay/50'}`}>

                  {/* Row number */}
                  <span className="tabular-nums text-sm font-medium text-ink-4">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Post position */}
                  <div className="flex h-8 w-8 items-center justify-center text-sm font-bold"
                    style={laneStyle
                      ? { backgroundColor: laneStyle.bg, color: laneStyle.color }
                      : { backgroundColor: 'rgba(19,28,21,0.06)', color: 'rgba(19,28,21,0.35)' }}>
                    {e.laneNumber ?? '—'}
                  </div>

                  {/* Horse info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold uppercase tracking-wide text-ink">{e.horseName}</p>
                      {isFav && (
                        <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold-hi">
                          Fav
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-4">{e.jockeyName ?? 'Jockey TBA'}</p>
                  </div>

                  {/* Odds */}
                  <div className="text-right">
                    <span className="tnum text-xl font-bold text-gold-hi leading-none">{e.odds}</span>
                  </div>

                  {/* Inline stake input */}
                  {showStake && (
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        placeholder="0"
                        value={betAmounts[e.id] ?? ''}
                        onChange={ev => onAmountChange(e.id, ev.target.value)}
                        className={`w-full appearance-none rounded border py-2 pl-2.5 pr-5 text-right text-xs font-semibold outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none placeholder:text-ink-4 ${
                          hasStake
                            ? 'border-gold/50 bg-gold/10 text-gold-hi focus:border-gold/70 focus:ring-1 focus:ring-gold/20'
                            : 'border-rim bg-surface-input text-ink focus:border-gold/40 focus:bg-surface-raised focus:ring-1 focus:ring-gold/15'
                        }`}
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-ink-4">₫</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Bet Slip Panel ─────────────────────────────────────────────
   Right panel: dynamic list of horses with entered amounts */
type Selection = { horse: HorseEntry; amount: number; payout: number };

function BetSlip({
  user, canBet, selectedRace, betHorses, selections, betTotal,
  betError, betLoading, onRemove, onClearAll, onSubmit,
}: {
  user: { role: string } | null;
  canBet: boolean;
  selectedRace: Race | null;
  betHorses: HorseEntry[];
  selections: Selection[];
  betTotal: number;
  betError: string;
  betLoading: boolean;
  onRemove: (id: number) => void;
  onClearAll: () => void;
  onSubmit: () => void;
}) {
  if (!user) return (
    <div className="overflow-hidden rounded-md border border-rim bg-surface-raised p-5">
      <p className="mb-4 text-sm text-ink-3">Sign in to place wagers on your favourite runners.</p>
      <Link to="/login"
        className="flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-on-gold transition-all active:scale-[0.98] hover:bg-gold-hi">
        <Ticket size={14} /> Sign In to Bet
      </Link>
    </div>
  );

  if (!canBet) return (
    <div className="rounded-md border border-rim bg-surface-raised p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-ink-4" strokeWidth={1.5} />
        <p className="text-sm text-ink-3">Betting is available for USER accounts only.</p>
      </div>
    </div>
  );

  if (!selectedRace) return (
    <div className="rounded-md border border-rim bg-surface-raised p-5">
      <p className="text-center text-sm text-ink-3">Select a race above to start betting.</p>
    </div>
  );

  if (NON_BETTABLE.has(selectedRace.status)) return (
    <div className="rounded-md border border-rim bg-surface-raised p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-ink-4" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-semibold text-ink-2">Betting Closed</p>
          <p className="mt-0.5 text-xs text-ink-4">This race is no longer accepting wagers.</p>
        </div>
      </div>
    </div>
  );

  if (betHorses.length === 0) return (
    <div className="rounded-md border border-rim bg-surface-raised p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-gold" strokeWidth={1.5} />
        <p className="text-sm text-ink-3">No confirmed entries yet. Odds will appear closer to post time.</p>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rim px-5 py-3.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-hi">Bet Slip</p>
          <p className="mt-0.5 text-xs text-ink-3">
            {selections.length === 0
              ? 'Enter a stake beside any runner'
              : `${selections.length} runner${selections.length !== 1 ? 's' : ''} selected`}
          </p>
        </div>
        {selections.length > 0 && (
          <button type="button" onClick={onClearAll}
            className="text-[10px] font-semibold uppercase tracking-wide text-ink-4 transition-colors hover:text-fail">
            Clear all
          </button>
        )}
      </div>

      {selections.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rim bg-surface-overlay">
            <Ticket size={18} className="text-ink-4" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-ink-3 leading-relaxed">
            Type a stake amount next to any runner on the left to add them here.
          </p>
        </div>
      ) : (
        <>
          {/* Selection cards */}
          <div className="divide-y divide-rim">
            {selections.map(({ horse, amount, payout }) => (
              <div key={horse.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-bold uppercase tracking-wide text-ink">
                      {horse.horseName}
                    </span>
                    <span className="shrink-0 tnum text-xs font-bold text-gold-hi">×{horse.odds}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="tnum text-ink-3">{fmtVnd(amount)}</span>
                    <span className="text-ink-4">→</span>
                    <span className="tnum font-semibold text-gold-hi">{fmtVnd(payout)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => onRemove(horse.id)}
                  className="mt-0.5 shrink-0 text-ink-4 transition-colors hover:text-fail">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-rim bg-surface-overlay/60 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-3">Total wagered</span>
              <span className="tnum font-bold text-ink">{fmtVnd(betTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-3">Max payout</span>
              <span className="tnum font-bold text-gold-hi">
                {fmtVnd(selections.reduce((s, s2) => s + s2.payout, 0))}
              </span>
            </div>

            {betError && (
              <div className="flex items-center gap-2 rounded bg-fail-subtle px-3 py-2 text-xs text-fail">
                <AlertCircle size={13} className="shrink-0" /> {betError}
              </div>
            )}

            <button
              type="button"
              onClick={onSubmit}
              disabled={betLoading || betTotal < 1000}
              className="flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-on-gold transition-all hover:bg-gold-hi active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-rim disabled:text-ink-4">
              <Ticket size={14} />
              {betLoading ? 'Processing…' : 'Confirm Bet'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────── */
export default function BetBoard({ embedded = false }: { embedded?: boolean }) {
  const { races, loading } = useRaces({ page: 0, size: 200 });
  const { user } = useAuth();
  const addToast = useToast();
  const [searchParams] = useSearchParams();
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* betAmounts: raceHorseId → raw input string */
  const [betAmounts, setBetAmounts] = useState<BetAmounts>({});
  const [betLoading, setBetLoading] = useState(false);
  const [betError, setBetError] = useState('');

  const canBet = user?.role === 'USER';
  const { balance, loading: balanceLoading } = useWalletBalance(!!canBet);
  const invalidateBalance = useInvalidateWalletBalance();

  /* Races still open for betting or on their way there — finished/cancelled/ongoing are excluded */
  const filteredRaces = useMemo(() =>
    [...races]
      .filter(r => !NON_BETTABLE.has(r.status))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [races]
  );

  const initialRaceId = useMemo(() => {
    const date = searchParams.get('date');
    if (date) {
      const match = filteredRaces.find(r => r.startTime?.slice(0, 10) === date);
      if (match) return match.id;
    }
    return filteredRaces[0]?.id ?? null;
  }, [filteredRaces, searchParams]);

  const effectiveId = selectedRaceId ?? initialRaceId;
  const selectedRace = filteredRaces.find(r => r.id === effectiveId) ?? races.find(r => r.id === effectiveId) ?? null;
  const bettable = !!selectedRace && !NON_BETTABLE.has(selectedRace.status);

  /* Reset bet amounts when race changes */
  useEffect(() => {
    setBetAmounts({});
    setBetError('');
  }, [effectiveId]);

  /* Horse list for bet slip display */
  const { entries: rawBetHorses } = useHorsesByRace(effectiveId ?? undefined);
  const betHorses = useMemo((): HorseEntry[] =>
    (assignLanes(
      rawBetHorses.filter(e => e.status?.toLowerCase() === 'approved' && e.odds != null) as Parameters<typeof assignLanes>[0]
    ) as HorseEntry[]),
    [rawBetHorses]
  );

  /* Selections: horses with a valid non-zero stake */
  const selections = useMemo((): Selection[] =>
    betHorses
      .filter(h => betAmounts[h.id] && parseInt(betAmounts[h.id]) >= 1000)
      .map(h => ({
        horse: h,
        amount: parseInt(betAmounts[h.id]),
        payout: parseInt(betAmounts[h.id]) * Number(h.odds),
      })),
    [betHorses, betAmounts]
  );

  const betTotal = selections.reduce((s, s2) => s + s2.amount, 0);

  const handleAmountChange = (id: number, value: string) => {
    setBetError('');
    setBetAmounts(prev => ({ ...prev, [id]: value }));
  };

  const handleRemove = (id: number) => {
    setBetAmounts(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const handleClearAll = () => { setBetAmounts({}); setBetError(''); };

  const handleSubmit = async () => {
    if (!selectedRace) return;
    if (selections.length === 0) { setBetError('Enter a stake for at least one runner.'); return; }
    try {
      setBetLoading(true); setBetError('');
      await placeBet({
        raceId: selectedRace.id,
        betItems: selections.map(s => ({ raceHorseId: s.horse.id, betAmount: s.amount })),
      });
      addToast('Bet placed successfully!', 'success');
      setBetAmounts({});
      invalidateBalance();
    } catch (e: unknown) {
      setBetError(getErrorMessage(e, 'Failed to place bet. Please try again.'));
    } finally {
      setBetLoading(false);
    }
  };

  const scrollBy = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });

  return (
    <FadeInStagger className="min-h-screen bg-surface">
      {/* ── Page header (hidden when embedded on the homepage) ────── */}
      {!embedded && (
        <FadeInItem className="border-b border-rim bg-surface-raised">
          <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
            <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold-hi">Royal Derby · 2026 Season</p>
                <h1 className="mt-0.5 font-serif text-2xl font-bold text-ink">Wagering Board</h1>
              </div>
              <span className="rounded bg-gold px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-on-gold">
                Upcoming
              </span>
            </div>
          </div>
        </FadeInItem>
      )}

      {/* ── Race selector strip ──────────────────────────────────── */}
      <FadeInItem className="border-b border-rim bg-surface-overlay/50 py-4">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          {loading ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[72px] w-52 shrink-0 animate-pulse rounded-md bg-rim" />
              ))}
            </div>
          ) : filteredRaces.length === 0 ? (
            <p className="py-3 text-sm text-ink-3">No races match this filter.</p>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => scrollBy(-1)}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-rim bg-surface-raised text-ink-3 shadow-card transition-all active:scale-90 hover:border-rim-hi hover:text-ink">
                <ChevronLeft size={15} />
              </button>
              <div ref={scrollRef} className="flex flex-1 gap-3 overflow-x-auto scroll-smooth" style={{ scrollbarWidth: 'none' }}>
                {filteredRaces.map(r => (
                  <RaceSelectorCard key={r.id} race={r}
                    selected={r.id === effectiveId}
                    onClick={() => setSelectedRaceId(r.id)} />
                ))}
              </div>
              <button onClick={() => scrollBy(1)}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-rim bg-surface-raised text-ink-3 shadow-card transition-all active:scale-90 hover:border-rim-hi hover:text-ink">
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </FadeInItem>

      {/* ── Main content ─────────────────────────────────────────── */}
      <FadeInItem className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        {!effectiveId ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-rim bg-surface-overlay">
              <Flag size={28} className="text-ink-4" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-ink-3">Select a race above to view runners and odds.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

            {/* LEFT: Odds board */}
            <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
              <OddsBoard
                raceId={effectiveId}
                betAmounts={betAmounts}
                onAmountChange={handleAmountChange}
                canBet={canBet}
                bettable={bettable}
                embedded={embedded}
              />
            </div>

            {/* RIGHT: Sticky panel */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">

              {/* Wallet balance */}
              {canBet && (
                <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
                  <div className="flex items-center justify-between border-b border-rim px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-4">Available Balance</p>
                    {!embedded && (
                      <Link to="/my-wallet"
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gold-hi transition-colors hover:text-gold">
                        <Wallet size={10} /> Deposit
                      </Link>
                    )}
                  </div>
                  <div className="px-5 py-4">
                    <p className="tnum text-2xl font-bold text-ink">
                      {balanceLoading ? <span className="text-ink-4">···</span> : fmtBalance(balance)}
                    </p>
                  </div>
                </div>
              )}

              {/* Race summary */}
              {selectedRace && (
                <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
                  <div className="border-b border-rim px-5 py-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ink-4">Selected Race</p>
                    <p className="font-serif text-lg font-bold leading-snug text-ink">{selectedRace.raceName}</p>
                  </div>
                  <div className="divide-y divide-rim">
                    <div className="flex items-center justify-between px-5 py-3 text-sm">
                      <span className="text-ink-3">Date</span>
                      <span className="tabular-nums font-medium text-ink">{fmtDate(selectedRace.startTime)}</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3 text-sm">
                      <span className="text-ink-3">Post Time</span>
                      <span className="tabular-nums font-medium text-ink">{fmtTime(selectedRace.startTime)}</span>
                    </div>
                    {selectedRace.location && (
                      <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                        <span className="shrink-0 text-ink-3">Location</span>
                        <span className="text-right font-medium text-ink">{selectedRace.location}</span>
                      </div>
                    )}
                    {selectedRace.totalprizepool != null && (
                      <div className="flex items-center justify-between px-5 py-3 text-sm">
                        <span className="text-ink-3">Prize Pool</span>
                        <span className="tabular-nums font-bold text-gold-hi">{fmtPrize(selectedRace.totalprizepool)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Bet slip */}
              <BetSlip
                user={user}
                canBet={canBet}
                selectedRace={selectedRace}
                betHorses={betHorses}
                selections={selections}
                betTotal={betTotal}
                betError={betError}
                betLoading={betLoading}
                onRemove={handleRemove}
                onClearAll={handleClearAll}
                onSubmit={handleSubmit}
              />

              {!embedded && (
                <Link to="/"
                  className="flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-ink-4 transition-colors hover:text-ink-2">
                  <ChevronLeft size={12} /> Back to Home
                </Link>
              )}
            </div>
          </div>
        )}
      </FadeInItem>
    </FadeInStagger>
  );
}
