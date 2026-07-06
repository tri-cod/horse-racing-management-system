import { useEffect, useState } from 'react';
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

function BetCard({ bet }: { bet: BetResponse }) {
  const [open, setOpen] = useState(false);

  const totalPayout = bet.betItems.reduce((s, item) => s + (calcPayout(item) ?? 0), 0);
  const anyWon = bet.betItems.some((i) => i.resultStatus === 'WON');

  return (
    <div className="overflow-hidden border border-rim bg-surface-raised">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-overlay/50"
      >
        <div>
          <p className="font-serif font-bold text-ink">{bet.raceName ?? `Race #${bet.raceId}`}</p>
          <p className="mt-0.5 text-xs text-ink-3">{fmtDate(bet.createdAt)}</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="hidden text-right sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">Wagered</p>
            <p className="tnum text-sm font-bold text-ink">{fmtVnd(bet.totalAmount)}</p>
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
              <p className="tnum text-xs font-bold text-ink">{fmtVnd(bet.totalAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-ink-4">Max Payout</p>
              <p className={`tnum text-xs font-bold ${anyWon ? 'text-ok' : 'text-navy'}`}>{fmtVnd(totalPayout)}</p>
            </div>
          </div>

          {bet.betItems.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-3">No horse entries for this bet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px]">
                <thead className="border-y border-rim bg-surface-overlay">
                  <tr>
                    {['Horse', 'Odds', 'Bet Amount', 'Payout if Won', 'Result'].map((h) => (
                      <th key={h} className="px-5 py-2.5 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rim">
                  {bet.betItems.map((item) => {
                    const payout = calcPayout(item);
                    return (
                      <tr key={item.id} className="transition-colors hover:bg-surface-overlay/40">
                        <td className="px-5 py-3.5">
                          <span className="font-serif text-sm font-bold text-ink">{item.horseName ?? '—'}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="tnum text-sm font-bold text-gold">
                            {item.odds ? `×${Number(item.odds).toFixed(2)}` : '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="tnum text-sm text-ink-2">{fmtVnd(item.betAmount)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`tnum text-sm font-semibold ${item.resultStatus === 'WON' ? 'text-ok' : 'text-navy'}`}>
                            {fmtVnd(payout)}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <BetStatusBadge status={item.resultStatus} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-rim bg-surface-overlay">
                  <tr>
                    <td colSpan={2} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-4">
                      {bet.betItems.length} horse{bet.betItems.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-5 py-3">
                      <span className="tnum text-sm font-bold text-ink">{fmtVnd(bet.totalAmount)}</span>
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

  const sorted = [...bets].reverse();

  return (
    <div className="px-8 py-6">
      <Seo title="My Bets" description="Track all your Royal Derby bets and results." />
      <DashboardPageHeader
        eyebrow="Account"
        title="My Bets"
        subtitle={loading ? 'Loading…' : `${sorted.length} bet${sorted.length !== 1 ? 's' : ''} total`}
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
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No bets yet"
          subtitle="Place your first bet on an upcoming race to see your wagering history here."
          action={
            <Link
              to="/bet"
              className="mt-4 inline-flex items-center gap-2 bg-gold px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-gold transition-colors hover:bg-gold-hi"
            >
              <Ticket size={13} /> Go to Betting
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {sorted.map((bet) => <BetCard key={bet.id} bet={bet} />)}
        </div>
      )}
    </div>
  );
}
