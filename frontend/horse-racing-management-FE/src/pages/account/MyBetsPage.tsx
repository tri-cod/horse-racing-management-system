import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ChevronDown, ChevronUp } from 'lucide-react';
import { getMyBets } from '@/api/betApi';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import Seo from '@/components/seo/Seo';
import type { BetResponse, BetItemResponse } from '@/types';

const fmtVnd = (n?: number | null) =>
  n != null && n !== 0
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime()) || d.getFullYear() < 2000) return '—';
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const calcPayout = (item: BetItemResponse): number | null => {
  if (item.payout != null && item.payout > 0) return item.payout;
  if (item.betAmount && item.odds) return item.betAmount * item.odds;
  return null;
};

/* ── Aggregation ────────────────────────────────────────────────
   Repeat wagers are merged for display: one card per race, and within
   a race one row per horse — summing stake and payout across placements.
   The underlying bet records are left untouched. */
type AggHorse = {
  raceHorseId: number;
  horseName: string;
  amount: number;
  payout: number;
  odds: number | null; // uniform odds across placements, null if they differ
  resultStatus: string;
};

type RaceGroup = {
  raceId: number;
  raceName?: string;
  latestAt: string;
  totalAmount: number;
  horses: AggHorse[];
};

function combineStatus(a: string, b: string): string {
  if (a === 'PENDING' || b === 'PENDING') return 'PENDING';
  if (a === 'WON' || b === 'WON') return 'WON';
  if (a === 'LOST' || b === 'LOST') return 'LOST';
  return a || b;
}

function groupByRace(bets: BetResponse[]): RaceGroup[] {
  const races = new Map<number, {
    raceId: number; raceName?: string; latestAt: string;
    horses: Map<number, AggHorse & { oddsSet: Set<number> }>;
  }>();

  for (const bet of bets) {
    let g = races.get(bet.raceId);
    if (!g) {
      g = { raceId: bet.raceId, raceName: bet.raceName, latestAt: bet.createdAt, horses: new Map() };
      races.set(bet.raceId, g);
    }
    if (bet.createdAt > g.latestAt) g.latestAt = bet.createdAt;

    for (const item of bet.betItems ?? []) {
      let h = g.horses.get(item.raceHorseId);
      if (!h) {
        h = { raceHorseId: item.raceHorseId, horseName: item.horseName ?? '—', amount: 0, payout: 0, odds: null, resultStatus: item.resultStatus, oddsSet: new Set() };
        g.horses.set(item.raceHorseId, h);
      }
      h.amount += item.betAmount;
      h.payout += calcPayout(item) ?? 0;
      h.resultStatus = combineStatus(h.resultStatus, item.resultStatus);
      if (item.odds != null) h.oddsSet.add(Number(item.odds));
    }
  }

  return Array.from(races.values())
    .map((g) => {
      const horses: AggHorse[] = Array.from(g.horses.values()).map((h) => ({
        raceHorseId: h.raceHorseId,
        horseName: h.horseName,
        amount: h.amount,
        payout: h.payout,
        odds: h.oddsSet.size === 1 ? [...h.oddsSet][0] : null,
        resultStatus: h.resultStatus,
      }));
      return {
        raceId: g.raceId,
        raceName: g.raceName,
        latestAt: g.latestAt,
        totalAmount: horses.reduce((s, h) => s + h.amount, 0),
        horses,
      };
    })
    .sort((a, b) => (a.latestAt < b.latestAt ? 1 : a.latestAt > b.latestAt ? -1 : 0));
}

