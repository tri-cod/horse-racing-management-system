import { useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, PenLine } from 'lucide-react';
import { cancelTrainingContract } from '@/api/trainingContractApi';
import { getErrorMessage } from '@/utils/errors';
import { isStatus } from '@/utils/trainingContractStatus';
import { useToast } from '@/components/ui/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import RespondTrainingContractModal from './RespondTrainingContractModal';
import type { TrainingContract } from '@/types';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;
const fmtVnd = (n?: number) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n)) : '—';

const STATUS_CLS: Record<string, string> = {
  PENDING: 'bg-warn-subtle text-warn border-warn/30', ACTIVE: 'bg-ok-subtle text-ok border-ok/30',
  REJECTED: 'bg-fail-subtle text-fail border-fail/30', CANCELLED: 'bg-surface-overlay text-ink-3 border-rim',
  COMPLETED: 'bg-gold/10 text-gold border-gold/30',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending', ACTIVE: 'Active', REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed',
};

function monthsBetween(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const a = new Date(start), b = new Date(end);
  const m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return m > 0 ? m : null;
}

function SectionTitle({ children }: { children: string }) {
  return <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{children}</p>;
}
function Party({ label, name, avatarUrl }: { label: string; name?: string; avatarUrl?: string }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className="px-6 py-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-4">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">{initial}</div>
        )}
        <p className="font-serif text-base font-bold text-ink">{name ?? '—'}</p>
      </div>
    </div>
  );
}
function Term({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-4">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}
function Signature({ role, name, signedAt, placeholder }: { role: string; name?: string; signedAt?: string | null; placeholder: string }) {
  return (
    <div className="px-6 py-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4">{role}</p>
      <p className="mt-3 border-b border-rim pb-1 font-serif text-lg italic text-ink">{name ?? '—'}</p>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-4">
        <PenLine size={11} /> {signedAt ? `Signed ${signedAt}` : placeholder}
      </p>
    </div>
  );
}

interface Props {
  contract: TrainingContract | null;
  perspective: 'owner' | 'trainer';
  onClose: () => void;
  onChanged: () => void;
}

export default function TrainingContractDetailModal({ contract, perspective, onClose, onChanged }: Props) {
  const addToast = useToast();
  const isTrainer = perspective === 'trainer';
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [responding, setResponding] = useState<'accept' | 'reject' | null>(null);

  const c = contract;
  const pending = c ? isStatus(c.status, 'PENDING') : false;
  const active = c ? isStatus(c.status, 'ACTIVE') : false;
  const months = c ? monthsBetween(c.startDate, c.endDate) : null;

  const handleCancel = async () => {
    if (!c) return;
    setCancelLoading(true);
    try {
      await cancelTrainingContract(c.id);
      addToast(active ? 'Training contract terminated.' : 'Training request cancelled.', 'success');
      setCancelOpen(false);
      onChanged();
      onClose();
    } catch (e: unknown) {
      addToast(getErrorMessage(e, active ? 'Failed to terminate the contract.' : 'Failed to cancel the request.'), 'error');
    } finally { setCancelLoading(false); }
  };

  const header = c && (
    <div className="text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Royal Derby</p>
      <h3 className="mt-0.5 font-serif text-lg font-bold text-ink">Training Contract</h3>
      <p className="mt-0.5 text-[11px] text-ink-4">No. {String(c.id).padStart(5, '0')} · Issued {fmtDate(c.createdAt)}</p>
    </div>
  );

  const footer = c && (pending || (active && !isTrainer)) && (
    <div className="flex flex-wrap justify-end gap-2.5">
      {isTrainer ? (
        <>
          <button type="button" onClick={() => setResponding('reject')}
            className="inline-flex items-center gap-1.5 border border-fail/30 bg-fail-subtle px-4 py-2 text-sm font-semibold text-fail transition-colors hover:bg-fail hover:text-white">
            <XCircle size={14} /> Decline
          </button>
          <button type="button" onClick={() => setResponding('accept')}
            className="inline-flex items-center gap-1.5 border border-ok/30 bg-ok-subtle px-4 py-2 text-sm font-semibold text-ok transition-colors hover:bg-ok hover:text-white">
            <CheckCircle2 size={14} /> Accept
          </button>
        </>
      ) : (
        <button type="button" onClick={() => setCancelOpen(true)}
          className="inline-flex items-center gap-1.5 border border-fail/30 px-4 py-2 text-sm font-semibold text-fail transition-colors hover:bg-fail-subtle">
          <XCircle size={14} /> {active ? 'Terminate Contract' : 'Cancel Request'}
        </button>
      )}
    </div>
  );

  return (
    <>
      <Modal open={!!c} onClose={onClose} title={header} backdrop="navy" size="xl" bodyClassName="p-0" footer={footer || undefined}>
        {c && (
          <div>
            {/* Status */}
            <div className="border-b border-rim px-6 py-3 text-center">
              <Badge className={STATUS_CLS[c.status] ?? 'bg-surface-overlay text-ink-3 border-rim'}>
                {STATUS_LABEL[c.status] ?? c.status}
              </Badge>
            </div>

            {/* Parties */}
            <div className="grid grid-cols-1 divide-y divide-rim border-b border-rim sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <Party label="Horse Owner" name={c.ownerName} />
              <Party label="Trainer" name={c.trainerName} avatarUrl={c.trainerAvatarUrl} />
            </div>

            {/* Subject horse */}
            <section className="border-b border-rim px-6 py-5">
              <SectionTitle>Subject Horse</SectionTitle>
              <div className="flex items-center gap-3">
                {c.horseAvatarUrl ? (
                  <img src={c.horseAvatarUrl} alt={c.horseName} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-base font-bold text-navy">
                    {c.horseName?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                )}
                <p className="font-serif text-lg font-bold text-ink">{c.horseName ?? `Horse #${c.horseId}`}</p>
              </div>
            </section>

            {/* Terms */}
            <section className="border-b border-rim px-6 py-5">
              <SectionTitle>Terms</SectionTitle>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                <Term label="Start Date" value={fmtDate(c.startDate)} />
                <Term label="End Date" value={fmtDate(c.endDate)} />
                <Term label="Duration" value={months != null ? `${months} month${months !== 1 ? 's' : ''}` : '—'} />
                <Term label="Total Fee" value={<span className="text-gold-hi">{fmtVnd(c.fee)}</span>} />
                <Term label="Billing" value={c.feeType === 'MONTHLY' ? 'Monthly' : 'Per period'} />
                <Term label="Payment" value="Escrowed on acceptance" />
              </dl>
            </section>

            {/* Notes */}
            {(c.ownerNote || c.trainerNote) && (
              <section className="space-y-3 border-b border-rim px-6 py-5">
                <SectionTitle>Notes</SectionTitle>
                {c.ownerNote && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4">From Owner</p>
                    <p className="mt-0.5 text-sm text-ink-2">{c.ownerNote}</p>
                  </div>
                )}
                {c.trainerNote && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4">From Trainer</p>
                    <p className="mt-0.5 text-sm text-ink-2">{c.trainerNote}</p>
                  </div>
                )}
              </section>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-1 divide-y divide-rim sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <Signature role="Horse Owner" name={c.ownerName} signedAt={fmtDateTime(c.createdAt)} placeholder="On submission" />
              <Signature role="Trainer" name={c.trainerName} signedAt={fmtDateTime(c.acceptedAt)}
                placeholder={pending ? 'Awaiting response' : 'Not signed'} />
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={cancelLoading}
        title={active ? 'Terminate Training Contract?' : 'Cancel Training Request?'}
        message={
          active
            ? `End this contract with ${c?.trainerName ?? 'this trainer'} for "${c?.horseName ?? 'this horse'}" early? The escrowed fee will be split: 50% refunded to you, 20% paid to the trainer as compensation, and 30% retained by the platform.`
            : `Cancel the request to hire ${c?.trainerName ?? 'this trainer'} for "${c?.horseName ?? 'this horse'}"?`
        }
        confirmLabel={active ? 'Terminate Contract' : 'Cancel Request'}
        variant="danger"
      />

      <RespondTrainingContractModal
        contract={responding ? c : null}
        action={responding ?? 'accept'}
        onClose={() => setResponding(null)}
        onSuccess={(msg) => { addToast(msg, 'success'); onChanged(); onClose(); }}
      />
    </>
  );
}
