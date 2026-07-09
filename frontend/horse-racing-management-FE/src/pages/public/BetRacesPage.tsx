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
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Seo from '@/components/seo/Seo';
import { assignLanes } from '@/utils/laneUtils';
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
  OPEN_REGISTRATION: 'bg-emerald-400',
  CLOSED_REGISTRATION: 'bg-gold',
  ONGOING: 'bg-red-400 animate-pulse',
  FINISHED: 'bg-on-blue/20',
  CANCELLED: 'bg-on-blue/15',
};

const STATUS_LABEL: Record<string, string> = {
  UPCOMING: 'Upcoming',
  OPEN_REGISTRATION: 'Open',
  CLOSED_REGISTRATION: 'Entries Closed',
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

type FilterKey = 'all' | 'open' | 'upcoming';
type BetAmounts = Record<number, string>; /* raceHorseId → raw input string */

/* ── Race Selector Card ────────────────────────────────────────── */
function RaceSelectorCard({ race, selected, onClick }: { race: Race; selected: boolean; onClick: () => void }) {
  const dot = STATUS_DOT[race.status] ?? 'bg-on-blue/20';
  return (
    <button type="button" onClick={onClick}
      className={`group relative shrink-0 w-52 overflow-hidden rounded-md border text-left transition-all duration-200 ${
        selected
          ? 'border-gold bg-gold/5 shadow-lg shadow-gold/10'
          : 'border-on-blue/15 bg-navy-deep/60 hover:border-on-blue/35 hover:bg-on-blue/5'
      }`}>
      <div className={`h-0.5 w-full ${!NON_BETTABLE.has(race.status) ? 'bg-gold' : 'bg-on-blue/15'}`} />
      <div className="p-3.5">
        <div className="mb-2 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${dot}`} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-on-blue/45">
            {STATUS_LABEL[race.status] ?? race.status}
          </span>
        </div>
        <p className="mb-2 line-clamp-2 text-sm font-bold leading-snug text-on-blue group-hover:text-gold transition-colors">
          {race.raceName}
        </p>
        <p className="text-[11px] tabular-nums text-on-blue/40">{fmtDate(race.startTime)}</p>
      </div>
    </button>
  );
}

/* ── Odds Board ─────────────────────────────────────────────────
   Left panel: race banner + meta + runners table with inline stake input */
type HorseEntry = RaceHorse & { laneNumber?: number };

function OddsBoard({
  raceId,
  betAmounts,
  onAmountChange,
  canBet,
  bettable,
}: {
  raceId: number;
  betAmounts: BetAmounts;
  onAmountChange: (id: number, value: string) => void;
  canBet: boolean;
  bettable: boolean;
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

  if (rl || el) return <div className="flex items-center justify-center py-32"><LoadingSpinner /></div>;
  if (!race) return null;

  return (
    <div className="flex flex-col">
      {/* Banner */}
      <div className="relative h-48 overflow-hidden">
        {race.bannerImageurl
          ? <img src={race.bannerImageurl} alt={race.raceName} className="h-full w-full object-cover opacity-60" />
          : <div className="h-full w-full bg-navy-deep" />}
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
      <div className="flex flex-wrap gap-5 border-b border-on-blue/10 bg-navy-deep/60 px-6 py-3">
        <span className="flex items-center gap-1.5 text-xs text-on-blue/50"><Clock size={11} /> {fmtTime(race.startTime)}</span>
        {race.distance && <span className="flex items-center gap-1.5 text-xs text-on-blue/50"><Flag size={11} /> {race.distance}</span>}
        {race.location && <span className="flex items-center gap-1.5 text-xs text-on-blue/50"><MapPin size={11} /> {race.location}</span>}
        {race.totalprizepool != null && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-gold/80">
            <Trophy size={11} /> {fmtPrize(race.totalprizepool)}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <Flag size={32} className="text-on-blue/15" strokeWidth={1.5} />
          <p className="text-sm text-on-blue/35">No confirmed entries with odds yet.</p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className={`grid gap-3 border-b border-on-blue/10 bg-navy-deep/40 px-6 py-3 ${showStake ? 'grid-cols-[2.5rem_2.5rem_1fr_4rem_7.5rem]' : 'grid-cols-[2.5rem_2.5rem_1fr_5rem]'}`}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-blue/30">#</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-blue/30">PP</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-on-blue/30">Runner</span>
            <span className="text-right text-[10px] font-bold uppercase tracking-widest text-on-blue/30">Odds</span>
            {showStake && <span className="text-right text-[10px] font-bold uppercase tracking-widest text-on-blue/30">Stake (₫)</span>}
          </div>

          {/* Runner rows */}
          <div className="divide-y divide-on-blue/[0.07]">
            {entries.map((e, idx) => {
              const laneStyle = LANE_STYLE[e.laneNumber ?? 0];
              const isFav = idx === 0;
              const hasStake = !!betAmounts[e.id] && parseInt(betAmounts[e.id]) > 0;

              return (
                <div key={e.id}
                  className={`grid gap-3 items-center px-6 py-4 transition-colors ${showStake ? 'grid-cols-[2.5rem_2.5rem_1fr_4rem_7.5rem]' : 'grid-cols-[2.5rem_2.5rem_1fr_5rem]'} ${hasStake ? 'bg-gold/[0.04]' : isFav ? 'bg-gold/[0.025]' : 'hover:bg-on-blue/[0.04]'}`}>

                  {/* Row number */}
                  <span className="tabular-nums text-sm font-medium text-on-blue/25">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Post position */}
                  <div className="flex h-8 w-8 items-center justify-center text-sm font-bold"
                    style={laneStyle
                      ? { backgroundColor: laneStyle.bg, color: laneStyle.color }
                      : { backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }}>
                    {e.laneNumber ?? '—'}
                  </div>

                  {/* Horse info */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold uppercase tracking-wide text-on-blue">{e.horseName}</p>
                      {isFav && (
                        <span className="shrink-0 rounded-full bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold">
                          Fav
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-on-blue/40">{e.jockeyName ?? 'Jockey TBA'}</p>
                  </div>

                  {/* Odds */}
                  <div className="text-right">
                    <span className="tnum text-xl font-bold text-gold leading-none">{e.odds}</span>
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
                        className={`w-full appearance-none rounded border py-2 pl-2.5 pr-5 text-right text-xs font-semibold outline-none transition-all [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none placeholder:text-on-blue/20 ${
                          hasStake
                            ? 'border-gold/50 bg-gold/10 text-gold focus:border-gold/70 focus:ring-1 focus:ring-gold/20'
                            : 'border-on-blue/15 bg-on-blue/[0.06] text-on-blue focus:border-gold/40 focus:bg-on-blue/10 focus:ring-1 focus:ring-gold/15'
                        }`}
                      />
                      <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-on-blue/30">₫</span>
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
    <div className="overflow-hidden rounded-md border border-on-blue/12 bg-navy-deep/40 p-5">
      <p className="mb-4 text-sm text-on-blue/45">Sign in to place wagers on your favourite runners.</p>
      <Link to="/login"
        className="flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-on-gold transition-colors hover:bg-gold-hi">
        <Ticket size={14} /> Sign In to Bet
      </Link>
    </div>
  );

  if (!canBet) return (
    <div className="rounded-md border border-on-blue/12 bg-navy-deep/40 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-on-blue/30" strokeWidth={1.5} />
        <p className="text-sm text-on-blue/45">Betting is available for USER accounts only.</p>
      </div>
    </div>
  );

  if (!selectedRace) return (
    <div className="rounded-md border border-on-blue/12 bg-navy-deep/40 p-5">
      <p className="text-center text-sm text-on-blue/35">Select a race above to start betting.</p>
    </div>
  );

  if (NON_BETTABLE.has(selectedRace.status)) return (
    <div className="rounded-md border border-on-blue/12 bg-navy-deep/40 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-on-blue/30" strokeWidth={1.5} />
        <div>
          <p className="text-sm font-semibold text-on-blue/55">Betting Closed</p>
          <p className="mt-0.5 text-xs text-on-blue/30">This race is no longer accepting wagers.</p>
        </div>
      </div>
    </div>
  );

  if (betHorses.length === 0) return (
    <div className="rounded-md border border-on-blue/12 bg-navy-deep/40 p-5">
      <div className="flex items-start gap-3">
        <AlertCircle size={15} className="mt-0.5 shrink-0 text-gold/35" strokeWidth={1.5} />
        <p className="text-sm text-on-blue/40">No confirmed entries yet. Odds will appear closer to post time.</p>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-md border border-on-blue/12 bg-navy-deep/40">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-on-blue/10 px-5 py-3.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/70">Bet Slip</p>
          <p className="mt-0.5 text-xs text-on-blue/40">
            {selections.length === 0
              ? 'Enter a stake beside any runner'
              : `${selections.length} runner${selections.length !== 1 ? 's' : ''} selected`}
          </p>
        </div>
        {selections.length > 0 && (
          <button type="button" onClick={onClearAll}
            className="text-[10px] font-semibold uppercase tracking-wide text-on-blue/30 transition-colors hover:text-red-400">
            Clear all
          </button>
        )}
      </div>

      {selections.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-on-blue/10 bg-on-blue/5">
            <Ticket size={18} className="text-on-blue/20" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-on-blue/30 leading-relaxed">
            Type a stake amount next to any runner on the left to add them here.
          </p>
        </div>
      ) : (
        <>
          {/* Selection cards */}
          <div className="divide-y divide-on-blue/[0.08]">
            {selections.map(({ horse, amount, payout }) => (
              <div key={horse.id} className="flex items-start gap-3 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="truncate text-sm font-bold uppercase tracking-wide text-on-blue">
                      {horse.horseName}
                    </span>
                    <span className="shrink-0 tnum text-xs font-bold text-gold">×{horse.odds}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="tnum text-on-blue/50">{fmtVnd(amount)}</span>
                    <span className="text-on-blue/25">→</span>
                    <span className="tnum font-semibold text-gold">{fmtVnd(payout)}</span>
                  </div>
                </div>
                <button type="button" onClick={() => onRemove(horse.id)}
                  className="mt-0.5 shrink-0 text-on-blue/20 transition-colors hover:text-red-400">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="border-t border-on-blue/10 bg-navy-deep/60 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-blue/40">Total wagered</span>
              <span className="tnum font-bold text-on-blue">{fmtVnd(betTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-on-blue/40">Max payout</span>
              <span className="tnum font-bold text-gold">
                {fmtVnd(selections.reduce((s, s2) => s + s2.payout, 0))}
              </span>
            </div>

            {betError && (
              <div className="flex items-center gap-2 rounded bg-red-500/10 px-3 py-2 text-xs text-red-400">
                <AlertCircle size={13} className="shrink-0" /> {betError}
              </div>
            )}

            <button
              type="button"
              onClick={onSubmit}
              disabled={betLoading || betTotal < 1000}
              className="flex w-full items-center justify-center gap-2 bg-gold py-3.5 text-xs font-bold uppercase tracking-widest text-on-gold transition-all hover:bg-gold-hi active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-on-blue/10 disabled:text-on-blue/20">
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
export default function BetRacesPage() {
  const { races, loading } = useRaces({ page: 0, size: 200 });
  const { user } = useAuth();
  const addToast = useToast();
  const [searchParams] = useSearchParams();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* betAmounts: raceHorseId → raw input string */
  const [betAmounts, setBetAmounts] = useState<BetAmounts>({});
  const [betLoading, setBetLoading] = useState(false);
  const [betError, setBetError] = useState('');

  const canBet = user?.role === 'USER';
  const { balance, loading: balanceLoading } = useWalletBalance(!!canBet);
  const invalidateBalance = useInvalidateWalletBalance();

  /* Sorted + filtered races */
  const sortedRaces = useMemo(() =>
    [...races]
      .filter(r => !NON_BETTABLE.has(r.status))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [races]
  );

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'All Races' },
    { key: 'open', label: 'Open for Betting' },
    { key: 'upcoming', label: 'Upcoming' },
  ];

  const filteredRaces = useMemo(() => {
    switch (filter) {
      case 'open': return sortedRaces.filter(r => r.status === 'OPEN_REGISTRATION' || r.status === 'CLOSED_REGISTRATION');
      case 'upcoming': return sortedRaces.filter(r => r.status === 'UPCOMING');
      default: return sortedRaces;
    }
  }, [sortedRaces, filter]);

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
      const err = e as { response?: { data?: { message?: string } } };
      setBetError(err?.response?.data?.message ?? 'Failed to place bet. Please try again.');
    } finally {
      setBetLoading(false);
    }
  };

  const handleFilterChange = (k: FilterKey) => { setFilter(k); setSelectedRaceId(null); };
  const scrollBy = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 240, behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-navy">
      <Seo title="Wagering Board" description="Browse races, study the odds, and place your wagers on Royal Derby." />

      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="border-b border-on-blue/12 bg-navy-deep">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-gold/55">Royal Derby · 2026 Season</p>
              <h1 className="mt-0.5 font-serif text-2xl font-bold text-on-blue">Wagering Board</h1>
            </div>
            <div className="flex items-center gap-1">
              {FILTERS.map(f => (
                <button key={f.key} type="button" onClick={() => handleFilterChange(f.key)}
                  className={`rounded px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                    filter === f.key ? 'bg-gold text-on-gold' : 'text-on-blue/45 hover:bg-on-blue/10 hover:text-on-blue'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Race selector strip ──────────────────────────────────── */}
      <div className="border-b border-on-blue/10 bg-navy-deep/50 py-4">
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6">
          {loading ? (
            <div className="flex gap-3 overflow-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-[72px] w-52 shrink-0 animate-pulse rounded-md bg-on-blue/8" />
              ))}
            </div>
          ) : filteredRaces.length === 0 ? (
            <p className="py-3 text-sm text-on-blue/35">No races match this filter.</p>
          ) : (
            <div className="flex items-center gap-3">
              <button onClick={() => scrollBy(-1)}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-on-blue/20 bg-navy-deep text-on-blue/50 shadow-lg transition-colors hover:border-on-blue/40 hover:text-on-blue">
                <ChevronLeft size={15} />
              </button>
              <div ref={scrollRef} className="flex flex-1 gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {filteredRaces.map(r => (
                  <RaceSelectorCard key={r.id} race={r}
                    selected={r.id === effectiveId}
                    onClick={() => setSelectedRaceId(r.id)} />
                ))}
              </div>
              <button onClick={() => scrollBy(1)}
                className="shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-on-blue/20 bg-navy-deep text-on-blue/50 shadow-lg transition-colors hover:border-on-blue/40 hover:text-on-blue">
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6">
        {!effectiveId ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-on-blue/15 bg-on-blue/5">
              <Flag size={28} className="text-on-blue/25" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-on-blue/40">Select a race above to view runners and odds.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">

            {/* LEFT: Odds board */}
            <div className="overflow-hidden rounded-md border border-on-blue/12 bg-navy-deep/40">
              <OddsBoard
                raceId={effectiveId}
                betAmounts={betAmounts}
                onAmountChange={handleAmountChange}
                canBet={canBet}
                bettable={bettable}
              />
            </div>

            {/* RIGHT: Sticky panel */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">

              {/* Wallet balance */}
              {canBet && (
                <div className="overflow-hidden rounded-md border border-on-blue/12 bg-navy-deep/40">
                  <div className="flex items-center justify-between border-b border-on-blue/10 px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-on-blue/35">Available Balance</p>
                    <Link to="/my-wallet"
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gold/70 transition-colors hover:text-gold">
                      <Wallet size={10} /> Deposit
                    </Link>
                  </div>
                  <div className="px-5 py-4">
                    <p className="tnum text-2xl font-bold text-on-blue">
                      {balanceLoading ? <span className="text-on-blue/30">···</span> : fmtBalance(balance)}
                    </p>
                  </div>
                </div>
              )}

              {/* Race summary */}
              {selectedRace && (
                <div className="overflow-hidden rounded-md border border-on-blue/12 bg-navy-deep/40">
                  <div className="border-b border-on-blue/10 px-5 py-4">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-on-blue/35">Selected Race</p>
                    <p className="font-serif text-lg font-bold leading-snug text-on-blue">{selectedRace.raceName}</p>
                  </div>
                  <div className="divide-y divide-on-blue/[0.08]">
                    <div className="flex items-center justify-between px-5 py-3 text-sm">
                      <span className="text-on-blue/45">Date</span>
                      <span className="tabular-nums font-medium text-on-blue">{fmtDate(selectedRace.startTime)}</span>
                    </div>
                    <div className="flex items-center justify-between px-5 py-3 text-sm">
                      <span className="text-on-blue/45">Post Time</span>
                      <span className="tabular-nums font-medium text-on-blue">{fmtTime(selectedRace.startTime)}</span>
                    </div>
                    {selectedRace.location && (
                      <div className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                        <span className="shrink-0 text-on-blue/45">Location</span>
                        <span className="text-right font-medium text-on-blue">{selectedRace.location}</span>
                      </div>
                    )}
                    {selectedRace.totalprizepool != null && (
                      <div className="flex items-center justify-between px-5 py-3 text-sm">
                        <span className="text-on-blue/45">Prize Pool</span>
                        <span className="tabular-nums font-bold text-gold">{fmtPrize(selectedRace.totalprizepool)}</span>
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

              <Link to="/bet"
                className="flex items-center justify-center gap-1.5 py-3 text-xs font-medium text-on-blue/35 transition-colors hover:text-on-blue/60">
                <ChevronLeft size={12} /> Back to Betting Hub
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
