import { Rabbit } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import type { TrainerHorse, TrainerRaceParticipation } from '@/types';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

interface Props {
  horse: TrainerHorse | null;
  upcoming: TrainerRaceParticipation[];
  onClose: () => void;
}

export default function TrainerHorseDetailModal({ horse, upcoming, onClose }: Props) {
  const header = horse && (
    <div className="flex items-center gap-3">
      {horse.avatarUrl ? (
        <img src={horse.avatarUrl} alt={horse.horseName} className="h-10 w-10 shrink-0 rounded-full object-cover" />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 text-navy"><Rabbit size={18} /></div>
      )}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Upcoming Races</p>
        <h3 className="font-serif text-base font-bold text-ink">{horse.horseName ?? `Horse #${horse.horseId}`}</h3>
      </div>
    </div>
  );

  return (
    <Modal open={!!horse} onClose={onClose} title={header} backdrop="navy" size="md">
      {horse && (
        upcoming.length > 0 ? (
          <div className="divide-y divide-rim">
            {upcoming.map((r) => (
              <div key={r.raceId} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{r.raceName ?? `Race #${r.raceId}`}</p>
                  <p className="text-[11px] text-ink-4">{fmtDate(r.startTime)}{r.location ? ` · ${r.location}` : ''}</p>
                </div>
                {r.registrationStatus && (
                  <span className="shrink-0 text-[11px] uppercase tracking-wide text-ink-4">{r.registrationStatus}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-ink-4">No upcoming races for this horse.</p>
        )
      )}
    </Modal>
  );
}
