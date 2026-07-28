import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Landmark, CalendarRange } from 'lucide-react';
import { getRaceRevenue } from '@/api/adminApi';
import { getErrorMessage } from '@/utils/errors';
import { getRaceStatusLabel, getRaceStatusVariant } from '@/utils/raceStatus';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import DashboardPageHeader from '@/components/shared/DashboardPageHeader';
import type { RaceRevenue } from '@/types';

const fmt = (n?: number | null) =>
  n != null
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n)
    : '—';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Money in (green), money out (red), and results that flip color on sign — same
// convention as the summary cards and the table columns below.
const signCls = (n?: number | null) => (n != null && n < 0 ? 'text-fail' : 'text-ok');

const selectCls =
  'border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none focus:border-rim-hi transition-colors';

function TableSkeleton() {
  return (
    <div className="divide-y divide-rim border border-rim bg-surface-raised">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-5 py-3.5">
          <div className="h-3.5 w-40 animate-pulse rounded-full bg-surface-overlay" />
          <div className="ml-auto h-3.5 w-24 animate-pulse rounded-full bg-surface-overlay" />
        </div>
      ))}
    </div>
  );
}

// Money in isn't the same as money kept — betHandle (total staked) is shown for
// context, but netRevenue (what the house actually keeps after payouts/prizes) is
// the only figure that should ever be summed across races for a "total revenue".
export default function AdminRaceRevenuePage() {
  const [rows, setRows] = useState<RaceRevenue[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Raw text-input state (what the user is typing) vs. applied state (what was
  // last confirmed via the Apply/Clear buttons, and what actually drives the
  // fetch) — kept separate so the request only fires on an explicit action, not
  // on every keystroke, and so the fetch always reads fresh applied values
  // instead of a stale closure from before a state update.
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [appliedFrom, setAppliedFrom] = useState('');
  const [appliedTo, setAppliedTo] = useState('');
  // Bumped by the error banner's Retry button to re-run the effect without
  // otherwise changing what was actually requested.
  const [retryTick, setRetryTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    const from = appliedFrom ? new Date(`${appliedFrom}T00:00:00`).toISOString() : undefined;
    const to = appliedTo ? new Date(`${appliedTo}T23:59:59`).toISOString() : undefined;
    getRaceRevenue({ page: currentPage, size: 20, from, to })
      .then((data) => {
        if (!alive) return;
        setRows(data.content ?? []);
        setTotalPages(data.totalPages ?? 0);
      })
      .catch((e: unknown) => { if (alive) setError(getErrorMessage(e, 'Failed to load race revenue.')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [currentPage, appliedFrom, appliedTo, retryTick]);

  const applyDateFilter = () => {
    setCurrentPage(0);
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  };

  const clearDateFilter = () => {
    setFromDate(''); setToDate('');
    setCurrentPage(0);
    setAppliedFrom(''); setAppliedTo('');
  };

  const totals = rows.reduce(
    (acc, r) => ({
      entryFee: acc.entryFee + (r.entryFeeCollected ?? 0),
      margin: acc.margin + (r.betMargin ?? 0),
      prizePaid: acc.prizePaid + (r.prizePaid ?? 0),
      net: acc.net + (r.netRevenue ?? 0),
    }),
    { entryFee: 0, margin: 0, prizePaid: 0, net: 0 },
  );

  return (
    <div className="px-8 py-6">
      <DashboardPageHeader
        eyebrow="Admin"
        title="Race Revenue"
        subtitle="Financial breakdown per race — entry fees, betting margin and prizes paid"
      />

      {/* Date filter */}
      <div className="mb-5 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-3">
          From
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className={selectCls} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-ink-3">
          To
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className={selectCls} />
        </label>
        <button
          type="button"
          onClick={applyDateFilter}
          className="inline-flex items-center gap-1.5 bg-navy px-4 py-2 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi"
        >
          <CalendarRange size={14} /> Apply
        </button>
        {(fromDate || toDate) && (
          <button
            type="button"
            onClick={clearDateFilter}
            className="text-sm font-semibold text-ink-3 underline hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>

      {/* Totals for the current page — not the whole date range, since the backend
          only pages the raw rows and doesn't return a separate aggregate. */}
      {!loading && rows.length > 0 && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border border-rim bg-surface-raised px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4">Entry Fees (page)</p>
            <p className="tnum mt-1 text-lg font-bold text-ok">{fmt(totals.entryFee)}</p>
          </div>
          <div className="border border-rim bg-surface-raised px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4">Bet Margin (page)</p>
            <p className={`tnum mt-1 text-lg font-bold ${signCls(totals.margin)}`}>{fmt(totals.margin)}</p>
          </div>
          <div className="border border-rim bg-surface-raised px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4">Prizes Paid (page)</p>
            <p className="tnum mt-1 text-lg font-bold text-fail">{fmt(totals.prizePaid)}</p>
          </div>
          <div className="border border-gold/40 bg-gold/5 px-4 py-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gold-hi">Net Revenue (page)</p>
            <p className={`tnum mt-1 text-lg font-bold ${signCls(totals.net)}`}>{fmt(totals.net)}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-center justify-between border border-fail/20 bg-fail-subtle px-4 py-3 text-sm text-fail">
          <span>{error}</span>
          <button type="button" onClick={() => setRetryTick((t) => t + 1)} className="font-semibold underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <EmptyState icon={Landmark} title="No races in this range" subtitle="Try widening or clearing the date filter." />
      ) : (
        <>
          <div className="overflow-hidden border border-rim bg-surface-raised">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-rim bg-surface-overlay">
                    {['Race', 'Horses', 'Bets', 'Entry Fees', 'Bet Handle', 'Bet Payout', 'Prizes Paid', 'Margin', 'Net Revenue', 'Margin %'].map((h) => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-ink-4">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-rim">
                  {rows.map((r) => (
                    <tr key={r.raceId} className="transition-colors hover:bg-surface-overlay/40">
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/admin/races/${r.raceId}`}
                          className="text-sm font-semibold text-ink transition-colors hover:text-gold-hi hover:underline"
                        >
                          {r.raceName}
                        </Link>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant={getRaceStatusVariant(r.status)} size="sm">{getRaceStatusLabel(r.status)}</Badge>
                          <span className="text-[11px] text-ink-4">{fmtDate(r.startTime)}</span>
                        </div>
                      </td>
                      <td className="tnum px-4 py-3.5 text-sm text-ink-2">{r.totalHorses}</td>
                      <td className="tnum px-4 py-3.5 text-sm text-ink-2">{r.totalBets}</td>
                      {/* Money in: green. Money out: red. Bet Handle is gross volume, not
                          revenue (see the type comment on RaceRevenue), so it stays neutral. */}
                      <td className="tnum px-4 py-3.5 text-sm font-semibold text-ok">{fmt(r.entryFeeCollected)}</td>
                      <td className="tnum px-4 py-3.5 text-sm text-ink-3">{fmt(r.betHandle)}</td>
                      <td className="tnum px-4 py-3.5 text-sm font-semibold text-fail">{fmt(r.betPayout)}</td>
                      <td className="tnum px-4 py-3.5 text-sm font-semibold text-fail">{fmt(r.prizePaid)}</td>
                      <td className={`tnum px-4 py-3.5 text-sm font-semibold ${signCls(r.betMargin)}`}>{fmt(r.betMargin)}</td>
                      <td className={`tnum px-4 py-3.5 text-sm font-bold ${signCls(r.netRevenue)}`}>{fmt(r.netRevenue)}</td>
                      <td className="px-4 py-3.5">
                        {r.marginPercent != null && (
                          <span className={`text-xs font-semibold ${r.marginPercent >= 0 ? 'text-ok' : 'text-fail'}`}>
                            {r.marginPercent.toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-5 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
    </div>
  );
}
