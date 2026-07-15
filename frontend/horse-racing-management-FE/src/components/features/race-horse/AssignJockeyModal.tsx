import { useEffect, useState } from 'react';
import { getAvailableJockeys } from '@/api/jockeyApi';
import { sendJockeyRequest } from '@/api/raceHorseApi';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import type { Jockey, RaceHorse } from '@/types';

interface Props {
  raceHorse: RaceHorse | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function AssignJockeyModal({ raceHorse, onClose, onSuccess }: Props) {
  const [jockeys, setJockeys] = useState<Jockey[]>([]);
  const [loadingJockeys, setLoadingJockeys] = useState(false);
  const [selectedJockey, setSelectedJockey] = useState<number | null>(null);
  const [revenuePercent, setRevenuePercent] = useState('10');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!raceHorse) return;
    setSelectedJockey(null);
    setRevenuePercent('10');
    setError(null);
    setLoadingJockeys(true);
    getAvailableJockeys(raceHorse.raceId)
      .then((list) => setJockeys(list ?? []))
      .catch(() => setError('Failed to load available jockeys.'))
      .finally(() => setLoadingJockeys(false));
  }, [raceHorse]);

  if (!raceHorse) return null;

  const handleSubmit = async () => {
    if (!selectedJockey) { setError('Please select a jockey.'); return; }
    const pct = Number(revenuePercent);
    if (revenuePercent === '' || isNaN(pct) || pct < 0 || pct > 100) {
      setError('Revenue share must be a number between 0 and 100.');
      return;
    }
    setSubmitting(true); setError(null);
    try {
      await sendJockeyRequest({ raceHorseId: raceHorse.id, jockeyId: selectedJockey, jockeyRevenuePercent: pct });
      onSuccess('Jockey request sent.');
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to send jockey request.'));
    } finally { setSubmitting(false); }
  };

  const footer = (
    <div className="flex justify-end gap-2.5">
      <button
        type="button"
        onClick={onClose}
        disabled={submitting}
        className="border border-rim-hi px-4 py-2 text-sm font-semibold text-ink-2 transition-colors hover:bg-surface-overlay disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || loadingJockeys}
        className="bg-navy px-4 py-2 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi disabled:opacity-50"
      >
        {submitting ? 'Sending…' : 'Send Request'}
      </button>
    </div>
  );

  const header = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Jockey Request</p>
      <h3 className="font-serif text-base font-bold text-ink">Assign a Jockey</h3>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={header} backdrop="navy" size="sm" footer={footer}>
      <p className="mb-4 text-sm text-ink-2">
        For <span className="font-semibold text-ink">{raceHorse.horseName ?? `Horse #${raceHorse.horseId}`}</span> in{' '}
        <span className="font-semibold text-ink">{raceHorse.raceName ?? `Race #${raceHorse.raceId}`}</span>
      </p>

      {loadingJockeys ? (
        <p className="py-6 text-center text-sm text-ink-3">Loading jockeys…</p>
      ) : jockeys.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-3">No jockeys available for this race.</p>
      ) : (
        <div className="mb-4 flex max-h-52 flex-col gap-2 overflow-y-auto">
          {jockeys.map((j) => (
            <label
              key={j.id}
              className={`flex cursor-pointer items-center gap-3 border px-3 py-2.5 transition-colors ${
                selectedJockey === j.id ? 'border-gold/40 bg-gold/5' : 'border-rim hover:border-rim-hi'
              }`}
            >
              <input
                type="radio"
                name="jockey"
                checked={selectedJockey === j.id}
                onChange={() => setSelectedJockey(j.id)}
                className="accent-gold"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink">{j.name}</p>
                <p className="text-xs text-ink-4">{j.experienceYear ?? 0} yr exp · Age {j.age ?? '—'}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      <label htmlFor="jockey-revenue" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
        Jockey Revenue Share (%)
      </label>
      <input
        id="jockey-revenue"
        type="number"
        min={0}
        max={100}
        value={revenuePercent}
        onChange={(e) => setRevenuePercent(e.target.value)}
        className="w-full border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
      />

      {error && <p className="mt-3 text-sm text-fail">{error}</p>}
    </Modal>
  );
}
