import { Link } from 'react-router-dom';
import { Rabbit, Flag, Trophy } from 'lucide-react';
import RaceHorseStatusBadge from './RaceHorseStatusBadge';
import { isStatus, isAnyStatus, type RaceHorseStatusKey } from '@/utils/raceHorseStatus';
import type { RaceHorse } from '@/types';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

const JOCKEY_ACTIONABLE: RaceHorseStatusKey[] = ['PENDING_JOCKEY', 'JOCKEY_REJECTED'];
const WITHDRAWABLE: RaceHorseStatusKey[] = ['PENDING_JOCKEY', 'JOCKEY_REJECTED', 'PENDING_ADMIN', 'APPROVED'];

export default function MyRegistrationsTable({
  registrations,
  onAssignJockey,
  onWithdraw,
  actionLabel = 'Actions',
}: {
  registrations: RaceHorse[];
  onAssignJockey: (r: RaceHorse) => void;
  onWithdraw: (r: RaceHorse) => void;
  // Header for the last column — varies by tab (e.g. "Reason" for withdrawals).
  actionLabel?: string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[820px]">
        <thead>
          <tr className="border-b border-rim bg-surface-overlay">
            {['Race', 'Horse', 'Jockey', 'Commission', 'Status', 'Registered', actionLabel].map((h) => (
              <th
                key={h}
                className={`py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4 ${h === 'Commission' ? 'w-px whitespace-nowrap pr-5 pl-0' : 'px-5'}`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-rim">
          {registrations.map((r) => {
            const canAssignJockey = isAnyStatus(r.status, JOCKEY_ACTIONABLE);
            const canWithdraw = isAnyStatus(r.status, WITHDRAWABLE);
            const isFinished = isStatus(r.status, 'FINISHED');
            const isWithdrawPending = isStatus(r.status, 'WITHDRAW_PENDING');
            return (
              <tr key={r.id} className="transition-colors hover:bg-surface-overlay/40">
                <td className="px-5 py-3.5">
                  <Link
                    to={`/races/${r.raceId}`}
                    className="text-sm font-semibold text-gold transition-colors hover:text-gold-hi"
                  >
                    {r.raceName ?? '—'}
                  </Link>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-ink">{r.horseName ?? '—'}</span>
                    <Link
                      to={`/horses/${r.horseId}`}
                      title="View horse profile and race record"
                      className="inline-flex shrink-0 items-center gap-1 border border-rim-hi px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-ink-3 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                    >
                      <Rabbit size={10} /> View
                    </Link>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {r.jockeyId != null ? (
                    <Link
                      to={`/jockeys/${r.jockeyId}`}
                      title="View jockey profile and record"
                      className="inline-flex items-center gap-1.5 border border-rim-hi px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                    >
                      <Flag size={12} className="shrink-0 text-ink-4" />
                      {r.jockeyName ?? `Jockey #${r.jockeyId}`}
                    </Link>
                  ) : (
                    <span className="text-sm text-ink-2">—</span>
                  )}
                </td>
                <td className="tnum w-px whitespace-nowrap py-3.5 pl-0 pr-5 text-left text-sm text-ink-2">
                  {r.jockeyRevenuePercent != null ? `${r.jockeyRevenuePercent}%` : '—'}
                </td>
                <td className="px-5 py-3.5">
                  <RaceHorseStatusBadge status={r.status} />
                </td>
                <td className="tnum px-5 py-3.5 text-sm text-ink-3">{formatDate(r.registerAt)}</td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-2">
                    {canAssignJockey && (
                      <button
                        type="button"
                        onClick={() => onAssignJockey(r)}
                        className="whitespace-nowrap border border-rim-hi px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-gold hover:text-gold"
                      >
                        {r.jockeyId ? 'Reassign Jockey' : 'Assign Jockey'}
                      </button>
                    )}
                    {canWithdraw && (
                      <button
                        type="button"
                        onClick={() => onWithdraw(r)}
                        className="whitespace-nowrap border border-fail/30 px-2.5 py-1.5 text-xs font-semibold text-fail transition-colors hover:bg-fail-subtle"
                      >
                        Withdraw Horse
                      </button>
                    )}
                    {isFinished && (
                      <Link
                        to={`/races/${r.raceId}`}
                        title="View race result"
                        className="inline-flex items-center gap-1.5 whitespace-nowrap border border-rim-hi px-2.5 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-gold/40 hover:bg-surface-overlay hover:text-gold-hi"
                      >
                        <Trophy size={12} className="shrink-0 text-ink-4" /> View Result
                      </Link>
                    )}
                    {/* Withdrawal is awaiting admin — no action left, so show the
                        reason the owner submitted instead of an empty cell. */}
                    {isWithdrawPending && (
                      <span className="text-xs text-ink-3">
                        {r.withdrawReason || <span className="italic text-ink-4">No reason given</span>}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}