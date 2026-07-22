import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, PenLine } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  getMyContractsAsOwner, getMyContractsAsTrainer, cancelTrainingContract,
} from '@/api/trainingContractApi';
import { getErrorMessage } from '@/utils/errors';
import { isStatus } from '@/utils/trainingContractStatus';
import { useToast } from '@/components/ui/ToastProvider';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import RespondTrainingContractModal from '@/components/features/training-contract/RespondTrainingContractModal';
import Seo from '@/components/seo/Seo';
import type { TrainingContract } from '@/types';

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

const fmtDateTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

const fmtVnd = (n?: number) =>
  n != null ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(Number(n)) : '—';

const STATUS_CLS: Record<string, string> = {
  PENDING: 'bg-warn-subtle text-warn border-warn/30',
  ACTIVE: 'bg-ok-subtle text-ok border-ok/30',
  REJECTED: 'bg-fail-subtle text-fail border-fail/30',
  CANCELLED: 'bg-surface-overlay text-ink-3 border-rim',
  COMPLETED: 'bg-gold/10 text-gold border-gold/30',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending', ACTIVE: 'Active', REJECTED: 'Rejected', CANCELLED: 'Cancelled', COMPLETED: 'Completed',
};

// Whole-month span between two dates, for the "over N months" note.
function monthsBetween(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const a = new Date(start);
  const b = new Date(end);
  const m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return m > 0 ? m : null;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">{children}</p>
  );
}

function Party({ label, name, avatarUrl }: { label: string; name?: string; avatarUrl?: string }) {
  const initial = name?.charAt(0)?.toUpperCase() ?? '?';
  return (
    <div className="px-8 py-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-4">{label}</p>
      <div className="mt-2 flex items-center gap-3">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-navy/10 font-serif text-sm font-bold text-navy">
            {initial}
          </div>
        )}
        <p className="font-serif text-base font-bold text-ink">{name ?? '—'}</p>
      </div>
    </div>
  );
}

