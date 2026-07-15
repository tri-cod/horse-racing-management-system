import { useEffect, useState } from 'react';
import { requestWithdrawal } from '@/api/raceHorseApi';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import type { RaceHorse } from '@/types';

interface Props {
  raceHorse: RaceHorse | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function WithdrawRaceHorseModal({ raceHorse, onClose, onSuccess }: Props) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (raceHorse) { setReason(''); setError(null); }
  }, [raceHorse]);

  if (!raceHorse) return null;

  const handleSubmit = async () => {
    if (!reason.trim()) { setError('Please provide a reason for withdrawing.'); return; }
    setSubmitting(true); setError(null);
    try {
      await requestWithdrawal({ raceHorseId: raceHorse.id, reason: reason.trim() });
      onSuccess('Withdrawal request sent.');
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to request withdrawal.'));
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
        disabled={submitting}
        className="bg-fail px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-fail/80 disabled:opacity-50"
      >
        {submitting ? 'Sending…' : 'Request Withdrawal'}
      </button>
    </div>
  );

  const header = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Withdraw</p>
      <h3 className="font-serif text-base font-bold text-ink">Request Withdrawal</h3>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={header} backdrop="navy" size="sm" footer={footer}>
      <p className="mb-4 text-sm text-ink-2">
        Withdraw <span className="font-semibold text-ink">{raceHorse.horseName ?? `Horse #${raceHorse.horseId}`}</span> from{' '}
        <span className="font-semibold text-ink">{raceHorse.raceName ?? `Race #${raceHorse.raceId}`}</span>?
      </p>
      <div className="mb-3 border border-warn/20 bg-warn-subtle px-3 py-2 text-xs text-warn">
        An admin must approve this before the horse is removed. Only 50% of the entry fee (if any) is refunded on approval.
      </div>
      <label htmlFor="withdraw-reason" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
        Reason <span className="text-fail">*</span>
      </label>
      <textarea
        id="withdraw-reason"
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="e.g. Horse is injured and cannot compete"
        className="w-full resize-none border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-4 focus:border-gold focus:ring-1 focus:ring-gold"
      />
      {error && <p className="mt-3 text-sm text-fail">{error}</p>}
    </Modal>
  );
}
