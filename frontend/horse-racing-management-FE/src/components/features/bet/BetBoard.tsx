import { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Wallet } from 'lucide-react';
import { useRaces } from '@/hooks/useRaces';
import { useHorsesByRace } from '@/hooks/useHorsesByRace';
import { useAuth } from '@/context/AuthContext';
import { useWalletBalance, useInvalidateWalletBalance } from '@/hooks/useWalletBalance';
import { useToast } from '@/components/ui/ToastProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { placeBet, getMyBets } from '@/api/betApi';
import { FadeInStagger, FadeInItem } from '@/components/shared/FadeIn';
import { assignLanes } from '@/utils/laneUtils';
import { getErrorMessage } from '@/utils/errors';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import RaceSelectorCard from './RaceSelectorCard';
import OddsBoard from './OddsBoard';
import BetSlip from './BetSlip';
import FinalStandings from './FinalStandings';
import {
  MIN_BET, NO_VALUE, isBettable, isRunnerEntry, fmtDate, fmtTime, fmtVnd, fmtPrize, fmtBalance,
  type BetAmounts, type HorseEntry, type Selection,
} from './betHelpers';
import type { BetResponse } from '@/types';

/* ══════════════════════════════════════════════════════════════════
   BetBoard: the main betting page/section.

   Layout:      [ race selector strip ]
                [ OddsBoard | sticky side panel (wallet / summary / BetSlip) ]
                [ FinalStandings (only when the race is finished) ]

   This file owns all the STATE (selected race, stake inputs, submit)
   and passes it down; the visual pieces live in their own files.
   ══════════════════════════════════════════════════════════════════ */
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
  const [confirmOpen, setConfirmOpen] = useState(false);

  const canBet = user?.role === 'USER';
  const { balance, loading: balanceLoading } = useWalletBalance(!!canBet && !embedded);
  const invalidateBalance = useInvalidateWalletBalance();
  const queryClient = useQueryClient();

  /* The spectator's own bets, used to show what they've already wagered on the selected race */
  const { data: myBets } = useQuery<BetResponse[]>({
    queryKey: ['my-bets'],
    queryFn: getMyBets,
    enabled: !!canBet,
    staleTime: 30_000,
  });

  /* The strip lists only races actually taking wagers, soonest first. A race in
     any other status is still reachable by id through ?race=, which is how the
     finished-race standings below stay linkable. */
  const filteredRaces = useMemo(() =>
    races
      .filter(r => isBettable(r.status))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [races]
  );

  const initialRaceId = useMemo(() => {
    /* Deep link from the race list / race detail pages. Matched against the full race
       list rather than the filtered strip so an out-of-strip race still resolves;
       selectedRace below falls back to `races` for exactly this case. */
    const raceParam = Number(searchParams.get('race'));
    if (Number.isFinite(raceParam) && races.some(r => r.id === raceParam)) return raceParam;

    const date = searchParams.get('date');
    if (date) {
      const match = filteredRaces.find(r => r.startTime?.slice(0, 10) === date);
      if (match) return match.id;
    }
    return filteredRaces[0]?.id ?? null;
  }, [filteredRaces, races, searchParams]);

  const effectiveId = selectedRaceId ?? initialRaceId;
  const selectedRace = filteredRaces.find(r => r.id === effectiveId) ?? races.find(r => r.id === effectiveId) ?? null;
  const bettable = isBettable(selectedRace?.status);

  /* Reset bet amounts when race changes */
  useEffect(() => {
    setBetAmounts({});
    setBetError('');
    setConfirmOpen(false);
  }, [effectiveId]);

  /* Horse list for bet slip display */
  const { entries: rawBetHorses } = useHorsesByRace(effectiveId ?? undefined);
  const betHorses = useMemo((): HorseEntry[] =>
    (assignLanes(
      rawBetHorses.filter(isRunnerEntry) as Parameters<typeof assignLanes>[0]
    ) as HorseEntry[]),
    [rawBetHorses]
  );

  /* Selections: horses with a valid non-zero stake */
  const selections = useMemo((): Selection[] =>
    betHorses
      .filter(h => betAmounts[h.id] && parseInt(betAmounts[h.id]) >= MIN_BET)
      .map(h => ({
        horse: h,
        amount: parseInt(betAmounts[h.id]),
        payout: parseInt(betAmounts[h.id]) * Number(h.odds),
      })),
    [betHorses, betAmounts]
  );

  const betTotal = selections.reduce((s, s2) => s + s2.amount, 0);

  /* The spectator's existing bets on the currently-selected race, aggregated per horse */
  const myBetsOnRace = useMemo(() => {
    if (!effectiveId || !myBets) return [] as { raceHorseId: number; horseName: string; amount: number; status: string }[];
    const map = new Map<number, { raceHorseId: number; horseName: string; amount: number; statuses: string[] }>();
    for (const bet of myBets) {
      if (bet.raceId !== effectiveId) continue;
      for (const item of bet.betItems ?? []) {
        const cur = map.get(item.raceHorseId) ?? { raceHorseId: item.raceHorseId, horseName: item.horseName ?? NO_VALUE, amount: 0, statuses: [] };
        cur.amount += item.betAmount;
        cur.statuses.push(item.resultStatus);
        map.set(item.raceHorseId, cur);
      }
    }
    return Array.from(map.values()).map(v => ({
      raceHorseId: v.raceHorseId,
      horseName: v.horseName,
      amount: v.amount,
      status: v.statuses.includes('PENDING') ? 'PENDING'
        : v.statuses.includes('WON') ? 'WON'
        : v.statuses.includes('LOST') ? 'LOST'
        : v.statuses[0] ?? 'PENDING',
    }));
  }, [myBets, effectiveId]);

  const myBetByHorse = useMemo(() => {
    const m: Record<number, { amount: number; status: string }> = {};
    for (const b of myBetsOnRace) m[b.raceHorseId] = { amount: b.amount, status: b.status };
    return m;
  }, [myBetsOnRace]);

  const myBetTotalOnRace = myBetsOnRace.reduce((s, b) => s + b.amount, 0);

  const handleAmountChange = (id: number, value: string) => {
    setBetError('');
    setBetAmounts(prev => ({ ...prev, [id]: value }));
  };

  const handleRemove = (id: number) => {
    setBetAmounts(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const handleClearAll = () => { setBetAmounts({}); setBetError(''); };

  const maxPayout = selections.reduce((s, s2) => s + s2.payout, 0);

  /* Small-screen affordance only, and never on the embedded homepage board,
     which does not own the viewport. */
  const showMobileBar = !embedded && canBet && bettable && selections.length > 0;

  /* Wallet cover check. The balance query only runs on the standalone page, so an
     embedded board leaves `balance` null and defers the check to the backend. */
  const insufficientFunds = balance != null && betTotal > balance;

  /* Everything that would make the wager invalid is caught here, before the
     confirm dialog opens, so the dialog only ever asks about a bet that can
     actually be placed. */
  const requestConfirm = () => {
    if (selections.length === 0) { setBetError('Enter a stake for at least one runner.'); return; }
    if (insufficientFunds) { setBetError('This stake is more than your wallet balance.'); return; }
    setBetError('');
    setConfirmOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedRace) return;
    if (selections.length === 0 || insufficientFunds) { setConfirmOpen(false); return; }
    try {
      setBetLoading(true); setBetError('');
      await placeBet({
        raceId: selectedRace.id,
        betItems: selections.map(s => ({ raceHorseId: s.horse.id, betAmount: s.amount })),
      });
      addToast('Bet placed successfully!', 'success');
      setBetAmounts({});
      invalidateBalance();
      queryClient.invalidateQueries({ queryKey: ['my-bets'] });
    } catch (e: unknown) {
      setBetError(getErrorMessage(e, 'Failed to place bet. Please try again.'));
    } finally {
      /* Always drop the dialog: on failure the message belongs in the bet slip,
         which sits behind it. */
      setBetLoading(false);
      setConfirmOpen(false);
    }
  };

  /* One card (14rem) plus the 0.75rem gap, so a click lands cleanly on the next card. */
  const scrollBy = (dir: number) => scrollRef.current?.scrollBy({ left: dir * 236, behavior: 'smooth' });

  return (
    <FadeInStagger className={`min-h-screen bg-surface ${showMobileBar ? 'pb-24 lg:pb-0' : ''}`}>
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
                <div key={i} className="h-[148px] w-56 shrink-0 animate-pulse rounded-md bg-rim" />
              ))}
            </div>
          ) : filteredRaces.length === 0 ? (
            <p className="py-3 text-sm text-ink-3">No races are open for betting right now.</p>
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
                userBets={myBetByHorse}
              />
            </div>

            {/* RIGHT: Sticky panel */}
            {/* Sticky offset = fixed header height (109px) + 1rem breathing room,
                so the panel pins the moment it meets the header instead of sliding under it. */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-[125px] lg:self-start">

              {/* Wallet balance, shown on the standalone /bet/races page, hidden when embedded on the homepage */}
              {canBet && !embedded && (
                <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
                  <div className="flex items-center justify-between border-b border-rim px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-4">Available Balance</p>
                    <Link to="/my-wallet"
                      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-gold-hi transition-colors hover:text-gold">
                      <Wallet size={10} /> Deposit
                    </Link>
                  </div>
                  <div className="px-5 py-4">
                    <p className="tnum text-2xl font-bold text-ink">
                      {balanceLoading ? <span className="text-ink-4">···</span> : fmtBalance(balance)}
                    </p>
                  </div>
                </div>
              )}

              {/* Race summary, hidden when embedded (the homepage detail panel already shows this) */}
              {selectedRace && !embedded && (
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

              {/* Your existing bets on this race */}
              {canBet && myBetsOnRace.length > 0 && (
                <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
                  <div className="border-b border-rim px-5 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-ink-4">Your Bets on This Race</p>
                  </div>
                  <ul className="divide-y divide-rim">
                    {myBetsOnRace.map(b => (
                      <li key={b.raceHorseId} className="flex items-center justify-between gap-3 px-5 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-ink">{b.horseName}</p>
                        </div>
                        <span className="tnum shrink-0 text-sm font-bold text-ink">{fmtVnd(b.amount)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between border-t border-rim bg-surface-overlay/60 px-5 py-3">
                    <span className="text-xs text-ink-3">Total staked</span>
                    <span className="tnum text-sm font-bold text-gold-hi">{fmtVnd(myBetTotalOnRace)}</span>
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
                maxPayout={maxPayout}
                insufficientFunds={insufficientFunds}
                betError={betError}
                betLoading={betLoading}
                onRemove={handleRemove}
                onClearAll={handleClearAll}
                onSubmit={requestConfirm}
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

      {/* ── Final standings ──────────────────────────────────────
          Own full-width section BELOW the betting grid, kept outside it so the
          sticky bet-slip column stops at the end of the runners list instead of
          following down over (and covering) the standings table. */}
      {effectiveId != null && selectedRace?.status === 'FINISHED' && (
        <FadeInItem className="mx-auto max-w-screen-xl px-4 pb-8 sm:px-6">
          <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
            <FinalStandings raceId={effectiveId} entries={betHorses} />
          </div>
        </FadeInItem>
      )}

      {/* Mobile stake bar. The slip drops below the runners on small screens, so
          without this the punter has to scroll past every runner to reach the
          total and the confirm button. */}
      {showMobileBar && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rim bg-surface-raised/95 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.10)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-screen-xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-ink-4">
                {selections.length} runner{selections.length !== 1 ? 's' : ''} · max {fmtVnd(maxPayout)}
              </p>
              <p className="tnum truncate text-sm font-bold text-ink">{fmtVnd(betTotal)}</p>
            </div>
            <button
              type="button"
              onClick={requestConfirm}
              disabled={betLoading || betTotal < MIN_BET || insufficientFunds}
              className="shrink-0 bg-gold px-5 py-3 text-xs font-bold uppercase tracking-widest text-on-gold transition-all hover:bg-gold-hi active:scale-[0.98] disabled:bg-rim disabled:text-ink-4"
            >
              {betLoading ? 'Processing' : insufficientFunds ? 'Low Balance' : 'Review Bet'}
            </button>
          </div>
        </div>
      )}

      {/* Placing a wager moves real money out of the wallet and cannot be undone,
          so it gets the same confirmation gate as the admin race actions. */}
      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleSubmit}
        loading={betLoading}
        variant="primary"
        title="Place this bet?"
        confirmLabel="Place Bet"
        message={selectedRace
          ? `Staking ${fmtVnd(betTotal)} on ${selections.length} runner${selections.length !== 1 ? 's' : ''} in ${selectedRace.raceName}, for a maximum return of ${fmtVnd(maxPayout)}. The stake leaves your wallet immediately and a placed bet cannot be cancelled.`
          : undefined}
      />
    </FadeInStagger>
  );
}
