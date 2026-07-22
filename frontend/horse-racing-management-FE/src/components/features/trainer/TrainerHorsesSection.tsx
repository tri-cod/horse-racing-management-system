import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Gauge } from 'lucide-react';
import { getTrainerHorses } from '@/api/trainerApi';
import type { TrainerHorse } from '@/types';

const STATUS_CLS: Record<string, string> = {
  ACTIVE: 'bg-ok-subtle text-ok border-ok/30',
  RACING: 'bg-ok-subtle text-ok border-ok/30',
  FINISHED: 'bg-gold/10 text-gold border-gold/30',
  INACTIVE: 'bg-surface-overlay text-ink-3 border-rim',
  RETIRED: 'bg-warn-subtle text-warn border-warn/30',
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: 'Active', RACING: 'Racing', FINISHED: 'Finished', INACTIVE: 'Resting', RETIRED: 'Retired',
};

export default function TrainerHorsesSection({ trainerId }: { trainerId: number }) {
  const [horses, setHorses] = useState<TrainerHorse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true); setError(false);
    getTrainerHorses(trainerId)
      .then((h) => { if (alive) setHorses(h ?? []); })
      .catch(() => { if (alive) setError(true); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [trainerId]);

  if (loading) {
    return <div className="h-32 animate-pulse rounded-md border border-rim bg-surface-overlay" />;
  }
  if (error) return null;

  return (
    <div className="overflow-hidden rounded-md border border-rim bg-surface-raised">
      <div className="border-b border-rim px-5 py-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Horses in Training</p>
      </div>
      {horses.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-ink-3">No horses under your care yet.</p>
      ) : (
        <div className="grid grid-cols-1 divide-y divide-rim sm:grid-cols-2 sm:divide-x sm:[&>*:nth-child(2n)]:border-l">
          {horses.map((h) => {
            const initial = h.horseName?.charAt(0)?.toUpperCase() ?? '?';
            return (
              <Link
                key={h.horseId}
                to={`/horses/${h.horseId}`}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-overlay/40"
              >
                {h.avatarUrl ? (
                  <img src={h.avatarUrl} alt={h.horseName} className="h-10 w-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
                    {initial}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-sm font-bold text-ink">{h.horseName ?? `Horse #${h.horseId}`}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-ink-4">
                    {h.breed && <span>{h.breed}</span>}
                    {h.age != null && <span>Age {h.age}</span>}
                    {h.speedRating != null && <span className="flex items-center gap-0.5"><Gauge size={10} /> {h.speedRating}</span>}
                    {h.ownerName && <span>· {h.ownerName}</span>}
                  </p>
                </div>
                {h.status && (
                  <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLS[h.status] ?? 'bg-surface-overlay text-ink-3 border-rim'}`}>
                    {STATUS_LABEL[h.status] ?? h.status}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
