import { useEffect, useState } from 'react';
import { acceptTrainingContract, rejectTrainingContract } from '@/api/trainingContractApi';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import type { TrainingContract } from '@/types';

interface Props {
  contract: TrainingContract | null;
  action: 'accept' | 'reject';
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const fmtVnd = (n?: number) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n)) : '—';

export default function RespondTrainingContractModal({ contract, action, onClose, onSuccess }: Props) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setNote('');
    setError(null);
  }, [contract, action]);

  if (!contract) return null;

  const isAccept = action === 'accept';

  const handleSubmit = async () => {
    setSubmitting(true); setError(null);
    try {
      if (isAccept) await acceptTrainingContract(contract.id, note.trim() || undefined);
      else await rejectTrainingContract(contract.id, note.trim() || undefined);
      onSuccess(isAccept ? 'Contract accepted.' : 'Contract declined.');
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, isAccept ? 'Failed to accept the contract.' : 'Failed to decline the contract.'));
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
        className={`px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
          isAccept ? 'bg-ok hover:bg-ok/90' : 'bg-fail hover:bg-fail/90'
        }`}
      >
        {submitting ? 'Submitting…' : isAccept ? 'Accept Contract' : 'Decline Contract'}
      </button>
    </div>
  );

  const header = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Training Contract</p>
      <h3 className="font-serif text-base font-bold text-ink">{isAccept ? 'Accept Request' : 'Decline Request'}</h3>
    </div>
  );

  return (
    <Modal open onClose={onClose} title={header} backdrop="navy" size="md" footer={footer}>
      <div className="mb-4 space-y-1.5 border border-rim bg-surface-overlay/40 px-4 py-3 text-sm">
        <div className="flex justify-between"><span className="text-ink-4">Horse</span><span className="font-semibold text-ink">{contract.horseName ?? `#${contract.horseId}`}</span></div>
        <div className="flex justify-between"><span className="text-ink-4">Owner</span><span className="text-ink-2">{contract.ownerName ?? `#${contract.ownerId}`}</span></div>
        <div className="flex justify-between"><span className="text-ink-4">Period</span><span className="tnum text-ink-2">{fmtDate(contract.startDate)} → {fmtDate(contract.endDate)}</span></div>
        <div className="flex justify-between"><span className="text-ink-4">Fee</span><span className="tnum font-semibold text-gold-hi">{fmtVnd(contract.fee)}</span></div>
        {contract.ownerNote && (
          <div className="pt-1 text-ink-3"><span className="text-ink-4">Note: </span>{contract.ownerNote}</div>
        )}
      </div>

      {isAccept && (
        <p className="mb-3 text-xs text-ink-4">
          Accepting escrows the fee from the owner's wallet and assigns you as this horse's trainer.
        </p>
      )}

      <label htmlFor="tc-note" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4">
        {isAccept ? 'Note to Owner (optional)' : 'Reason (optional)'}
      </label>
      <textarea
        id="tc-note"
        rows={3}
        className="w-full resize-none border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold"
        value={note}
        placeholder={isAccept ? 'Anything you want the owner to know…' : 'Let the owner know why…'}
        onChange={(e) => setNote(e.target.value)}
      />

      {error && <p className="mt-3 text-sm text-fail">{error}</p>}
    </Modal>
  );
}