function Term({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-wider text-ink-4">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Signature({ role, name, signedAt, placeholder }: { role: string; name?: string; signedAt?: string | null; placeholder: string }) {
  return (
    <div className="px-8 py-5">
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-4">{role}</p>
      <p className="mt-3 border-b border-rim pb-1 font-serif text-lg italic text-ink">{name ?? '—'}</p>
      <p className="mt-1 flex items-center gap-1 text-[11px] text-ink-4">
        <PenLine size={11} /> {signedAt ? `Signed ${signedAt}` : placeholder}
      </p>
    </div>
  );
}

export default function TrainingContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const contractId = Number(id);
  const navigate = useNavigate();
  const addToast = useToast();
  const { user } = useAuth();
  const isTrainer = user?.role === 'TRAINER';

  const [contract, setContract] = useState<TrainingContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [responding, setResponding] = useState<'accept' | 'reject' | null>(null);

  // No single-contract endpoint exists — fetch the caller's list and pick by id.
  const fetchContract = useCallback(async () => {
    setLoading(true);
    try {
      const list = isTrainer ? await getMyContractsAsTrainer() : await getMyContractsAsOwner();
      const found = (list ?? []).find((c) => c.id === contractId) ?? null;
      setContract(found);
      setError(found ? '' : 'Contract not found.');
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Unable to load the contract.'));
    } finally { setLoading(false); }
  }, [contractId, isTrainer]);

  useEffect(() => { fetchContract(); }, [fetchContract]);

  const active = isStatus(contract?.status, 'ACTIVE');
  const handleCancel = async () => {
    if (!contract) return;
    setCancelLoading(true);
    try {
      await cancelTrainingContract(contract.id);
      addToast(active ? 'Training contract terminated.' : 'Training request cancelled.', 'success');
      setCancelOpen(false);
      fetchContract();
    } catch (e: unknown) {
      addToast(getErrorMessage(e, active ? 'Failed to terminate the contract.' : 'Failed to cancel the request.'), 'error');
    } finally { setCancelLoading(false); }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><LoadingSpinner size="lg" /></div>;
  }

  if (error || !contract) {
    return (
      <div className="px-8 py-10 text-center">
        <p className="text-sm text-ink-3">{error || 'Contract not found.'}</p>
        <button type="button" onClick={() => navigate(-1)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-navy hover:text-navy-hi">
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  const c = contract;
  const pending = isStatus(c.status, 'PENDING');
  const months = monthsBetween(c.startDate, c.endDate);

  return (
    <div className="px-8 py-6">
      <Seo title={`Training Contract #${c.id}`} description={`Training contract for ${c.horseName ?? 'a horse'}.`} />

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft size={15} /> Back
      </button>

      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden border border-rim bg-surface-raised shadow-card">
          {/* Document header */}
          <div className="border-b-2 border-gold/30 px-8 py-7 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Royal Derby</p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-ink">Training Contract</h1>
            <p className="mt-1 text-xs text-ink-4">
              No. {String(c.id).padStart(5, '0')} · Issued {fmtDate(c.createdAt)}
            </p>
            <div className="mt-3">
              <Badge className={STATUS_CLS[c.status] ?? 'bg-surface-overlay text-ink-3 border-rim'}>
                {STATUS_LABEL[c.status] ?? c.status}
              </Badge>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 divide-y divide-rim border-b border-rim sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            <Party label="Horse Owner" name={c.ownerName} />
            <Party label="Trainer" name={c.trainerName} avatarUrl={c.trainerAvatarUrl} />
          </div>

          {/* Subject horse */}
          <section className="border-b border-rim px-8 py-5">
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
          <section className="border-b border-rim px-8 py-5">
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
            <section className="space-y-3 border-b border-rim px-8 py-5">
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
            <Signature
              role="Trainer"
              name={c.trainerName}
              signedAt={fmtDateTime(c.acceptedAt)}
              placeholder={pending ? 'Awaiting response' : 'Not signed'}
            />
          </div>
        </div>

        {/* Actions for the pending and active stages */}
        {pending && (
          <div className="mt-4 flex flex-wrap justify-end gap-2.5">
            {isTrainer ? (
              <>
                <button
                  type="button"
                  onClick={() => setResponding('reject')}
                  className="inline-flex items-center gap-1.5 border border-fail/30 bg-fail-subtle px-4 py-2 text-sm font-semibold text-fail transition-colors hover:bg-fail hover:text-white"
                >
                  <XCircle size={14} /> Decline
                </button>
                <button
                  type="button"
                  onClick={() => setResponding('accept')}
                  className="inline-flex items-center gap-1.5 border border-ok/30 bg-ok-subtle px-4 py-2 text-sm font-semibold text-ok transition-colors hover:bg-ok hover:text-white"
                >
                  <CheckCircle2 size={14} /> Accept
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setCancelOpen(true)}
                className="inline-flex items-center gap-1.5 border border-fail/30 px-4 py-2 text-sm font-semibold text-fail transition-colors hover:bg-fail-subtle"
              >
                <XCircle size={14} /> Cancel Request
              </button>
            )}
          </div>
        )}
        {active && !isTrainer && (
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
            <p className="text-xs text-ink-4">Ends automatically on {fmtDate(c.endDate)} — the fee is then paid to the trainer.</p>
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="inline-flex items-center gap-1.5 border border-fail/30 px-4 py-2 text-sm font-semibold text-fail transition-colors hover:bg-fail-subtle"
            >
              <XCircle size={14} /> Terminate Contract
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
        loading={cancelLoading}
        title={active ? 'Terminate Training Contract?' : 'Cancel Training Request?'}
        message={
          active
            ? `Ending this contract early refunds 50% of the fee to you and pays 20% to ${c.trainerName ?? 'the trainer'} as compensation for work already done. The remaining 30% is retained as an early-termination fee. This cannot be undone.`
            : `Cancel the request to hire ${c.trainerName ?? 'this trainer'} for "${c.horseName ?? 'this horse'}"?`
        }
        confirmLabel={active ? 'Terminate Contract' : 'Cancel Request'}
        variant="danger"
      />

      <RespondTrainingContractModal
        contract={responding ? c : null}
        action={responding ?? 'accept'}
        onClose={() => setResponding(null)}
        onSuccess={(msg) => { addToast(msg, 'success'); fetchContract(); }}
      />
    </div>
  );
}
