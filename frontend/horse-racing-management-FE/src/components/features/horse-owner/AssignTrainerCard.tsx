import { useState } from 'react';
import { UserPlus, Pencil, X } from 'lucide-react';
import { assignTrainer } from '@/api/horseOwnerApi';
import { useTrainers } from '@/hooks/useTrainers';
import type { Horse } from '@/types';

interface AssignTrainerCardProps {
  horseId: number;
  currentTrainerId?: number;
  onAssigned?: (horse: Horse) => void;
}

export default function AssignTrainerCard({ horseId, currentTrainerId, onAssigned }: AssignTrainerCardProps) {
  const [editing, setEditing] = useState(!currentTrainerId);
  const [selectedId, setSelectedId] = useState<string>(currentTrainerId?.toString() ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { trainers, loading: loadingTrainers } = useTrainers();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) { setError('Please select a trainer'); return; }
    setLoading(true); setError('');
    try {
      const updated = await assignTrainer(horseId, Number(selectedId));
      setEditing(false);
      onAssigned?.(updated);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? 'Failed to assign trainer.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setError('');
    setSelectedId(currentTrainerId?.toString() ?? '');
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex w-full items-center justify-center gap-2 border border-rim px-4 py-2.5 text-sm font-medium text-ink-3 transition-colors hover:border-gold/50 hover:text-gold"
      >
        <Pencil size={14} />
        {currentTrainerId ? 'Change Trainer' : 'Assign Trainer'}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2">
        <select
          className="flex-1 border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-4 focus:border-gold transition-colors"
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setError(''); }}
          disabled={loading || loadingTrainers}
        >
          <option value="">
            {loadingTrainers ? 'Loading…' : '— Select a trainer —'}
          </option>
          {trainers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name ?? t.fullName ?? `Trainer #${t.id}`}
              {t.experienceYears != null ? ` (${t.experienceYears} yrs)` : ''}
            </option>
          ))}
        </select>

        {currentTrainerId && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex items-center justify-center border border-rim px-3 text-ink-3 transition-colors hover:border-rim-hi hover:text-ink"
            aria-label="Cancel"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {error && <p className="text-xs text-fail">{error}</p>}

      <button
        type="submit"
        disabled={loading || loadingTrainers || !selectedId}
        className="flex w-full items-center justify-center gap-2 bg-navy px-4 py-2.5 text-sm font-medium text-on-blue transition-colors hover:bg-navy-hi disabled:cursor-not-allowed disabled:opacity-50"
      >
        <UserPlus size={14} />
        {loading ? 'Assigning…' : 'Confirm Assignment'}
      </button>
    </form>
  );
}