const ITEM_STATUS: Record<string, { label: string; cls: string }> = {
  PENDING:   { label: 'Pending',   cls: 'bg-warn-subtle text-warn border border-warn/30' },
  WON:       { label: 'Won',       cls: 'bg-ok-subtle text-ok border border-ok/30' },
  LOST:      { label: 'Lost',      cls: 'bg-fail-subtle text-fail border border-fail/30' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-surface-overlay text-ink-3 border border-rim' },
};

function BetStatusBadge({ status }: { status: string }) {
  const cfg = ITEM_STATUS[status] ?? { label: status, cls: 'bg-surface-overlay text-ink-3 border border-rim' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function BetCardSkeleton() {
  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded-full bg-surface-overlay" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-surface-overlay" />
        </div>
        <div className="flex gap-8">
          <div className="space-y-1.5 text-right">
            <div className="h-2.5 w-20 animate-pulse rounded-full bg-surface-overlay" />
            <div className="h-4 w-24 animate-pulse rounded-full bg-surface-overlay" />
          </div>
          <div className="h-7 w-7 animate-pulse bg-surface-overlay" />
        </div>
      </div>
    </div>
  );
}

function RaceGroupCard({ group }: { group: RaceGroup }) {
  const [open, setOpen] = useState(false);

  const totalPayout = group.horses.reduce((s, h) => s + h.payout, 0);
  const anyWon = group.horses.some((h) => h.resultStatus === 'WON');

  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-overlay/50"
      >
        <div>
          <p className="font-serif font-bold text-ink">{group.raceName ?? `Race #${group.raceId}`}</p>
          <p className="mt-0.5 text-xs text-ink-3">{fmtDate(group.latestAt)}</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Wagered</p>
            <p className="tnum text-sm font-bold text-ink">{fmtVnd(group.totalAmount)}</p>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Max Payout</p>
            <p className={`tnum text-sm font-bold ${anyWon ? 'text-ok' : 'text-navy'}`}>
              {fmtVnd(totalPayout)}
            </p>
          </div>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-surface-overlay text-ink-3">
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {/* Expanded */}
      {open && (
        <>
          {/* Mobile totals */}
          <div className="flex gap-6 border-y border-rim bg-surface-overlay/50 px-5 py-2 sm:hidden">
            <div>
              <p className="text-[10px] text-ink-4">Wagered</p>
              <p className="tnum text-xs font-bold text-ink">{fmtVnd(group.totalAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-ink-4">Max Payout</p>
              <p className={`tnum text-xs font-bold ${anyWon ? 'text-ok' : 'text-navy'}`}>{fmtVnd(totalPayout)}</p>
            </div>
          </div>

          {group.horses.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-3">No horse entries for this race.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px]">
                <thead className="border-y border-rim bg-surface-overlay">
                  <tr>
                    {['Horse', 'Odds', 'Total Bet', 'Payout if Won', 'Result'].map((h) => (
                      <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rim">
                  {group.horses.map((h) => {
                    const shownOdds = h.odds != null ? h.odds : (h.amount > 0 ? h.payout / h.amount : null);
                    return (
                      <tr key={h.raceHorseId} className="transition-colors hover:bg-surface-overlay/40">
                        <td className="px-5 py-3.5">
                          <span className="font-serif text-sm font-bold text-ink">{h.horseName}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="tnum text-sm font-bold text-gold">
                            {shownOdds != null ? `×${shownOdds.toFixed(2)}` : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="tnum text-sm text-ink-2">{fmtVnd(h.amount)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`tnum text-sm font-semibold ${h.resultStatus === 'WON' ? 'text-ok' : 'text-navy'}`}>
                            {fmtVnd(h.payout)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <BetStatusBadge status={h.resultStatus} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-rim bg-surface-overlay">
                  <tr>
                    <td colSpan={2} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-4">
                      {group.horses.length} horse{group.horses.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3">
                      <span className="tnum text-sm font-bold text-ink">{fmtVnd(group.totalAmount)}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`tnum text-sm font-bold ${anyWon ? 'text-ok' : 'text-ink-2'}`}>
                        {fmtVnd(totalPayout)}
                      </span>
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function MyBetsPage() {
  const [bets, setBets] = useState<BetResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyBets()
      .then((data) => setBets(data ?? []))
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        setError(err.response?.data?.message ?? 'Unable to load bets.');
      })
      .finally(() => setLoading(false));
  }, []);

  const groups = useMemo(() => groupByRace(bets), [bets]);

  return (
    <div className="px-8 py-6">
      <Seo title="My Bets" description="Track all your Royal Derby bets and results." />
      <DashboardPageHeader
        eyebrow="Account"
        title="My Bets"
        subtitle={loading ? 'Loading…' : `${groups.length} race${groups.length !== 1 ? 's' : ''} with bets`}
      />

      {error && (
        <div className="mb-6 border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => <BetCardSkeleton key={i} />)}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No bets yet"
          subtitle="Place your first bet on an upcoming race to see your wagering history here."
          action={
            <Link
              to="/bet/races"
              className="mt-4 inline-flex items-center gap-2 bg-gold px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-gold transition-colors hover:bg-gold-hi"
            >
              <Ticket size={13} /> Go to Betting
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map((g) => <RaceGroupCard key={g.raceId} group={g} />)}
        </div>
      )}
    </div>
  );
}
