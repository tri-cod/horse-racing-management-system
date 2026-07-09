import { useEffect } from 'react';
import { X, Rabbit, Tag, Activity, Flag, ClipboardList } from 'lucide-react';
import type { HorseCurrentStatusResponse } from '@/types';

interface HorseDetailModalProps {
  horse: HorseCurrentStatusResponse | null;
  onClose: () => void;
}

export default function HorseDetailModal({ horse, onClose }: HorseDetailModalProps) {
  useEffect(() => {
    if (!horse) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [horse, onClose]);

  if (!horse) return null;

  const rows = [
    { icon: Tag, label: 'Horse ID', value: `#${horse.horseId}` },
    { icon: ClipboardList, label: 'Breed', value: horse.breed ?? '—' },
    { icon: Activity, label: 'Status', value: horse.status ?? '—' },
    { icon: Flag, label: 'Current Race', value: horse.currentRaceName ?? '—' },
    ...(horse.currentRaceStatus ? [{ icon: Flag, label: 'Race Status', value: horse.currentRaceStatus }] : []),
    ...(horse.registrationStatus ? [{ icon: ClipboardList, label: 'Registration', value: horse.registrationStatus }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}>
      <div className="relative w-full max-w-sm border border-rim bg-surface-raised shadow-2xl"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col items-center gap-3 border-b border-rim px-6 pt-6 pb-4">
          <button type="button" onClick={onClose} aria-label="Close"
            className="absolute right-4 top-4 p-1 text-ink-4 hover:text-ink hover:bg-surface-overlay transition-colors">
            <X size={18} />
          </button>
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-overlay text-ink-3">
            <Rabbit size={36} />
          </div>
          <h2 className="text-lg font-semibold text-ink">{horse.horseName}</h2>
        </div>
        <div className="flex flex-col divide-y divide-rim px-6 py-2">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center justify-between gap-4 py-3">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-ink-4" />
                <span className="text-sm text-ink-3">{label}</span>
              </div>
              <span className="text-sm font-medium text-ink">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}