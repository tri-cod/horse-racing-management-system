import { Link } from 'react-router-dom';
import { Flag, Calendar, MapPin, Rabbit } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import type { RaceParticipation } from '@/types';

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const fmtMoney = (n?: number | null) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n) : null;

export default function MyRaceParticipationList({
  races,
  loading,
  error,
}: {
  races: RaceParticipation[];
  loading?: boolean;
  error?: string;
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 animate-pulse border border-rim bg-surface-overlay" />)}
      </div>
    );
  }

  if (error) return <p className="py-6 text-sm text-fail">{error}</p>;

  if (races.length === 0) {
    return <EmptyState icon={Flag} title="No races" subtitle="Nothing in this category yet." />;
  }

  return (
    <div className="flex flex-col gap-3">
      {races.map((r) => (
        <div
          key={`${r.raceId}-${r.horseId ?? ''}`}
          className="flex flex-wrap items-center gap-4 border border-rim bg-surface-raised px-5 py-4 transition-shadow hover:shadow-card"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-serif text-base font-bold text-ink">{r.raceName}</h3>
              {r.rank != null && (
                <span className="tnum inline-flex items-center border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs font-bold text-gold">
                  #{r.rank}
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-3">
              <span className="flex items-center gap-1"><Calendar size={11} />{fmtDate(r.startTime)}</span>
              {r.location && <span className="flex items-center gap-1"><MapPin size={11} />{r.location}</span>}
              {r.horseName && <span className="flex items-center gap-1"><Rabbit size={11} />{r.horseName}</span>}
            </div>
            {r.rewards != null && r.rewards > 0 && (
              <p className="tnum mt-1 text-xs font-semibold text-gold-hi">{fmtMoney(r.rewards)}</p>
            )}
          </div>
          <Link
            to={`/races/${r.raceId}`}
            className="border border-rim bg-surface-overlay px-3 py-1.5 text-xs font-semibold text-ink-2 transition-colors hover:border-rim-hi hover:text-ink"
          >
            View Race
          </Link>
        </div>
      ))}
    </div>
  );
}
