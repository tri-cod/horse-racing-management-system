import { useEffect, useState } from 'react';
import { getMyHorses } from '@/api/horseOwnerApi';
import { sendTrainingContract } from '@/api/trainingContractApi';
import { getErrorMessage } from '@/utils/errors';
import Modal from '@/components/ui/Modal';
import type { Horse, Trainer } from '@/types';

interface Props {
  // The trainer chosen from the browse cards; the modal is open while non-null.
  trainer: Trainer | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

const inputCls =
  'w-full border border-rim bg-surface-input px-3 py-2 text-sm text-ink outline-none focus:border-gold focus:ring-1 focus:ring-gold';
const labelCls = 'mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-ink-4';

const fmtVnd = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(n);

const fmtDateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

// Add whole months to a 'yyyy-MM-dd' date, returning the same format.
function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setMonth(d.getMonth() + months);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export default function SendTrainingContractModal({ trainer, onClose, onSuccess }: Props) {
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loadingHorses, setLoadingHorses] = useState(false);

  const [horseId, setHorseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [months, setMonths] = useState('1');
  const [monthlyFee, setMonthlyFee] = useState('');
  const [ownerNote, setOwnerNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trainer) return;
    // Reset the form each time a trainer is picked.
    setHorseId(''); setStartDate(''); setMonths('1');
    setMonthlyFee(''); setOwnerNote(''); setError(null);
    setLoadingHorses(true);
    getMyHorses()
      .then((h) => setHorses(h ?? []))
      .catch(() => setError('Failed to load your horses.'))
      .finally(() => setLoadingHorses(false));
  }, [trainer]);

  // Live preview of the derived end date + total charged.
  const monthsNum = Number(months);
  const monthlyFeeNum = Number(monthlyFee);
  const validPreview =
    startDate !== '' && Number.isInteger(monthsNum) && monthsNum >= 1 &&
    monthlyFee !== '' && !isNaN(monthlyFeeNum) && monthlyFeeNum > 0;
  const endDate = validPreview ? addMonths(startDate, monthsNum) : '';
  const totalFee = validPreview ? monthlyFeeNum * monthsNum : 0;

  const handleSubmit = async () => {
    if (!trainer) return;
    if (!horseId) { setError('Please select a horse.'); return; }
    if (!startDate) { setError('Please pick a start date.'); return; }
    if (!Number.isInteger(monthsNum) || monthsNum < 1) { setError('Duration must be at least 1 month.'); return; }
    if (monthlyFee === '' || isNaN(monthlyFeeNum) || monthlyFeeNum <= 0) { setError('Monthly fee must be greater than 0.'); return; }

    setSubmitting(true); setError(null);
    try {
      await sendTrainingContract({
        horseId: Number(horseId),
        trainerId: trainer.id,
        startDate,
        endDate: addMonths(startDate, monthsNum),
        // Backend charges `fee` as the full escrow amount, so send the total.
        fee: monthlyFeeNum * monthsNum,
        feeType: 'MONTHLY',
        ownerNote: ownerNote.trim() || undefined,
      });
      onSuccess('Training request sent to the trainer.');
      onClose();
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to send training request.'));
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
        disabled={submitting || loadingHorses}
        className="bg-navy px-4 py-2 text-sm font-semibold text-on-blue transition-colors hover:bg-navy-hi disabled:opacity-50"
      >
        {submitting ? 'Sending…' : 'Send Request'}
      </button>
    </div>
  );

  const header = (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gold">Training Contract</p>
      <h3 className="font-serif text-base font-bold text-ink">
        Hire {trainer?.name ?? trainer?.fullName ?? 'Trainer'}
      </h3>
    </div>
  );

  return (
    <Modal open={!!trainer} onClose={onClose} title={header} backdrop="navy" size="md" footer={footer}>
      {loadingHorses ? (
        <p className="py-6 text-center text-sm text-ink-3">Loading…</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <label htmlFor="tc-horse" className={labelCls}>Horse</label>
            <select id="tc-horse" className={inputCls} value={horseId} onChange={(e) => setHorseId(e.target.value)}>
              <option value="">{horses.length ? 'Select a horse…' : 'You have no horses'}</option>
              {horses.map((h) => (
                <option key={h.id} value={h.id}>{h.horseName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="tc-start" className={labelCls}>Start Date</label>
              <input id="tc-start" type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label htmlFor="tc-months" className={labelCls}>Duration (months)</label>
              <input id="tc-months" type="number" min={1} step={1} className={inputCls} value={months} onChange={(e) => setMonths(e.target.value)} />
            </div>
          </div>

          <div>
            <label htmlFor="tc-monthly-fee" className={labelCls}>Monthly Fee (VND)</label>
            <input id="tc-monthly-fee" type="number" min={0} className={inputCls} value={monthlyFee} placeholder="e.g. 5000000" onChange={(e) => setMonthlyFee(e.target.value)} />
          </div>

          {/* Derived summary so the owner sees end date + total before sending. */}
          {validPreview && (
            <div className="border border-rim bg-surface-overlay/40 px-3 py-2.5 text-xs text-ink-2">
              <div className="flex justify-between">
                <span className="text-ink-4">Ends on</span>
                <span className="font-semibold text-ink">{fmtDateLabel(endDate)}</span>
              </div>
              <div className="mt-1 flex justify-between">
                <span className="text-ink-4">Total ({monthsNum} × {fmtVnd(monthlyFeeNum)})</span>
                <span className="tnum font-bold text-gold-hi">{fmtVnd(totalFee)}</span>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="tc-note" className={labelCls}>Note to Trainer (optional)</label>
            <textarea
              id="tc-note"
              rows={3}
              className={`${inputCls} resize-none`}
              value={ownerNote}
              placeholder="Any details or expectations for the trainer…"
              onChange={(e) => setOwnerNote(e.target.value)}
            />
          </div>

          <p className="text-[11px] text-ink-4">
            The total fee is held from your wallet only once the trainer accepts.
          </p>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-fail">{error}</p>}
    </Modal>
  );
}
