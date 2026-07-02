import { Link } from 'react-router-dom';
import RaceHorseStatusBadge from './RaceHorseStatusBadge';
import type { RaceHorse } from '@/types';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function MyRegistrationsTable({
  registrations,
}: {
  registrations: (RaceHorse & { raceName?: string; registerAt?: string })[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-rim bg-surface-overlay">
            {['Race', 'Horse', 'Jockey', 'Status', 'Registered'].map((h) => (
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
          {registrations.map((r) => (
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
