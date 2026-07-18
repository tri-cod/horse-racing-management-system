import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { issuePenalty, getHorsesByRace } from '@/api/refereeApi';
import { getErrorMessage } from '@/utils/errors';
import Button from '@/components/ui/Button';
import type { PenaltyType, Race, RaceHorse } from '@/types';

const TYPES: { value: PenaltyType; label: string }[] = [
  { value: 'WARNING', label: 'Warning' },
  { value: 'FINE', label: 'Fine' },
  { value: 'TIME_PENALTY', label: 'Time Penalty' },
  { value: 'DISQUALIFY', label: 'Disqualify' },
];

export default function IssuePenaltyModal({
  race,
  onClose,
  onSuccess,
  onError,
}: {
  race: Race;
  onClose: () => void;
  onSuccess: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [horses, setHorses] = useState<RaceHorse[]>([]);
  const [horsesLoading, setHorsesLoading] = useState(true);
  const [raceHorseId, setRaceHorseId] = useState<number | ''>('');
  const [penaltyType, setPenaltyType] = useState<PenaltyType>('WARNING');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState('');
  const [seconds, setSeconds] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    getHorsesByRace(race.id)
      .then((list) => {
        if (!alive) return;
        // Only APPROVED entries are actually running — already-disqualified or
        // withdrawn horses can't be penalised again.
        setHorses((list ?? []).filter((rh) => rh.status === 'APPROVED'));
      })
      .catch(() => {
        if (alive) onError('Failed to load horses for this race.');
      })
      .finally(() => {
        if (alive) setHorsesLoading(false);
      });
    return () => { alive = false; };
  }, [race.id, onError]);

  const submit = async () => {
    if (raceHorseId === '' || !reason.trim()) return;
    setSaving(true);
    try {
      await issuePenalty({
        raceHorseId: Number(raceHorseId),
        reason: reason.trim(),
        penaltyType,
        amount: penaltyType === 'FINE' && amount ? Number(amount) : null,
        timePenaltySeconds:
          penaltyType === 'TIME_PENALTY' && seconds ? Number(seconds) : null,
      });
      onSuccess('Penalty issued.');
    } catch (e: unknown) {
      onError(getErrorMessage(e, 'Failed to issue penalty.'));
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full border border-rim bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-gold/50 disabled:opacity-50';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-rim bg-surface-raised"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-rim px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Race Control</p>
            <h2 className="font-serif text-lg font-bold text-ink">Issue Penalty</h2>
          </div>
          <button type="button" onClick={onClose} className="text-ink-4 transition-colors hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-xs text-ink-3">{race.raceName}</p>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-2">Horse</label>
            <select
              className={field}
              value={raceHorseId}
              disabled={horsesLoading}
              onChange={(e) => setRaceHorseId(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">{horsesLoading ? 'Loading…' : 'Select a horse…'}</option>
              {horses.map((rh) => (
                <option key={rh.id} value={rh.id}>
                  {rh.laneNumber != null ? `#${rh.laneNumber} — ` : ''}
                  {rh.horseName ?? `Entry ${rh.id}`}
                  {rh.jockeyName ? ` (${rh.jockeyName})` : ''}
                </option>
              ))}
            </select>
            {!horsesLoading && horses.length === 0 && (
              <p className="mt-1 text-xs text-ink-4">No approved horses in this race.</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-2">Penalty Type</label>
            <select
              className={field}
              value={penaltyType}
              onChange={(e) => setPenaltyType(e.target.value as PenaltyType)}
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            {penaltyType === 'DISQUALIFY' && (
              <p className="mt-1 text-xs text-fail">This removes the horse from the race.</p>
            )}
          </div>

          {penaltyType === 'FINE' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-2">Amount (VND)</label>
              <input
                type="number"
                min={0}
                className={field}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          )}

          {penaltyType === 'TIME_PENALTY' && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-2">Added Time (seconds)</label>
              <input
                type="number"
                min={0}
                step="0.1"
                className={field}
                value={seconds}
                onChange={(e) => setSeconds(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-2">Reason</label>
            <textarea
              rows={3}
              maxLength={255}
              className={field}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="mt-1 text-right text-[11px] text-ink-4 tnum">{reason.length}/255</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-rim px-5 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || raceHorseId === '' || !reason.trim()}>
            {saving ? 'Issuing…' : 'Issue Penalty'}
          </Button>
        </div>
      </div>
    </div>
  );
}