import { Link } from 'react-router-dom';
import RaceHorseStatusBadge from './RaceHorseStatusBadge';
import { isAnyStatus, type RaceHorseStatusKey } from '@/utils/raceHorseStatus';
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
}: {
  registrations: RaceHorse[];
  onAssignJockey: (r: RaceHorse) => void;
  onWithdraw: (r: RaceHorse) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px]">
        <thead>
          <tr className="border-b border-rim bg-surface-overlay">
            {['Race', 'Horse', 'Jockey', 'Status', 'Registered', 'Actions'].map((h) => (
              <th
                key={h}
                className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.12em] text-ink-4"
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
                <td className="px-5 py-3.5 text-sm font-medium text-ink">{r.horseName ?? '—'}</td>
                <td className="px-5 py-3.5 text-sm text-ink-2">{r.jockeyName ?? '—'}</td>
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
                    {!canAssignJockey && !canWithdraw && (
                      <span className="text-xs text-ink-4">—</span>
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